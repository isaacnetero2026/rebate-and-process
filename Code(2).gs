
  MY SKY SYSTEM 2026 - FULL VERSION
  Shared Team History, Strict Duplicate Prevention & Column-Specific Search
 

function doGet() {
  return HtmlService.createTemplateFromFile(Index)
    .evaluate()
    .setTitle(My Sky System 2026)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function includePage(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return div style='colorred; padding20px;'bERRORb File ' + filename + ' not found.div;
  }
}

 --- DROPDOWN HANDLER ---
function getUserDropdownData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(Users);
  if (!sheet) return { levels [], superiors [] };
  const data = sheet.getDataRange().getValues();
  let levels = [];
  let superiors = [];
  for (let i = 1; i  data.length; i++) {
    if (data[i][7]) levels.push(data[i][7]);  Column H
    if (data[i][8]) superiors.push(data[i][8]);  Column I
  }
  return {
    levels [...new Set(levels)].sort(),
    superiors [...new Set(superiors)].sort()
  };
}

 --- AUTHENTICATION ---
function checkLogin(username, password) {
  const sh = SpreadsheetApp.getActive().getSheetByName(Users);
  const data = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 9).getValues();
  for (let i = 0; i  data.length; i++) {
    const row = data[i];
    if (row[0] == username && row[1] == password) {
      if (row[5] !==  && row[5] !== false && row[5] !== null) {
        return { status locked, message ACCOUNT LOCKED Already logged in. };
      }
      const loginDate = new Date();
      sh.getRange(i + 2, 6).setValue(loginDate); 
      
      const role = row[2].toString().trim();
      const name = row[3].toString().trim();
      const superior = row[6].toString().trim(); 
      
      CacheService.getUserCache().put(activeUserName, name, 21600);
      SpreadsheetApp.flush();
      
      return {
        status success,
        role role,
        name name,
        level row[4], 
        superior superior, 
        username row[0],
        password row[1],
        loginTime loginDate.getTime(),
        needsChoice (role === Admin  role === Semi)
      };
    }
  }
  return { status failed, message Invalid credentials. };
}

 --- ACCOUNT MANAGEMENT ---
function getAllUsers() {
  const sh = SpreadsheetApp.getActive().getSheetByName(Users);
  if (sh.getLastRow()  2) return [];
  const data = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
  return data.map(r = [r[0], r[1], r[2], r[3], r[4], r[6]]);
}

function manageAccount(action, userData) {
  const sh = SpreadsheetApp.getActive().getSheetByName(Users);
  const dataRows = sh.getRange(2, 1, Math.max(sh.getLastRow()-1, 1), 1).getValues().flat();
  const existingList = dataRows.map(u = u.toString().toLowerCase().trim());
  const newU = userData.username.toString().toLowerCase().trim();
  const oldU = userData.oldUsername  userData.oldUsername.toString().toLowerCase().trim()  ;

  if (action === add) {
    if (existingList.includes(newU)) return DUPLICATE_ERROR;
    sh.appendRow([userData.username, userData.password, userData.role, userData.name, userData.level, , userData.superior]);
    return SUCCESS_ADD;
  }
 
  if (action === update) {
    if (newU !== oldU && existingList.includes(newU)) return DUPLICATE_ERROR;
    const rowIndex = dataRows.map(u = u.toString().trim()).indexOf(userData.oldUsername);
    if (rowIndex === -1) return NOT_FOUND;
    const row = rowIndex + 2;
    sh.getRange(row, 1, 1, 5).setValues([[userData.username, userData.password, userData.role, userData.name, userData.level]]);
    sh.getRange(row, 7).setValue(userData.superior);
    return SUCCESS_UPDATE;
  }
 
  if (action === delete) {
    const rowIndex = dataRows.map(u = u.toString().trim()).indexOf(userData.oldUsername);
    if (rowIndex !== -1) { sh.deleteRow(rowIndex + 2); return SUCCESS_DELETE; }
  }
  return ERROR;
}

function updateUserCredentials(oldU, newU, newP) {
  const sh = SpreadsheetApp.getActive().getSheetByName(Users);
  const dataRows = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().flat();
  const existingList = dataRows.map(u = u.toString().toLowerCase().trim());
  const formattedNew = newU.toString().toLowerCase().trim();
  const formattedOld = oldU.toString().toLowerCase().trim();

  if (formattedNew !== formattedOld && existingList.includes(formattedNew)) return DUPLICATE_ERROR; 

  const idx = dataRows.map(u = u.toString().trim()).indexOf(oldU);
  if (idx !== -1) {
    sh.getRange(idx + 2, 1).setValue(newU);
    sh.getRange(idx + 2, 2).setValue(newP);
    return SUCCESS_BADGE;
  }
  return NOT_FOUND;
}

 --- CALCULATION RECORDING ---
function recordCalculation(text, user, level, superior) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CalculationHistory)  ss.insertSheet(CalculationHistory);
  sheet.appendRow([new Date(), user, level, text, superior  NA]);
  return true;
}

 --- FIXED TEAM & CHOICE HISTORY ---
