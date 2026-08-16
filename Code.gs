/**
 * MY SKY SYSTEM 2026
 * COMPLETE CODE.GS
 *
 * Includes:
 * - Web App
 * - Page Include System
 * - User Authentication
 * - Account Management
 * - Login Session / Logout
 * - Calculation History
 * - Team / Superior History Visibility
 * - Duplicate Username Prevention
 * - Task Search
 * - Monthly Rebate Calculator support
 * - Rebate Checker support
 */

// ============================================================
// WEB APP
// ============================================================

function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("My Sky System 2026")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}


// ============================================================
// INCLUDE HTML PAGE
// ============================================================

function includePage(filename) {
  try {
    return HtmlService
      .createHtmlOutputFromFile(filename)
      .getContent();

  } catch (e) {
    return (
      "<div style='color:red;padding:20px;'>" +
      "<b>ERROR:</b> File '" +
      filename +
      "' not found." +
      "</div>"
    );
  }
}


// ============================================================
// DROPDOWN HANDLER
// ============================================================

function getUserDropdownData() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Users");

  if (!sheet) {
    return {
      levels: [],
      superiors: []
    };
  }

  const data = sheet.getDataRange().getValues();

  let levels = [];
  let superiors = [];

  for (let i = 1; i < data.length; i++) {

    // Column H = Level
    if (data[i][7] !== "" && data[i][7] !== null) {
      levels.push(data[i][7]);
    }

    // Column I = Superior
    if (data[i][8] !== "" && data[i][8] !== null) {
      superiors.push(data[i][8]);
    }
  }

  return {
    levels: [...new Set(levels)].sort(),
    superiors: [...new Set(superiors)].sort()
  };
}


// ============================================================
// AUTHENTICATION
// ============================================================

function checkLogin(username, password) {

  const sh = SpreadsheetApp
    .getActive()
    .getSheetByName("Users");

  if (!sh) {
    return {
      status: "failed",
      message: "Users sheet not found."
    };
  }

  const lastRow = sh.getLastRow();

  if (lastRow < 2) {
    return {
      status: "failed",
      message: "No users found."
    };
  }

  const data = sh
    .getRange(2, 1, lastRow - 1, 9)
    .getValues();

  const enteredUsername =
    username !== null && username !== undefined
      ? username.toString().trim()
      : "";

  const enteredPassword =
    password !== null && password !== undefined
      ? password.toString()
      : "";

  for (let i = 0; i < data.length; i++) {

    const row = data[i];

    const storedUsername =
      row[0] !== null && row[0] !== undefined
        ? row[0].toString().trim()
        : "";

    const storedPassword =
      row[1] !== null && row[1] !== undefined
        ? row[1].toString()
        : "";

    if (
      storedUsername === enteredUsername &&
      storedPassword === enteredPassword
    ) {

      // Column F = Login timestamp
      if (
        row[5] !== "" &&
        row[5] !== false &&
        row[5] !== null
      ) {

        return {
          status: "locked",
          message: "ACCOUNT LOCKED: Already logged in."
        };
      }

      const loginDate = new Date();

      sh
        .getRange(i + 2, 6)
        .setValue(loginDate);

      const role =
        row[2] !== null && row[2] !== undefined
          ? row[2].toString().trim()
          : "";

      const name =
        row[3] !== null && row[3] !== undefined
          ? row[3].toString().trim()
          : "";

      const level = row[4];

      const superior =
        row[6] !== null && row[6] !== undefined
          ? row[6].toString().trim()
          : "";

      // Store active user in cache
      CacheService
        .getUserCache()
        .put(
          "activeUserName",
          name,
          21600
        );

      SpreadsheetApp.flush();

      return {
        status: "success",

        role: role,

        name: name,

        level: level,

        superior: superior,

        username: row[0],

        password: row[1],

        loginTime: loginDate.getTime(),

        // Admin and Semi need additional choice/navigation
        needsChoice:
          role === "Admin" ||
          role === "Semi"
      };
    }
  }

  return {
    status: "failed",
    message: "Invalid credentials."
  };
}


// ============================================================
// ACCOUNT MANAGEMENT
// ============================================================

function getAllUsers() {

  const sh = SpreadsheetApp
    .getActive()
    .getSheetByName("Users");

  if (!sh) return [];

  if (sh.getLastRow() < 2) {
    return [];
  }

  const data = sh
    .getRange(
      2,
      1,
      sh.getLastRow() - 1,
      7
    )
    .getValues();

  return data.map(function (r) {

    return [
      r[0], // Username
      r[1], // Password
      r[2], // Role
      r[3], // Name
      r[4], // Level
      r[6]  // Superior
    ];

  });
}


// ============================================================
// MANAGE ACCOUNT
// ============================================================