function getChoiceHistory(viewerName, viewerRole, viewerSuperior) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CalculationHistory);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const history = [];
  const tz = Session.getScriptTimeZone();
  
  const vName = viewerName  viewerName.toString().trim().toLowerCase()  ;
  const vRole = viewerRole  viewerRole.toString().trim()  ;
  const vSup  = viewerSuperior  viewerSuperior.toString().trim().toLowerCase()  ;

  for (let i = data.length - 1; i = 1; i--) {
    const rowAgent = data[i][1]  data[i][1].toString().trim().toLowerCase()  ; 
    const rowSup   = data[i][4]  data[i][4].toString().trim().toLowerCase()  ; 
    const rawText  = data[i][3]  ; 

    let canView = false;
    if (vRole === Admin) {
      canView = true;
    } else if (vRole === Semi) {
      if (rowSup === vName  (vSup !==  && rowSup === vSup)  rowAgent === vName) {
        canView = true;
      }
    } else {
      if (rowAgent === vName) canView = true;
    }

    if (canView) {
       --- UPDATE THESE LINES IN getChoiceHistory (Code.gs) ---
       b ensures it only looks for the start of the label Acc or Account Number
      const accMatch = rawText.match(b(Account NumberAccACCOUNT NUMBER)[s#]([0-9A-Z-]+)i);
      const refMatch = rawText.match(b(ReferenceRefREFERENCE)[s#]([A-Z0-9-]+)i);
      const amtMatch = rawText.match(b(Total AmountAmountREBATE AMOUNTTOTAL REBATE)[s#$]([0-9,.]+)i);

       This ensures if a match is found, we take the result, otherwise default to NA
      const acc = accMatch  accMatch[1].trim()  NA;
      const ref = refMatch  refMatch[1].trim()  NA;
  const amt = amtMatch  amtMatch[1].trim()  0.00;

      history.push({
        acc acc, ref ref, amt amt,
        name data[i][1], superior data[i][4]  NA,
        timestamp Utilities.formatDate(new Date(data[i][0]), tz, MMddyy hhmm a),
        date Utilities.formatDate(new Date(data[i][0]), tz, MMdd hhmm a),
        header `${acc}  ${ref}  ${amt}`,
        text rawText,
        fullDetails rawText
      });
    }
    if (history.length = 250) break;
  }
  return history;
}

 --- NEW CLEANUP FUNCTION ---
function cleanupOldHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CalculationHistory);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  const maxRows = 2000;  Keep only latest 2000
  if (lastRow  maxRows) {
    sheet.deleteRows(2, lastRow - maxRows);
  }
}

function getUserHistory(name, level, superior) {
  return getChoiceHistory(name, level, superior);
}

 --- SEARCH TASK ---
function searchTask(taskName, keyword) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(taskName);
  if (!sh  sh.getLastRow()  1) return [];

  const config = {
    Spiel { cols [2, 3, 4] },
    CTS { cols [2, 3, 4, 5, 6, 7, 8, 9, 12, 14] },
    MSP { cols [2, 3, 4, 5, 6, 7] },
    ZIP { cols [2, 3, 4, 5, 6, 7, 8] },
    Plan { cols [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    Aftersales Policies { cols [2, 3, 4, 5] },
    Process { cols [2, 3, 4] },
    Updates (Pending) { cols [2, 3, 4] },
    OTHERS (Pending) { cols [2, 3, 4] }
  };

  const fullData = sh.getDataRange().getValues();
  const targetCols = config[taskName]  config[taskName].cols  null;
  const k = keyword  keyword.toLowerCase().trim()  ;

  const filterRow = (row) = {
    if (!targetCols) return row;
    return targetCols.map(colIdx = row[colIdx - 1]);
  };

  const results = fullData.slice(1).reduce((acc, row) = {
    if (!k  row.join( ).toLowerCase().includes(k)) { acc.push(filterRow(row)); }
    return acc;
  }, []);

  return [filterRow(fullData[0]), ...results.slice(0, 100)];
}

 --- LOGOUT & SESSION ---
function getLoggedInUsersList() {
  const sh = SpreadsheetApp.getActive().getSheetByName(Users);
  const data = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 7).getValues();
  const tz = Session.getScriptTimeZone();
  return data.filter(r = r[5]).map(r = ({
    username r[0], name r[3], role r[2], level r[4], 
    loginTime (r[5] instanceof Date)  Utilities.formatDate(r[5], tz, hhmm a)  Active
  }));
}

function logoutUser(u) {
  const sh = SpreadsheetApp.getActive().getSheetByName(Users);
  const data = sh.getRange(2, 1, Math.max(sh.getLastRow()-1, 1), 1).getValues().flat();
  const idx = data.indexOf(u);
  if (idx !== -1) { sh.getRange(idx + 2, 6).setValue(); }
}

function forceLogoutUser(targetUser) {
  const sh = SpreadsheetApp.getActive().getSheetByName(Users);
  const data = sh.getRange(2, 1, Math.max(sh.getLastRow()-1, 1), 1).getValues().flat();
  const idx = data.indexOf(targetUser);
  if (idx !== -1) { sh.getRange(idx + 2, 6).setValue(); return {status success}; }
  return {status error};
}