function manageAccount(action, userData) {

  const sh = SpreadsheetApp
    .getActive()
    .getSheetByName("Users");

  if (!sh) {
    return "ERROR";
  }

  userData = userData || {};

  const lastRow = sh.getLastRow();

  const dataRows =
    lastRow >= 2
      ? sh.getRange(
          2,
          1,
          lastRow - 1,
          1
        ).getValues().flat()
      : [];

  const existingList =
    dataRows.map(function (u) {
      return u
        .toString()
        .toLowerCase()
        .trim();
    });

  const newU =
    userData.username !== undefined
      ? userData.username
          .toString()
          .toLowerCase()
          .trim()
      : "";

  const oldU =
    userData.oldUsername
      ? userData.oldUsername
          .toString()
          .toLowerCase()
          .trim()
      : "";


  // ----------------------------------------------------------
  // ADD
  // ----------------------------------------------------------

  if (action === "add") {

    if (existingList.includes(newU)) {
      return "DUPLICATE_ERROR";
    }

    sh.appendRow([
      userData.username || "",
      userData.password || "",
      userData.role || "",
      userData.name || "",
      userData.level || "",
      "",
      userData.superior || ""
    ]);

    return "SUCCESS_ADD";
  }


  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

  if (action === "update") {

    if (
      newU !== oldU &&
      existingList.includes(newU)
    ) {
      return "DUPLICATE_ERROR";
    }

    const rowIndex =
      dataRows
        .map(function (u) {
          return u.toString().trim();
        })
        .indexOf(
          userData.oldUsername
        );

    if (rowIndex === -1) {
      return "NOT_FOUND";
    }

    const row = rowIndex + 2;

    sh
      .getRange(row, 1, 1, 5)
      .setValues([[
        userData.username || "",
        userData.password || "",
        userData.role || "",
        userData.name || "",
        userData.level || ""
      ]]);

    // Column G = Superior
    sh
      .getRange(row, 7)
      .setValue(
        userData.superior || ""
      );

    return "SUCCESS_UPDATE";
  }


  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  if (action === "delete") {

    const rowIndex =
      dataRows
        .map(function (u) {
          return u.toString().trim();
        })
        .indexOf(
          userData.oldUsername
        );

    if (rowIndex !== -1) {

      sh.deleteRow(
        rowIndex + 2
      );

      return "SUCCESS_DELETE";
    }
  }

  return "ERROR";
}


// ============================================================
// UPDATE USER CREDENTIALS
// ============================================================

function updateUserCredentials(
  oldU,
  newU,
  newP
) {

  const sh = SpreadsheetApp
    .getActive()
    .getSheetByName("Users");

  if (!sh) {
    return "ERROR";
  }

  const lastRow = sh.getLastRow();

  const dataRows =
    lastRow >= 2
      ? sh.getRange(
          2,
          1,
          lastRow - 1,
          1
        ).getValues().flat()
      : [];

  const existingList =
    dataRows.map(function (u) {
      return u
        .toString()
        .toLowerCase()
        .trim();
    });

  const formattedNew =
    newU
      .toString()
      .toLowerCase()
      .trim();

  const formattedOld =
    oldU
      .toString()
      .toLowerCase()
      .trim();

  if (
    formattedNew !== formattedOld &&
    existingList.includes(formattedNew)
  ) {
    return "DUPLICATE_ERROR";
  }

  const idx =
    dataRows
      .map(function (u) {
        return u.toString().trim();
      })
      .indexOf(oldU);

  if (idx !== -1) {

    sh
      .getRange(idx + 2, 1)
      .setValue(newU);

    sh
      .getRange(idx + 2, 2)
      .setValue(newP);

    return "SUCCESS_BADGE";
  }

  return "NOT_FOUND";
}


// ============================================================
// CALCULATION HISTORY
// ============================================================

function recordCalculation(
  text,
  user,
  level,
  superior
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  let sheet =
    ss.getSheetByName(
      "CalculationHistory"
    );

  if (!sheet) {

    sheet =
      ss.insertSheet(
        "CalculationHistory"
      );

    // Create headers when the sheet is
    // automatically created.
    sheet
      .getRange(1, 1, 1, 5)
      .setValues([[
        "Timestamp",
        "User",
        "Level",
        "Calculation",
        "Superior"
      ]]);
  }

  sheet.appendRow([
    new Date(),
    user || "N/A",
    level || "N/A",
    text || "",
    superior || "N/A"
  ]);

  return true;
}


// ============================================================
// GET CHOICE HISTORY
// ============================================================

function getChoiceHistory(
  viewerName,
  viewerRole,
  viewerSuperior
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(
      "CalculationHistory"
    );

  if (!sheet) {
    return [];
  }

  if (sheet.getLastRow() < 2) {
    return [];
  }

  const data =
    sheet
      .getDataRange()
      .getValues();

  const history = [];

  const tz =
    Session.getScriptTimeZone();

  const vName =
    viewerName
      ? viewerName
          .toString()
          .trim()
          .toLowerCase()
      : "";

  const vRole =
    viewerRole
      ? viewerRole
          .toString()
          .trim()
      : "";

  const vSup =
    viewerSuperior
      ? viewerSuperior
          .toString()
          .trim()
          .toLowerCase()
      : "";


  // Process newest first
  for (
    let i = data.length - 1;
    i >= 1;
    i--
  ) {

    const rowAgent =
      data[i][1]
        ? data[i][1]
            .toString()
            .trim()
            .toLowerCase()
        : "";

    const rowSup =
      data[i][4]
        ? data[i][4]
            .toString()
            .trim()
            .toLowerCase()
        : "";

    const rawText =
      data[i][3] || "";

    let canView = false;


    // --------------------------------------------------------
    // ADMIN
    // --------------------------------------------------------

    if (vRole === "Admin") {

      canView = true;

    }


    // --------------------------------------------------------
    // SEMI
    // --------------------------------------------------------

    else if (vRole === "Semi") {

      if (
        rowSup === vName ||
        (
          vSup !== "" &&
          rowSup === vSup
        ) ||
        rowAgent === vName
      ) {

        canView = true;
      }

    }


    // --------------------------------------------------------
    // NORMAL USER
    // --------------------------------------------------------

    else {

      if (
        rowAgent === vName
      ) {

        canView = true;
      }
    }


    if (!canView) {
      continue;
    }


    // ========================================================
    // EXTRACT ACCOUNT NUMBER
    // ========================================================

    const accMatch =
      rawText.match(
        /\b(?:Account Number|Acc|ACCOUNT NUMBER)[:\s#]*([0-9A-Z-]+)/i
      );


    // ========================================================
    // EXTRACT REFERENCE
    // ========================================================

    const refMatch =
      rawText.match(
        /\b(?:Reference|Ref|REFERENCE)[:\s#]*([A-Z0-9-]+)/i
      );


    // ========================================================
    // EXTRACT AMOUNT
    // ========================================================

    const amtMatch =
      rawText.match(
        /\b(?:Total Amount|Amount|REBATE AMOUNT|TOTAL REBATE|ESTIMATED REBATE AMOUNT)[:\s#$]*([0-9,.]+)/i
      );


    const acc =
      accMatch
        ? accMatch[1].trim()
        : "N/A";

    const ref =
      refMatch
        ? refMatch[1].trim()
        : "N/A";

    const amt =
      amtMatch
        ? amtMatch[1].trim()
        : "0.00";


    const timestamp =
      data[i][0]
        ? new Date(data[i][0])
        : new Date();


    history.push({

      acc: acc,

      ref: ref,

      amt: amt,

      name: data[i][1],

      superior:
        data[i][4] || "N/A",

      timestamp:
        Utilities.formatDate(
          timestamp,
          tz,
          "MM/dd/yy hh:mm a"
        ),

      date:
        Utilities.formatDate(
          timestamp,
          tz,
          "MM/dd hh:mm a"
        ),

      header:
        `${acc} | ${ref} | ${amt}`,

      text:
        rawText,

      fullDetails:
        rawText
    });


    // Maximum history returned
    if (history.length >= 250) {
      break;
    }
  }

  return history;
}


// ============================================================
// USER HISTORY
// ============================================================

function getUserHistory(
  name,
  role,
  superior
) {

  return getChoiceHistory(
    name,
    role,
    superior
  );
}


// ============================================================
// CLEANUP OLD HISTORY
// ============================================================

function cleanupOldHistory() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(
      "CalculationHistory"
    );

  if (!sheet) {
    return;
  }

  const lastRow =
    sheet.getLastRow();

  // Keep latest 2,000 records
  const maxRows = 2000;

  if (
    lastRow > maxRows
  ) {

    // Keep header row
    // and newest records.
    sheet.deleteRows(
      2,
      lastRow - maxRows
    );
  }
}


// ============================================================
// TASK SEARCH
// ============================================================

function searchTask(
  taskName,
  keyword
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sh =
    ss.getSheetByName(taskName);

  if (
    !sh ||
    sh.getLastRow() < 1
  ) {
    return [];
  }


  // ----------------------------------------------------------
  // COLUMN CONFIGURATION
  // ----------------------------------------------------------

  const config = {

    "Spiel": {
      cols: [2, 3, 4]
    },

    "CTS": {
      cols: [
        2, 3, 4, 5, 6,
        7, 8, 9, 12, 14
      ]
    },

    "MSP": {
      cols: [
        2, 3, 4, 5, 6, 7
      ]
    },

    "ZIP": {
      cols: [
        2, 3, 4, 5, 6, 7, 8
      ]
    },

    "Plan": {
      cols: [
        2, 3, 4, 5, 6,
        7, 8, 9, 10,
        11, 12
      ]
    },

    "Aftersales Policies": {
      cols: [
        2, 3, 4, 5
      ]
    },

    "Process": {
      cols: [
        2, 3, 4
      ]
    },

    "Updates (Pending)": {
      cols: [
        2, 3, 4
      ]
    },

    "OTHERS (Pending)": {
      cols: [
        2, 3, 4
      ]
    }
  };


  const fullData =
    sh
      .getDataRange()
      .getValues();


  const targetCols =
    config[taskName]
      ? config[taskName].cols
      : null;


  const k =
    keyword
      ? keyword
          .toString()
          .toLowerCase()
          .trim()
      : "";


  function filterRow(row) {

    if (!targetCols) {
      return row;
    }

    return targetCols.map(
      function (colIdx) {
        return row[colIdx - 1];
      }
    );
  }


  const results =
    fullData
      .slice(1)
      .reduce(
        function (acc, row) {

          if (
            !k ||
            row
              .join(" ")
              .toLowerCase()
              .includes(k)
          ) {

            acc.push(
              filterRow(row)
            );
          }

          return acc;

        },
        []
      );


  return [
    filterRow(fullData[0]),
    ...results.slice(0, 100)
  ];
}


// ============================================================
// LOGGED-IN USERS
// ============================================================

function getLoggedInUsersList() {

  const sh =
    SpreadsheetApp
      .getActive()
      .getSheetByName("Users");

  if (!sh) {
    return [];
  }

  const lastRow =
    sh.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const data =
    sh
      .getRange(
        2,
        1,
        lastRow - 1,
        7
      )
      .getValues();

  const tz =
    Session.getScriptTimeZone();


  return data
    .filter(function (r) {
      return (
        r[5] !== "" &&
        r[5] !== null &&
        r[5] !== false
      );
    })
    .map(function (r) {

      return {

        username: r[0],

        name: r[3],

        role: r[2],

        level: r[4],

        loginTime:
          r[5] instanceof Date
            ? Utilities.formatDate(
                r[5],
                tz,
                "hh:mm a"
              )
            : "Active"
      };

    });
}


// ============================================================
// LOGOUT USER
// ============================================================

function logoutUser(u) {

  const sh =
    SpreadsheetApp
      .getActive()
      .getSheetByName("Users");

  if (!sh) {
    return {
      status: "error"
    };
  }

  const lastRow =
    sh.getLastRow();

  if (lastRow < 2) {
    return {
      status: "error"
    };
  }

  const data =
    sh
      .getRange(
        2,
        1,
        lastRow - 1,
        1
      )
      .getValues()
      .flat();

  const idx =
    data.indexOf(u);

  if (idx !== -1) {

    sh
      .getRange(
        idx + 2,
        6
      )
      .setValue("");

    return {
      status: "success"
    };
  }

  return {
    status: "error"
  };
}


// ============================================================
// FORCE LOGOUT
// ============================================================

function forceLogoutUser(
  targetUser
) {

  const sh =
    SpreadsheetApp
      .getActive()
      .getSheetByName("Users");

  if (!sh) {
    return {
      status: "error"
    };
  }

  const lastRow =
    sh.getLastRow();

  if (lastRow < 2) {
    return {
      status: "error"
    };
  }

  const data =
    sh
      .getRange(
        2,
        1,
        lastRow - 1,
        1
      )
      .getValues()
      .flat();

  const idx =
    data.indexOf(targetUser);

  if (idx !== -1) {

    sh
      .getRange(
        idx + 2,
        6
      )
      .setValue("");

    return {
      status: "success"
    };
  }

  return {
    status: "error"
  };
}


// ============================================================
// OPTIONAL: GET CURRENT USER FROM CACHE
// ============================================================

function getActiveUserName() {

  return CacheService
    .getUserCache()
    .get("activeUserName") || "";
}


// ============================================================
// OPTIONAL: INITIALIZE CALCULATION HISTORY SHEET
// ============================================================

function initializeCalculationHistory() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  let sheet =
    ss.getSheetByName(
      "CalculationHistory"
    );

  if (!sheet) {

    sheet =
      ss.insertSheet(
        "CalculationHistory"
      );
  }


  if (sheet.getLastRow() === 0) {

    sheet
      .getRange(
        1,
        1,
        1,
        5
      )
      .setValues([[
        "Timestamp",
        "User",
        "Level",
        "Calculation",
        "Superior"
      ]]);
  }

  return true;
}