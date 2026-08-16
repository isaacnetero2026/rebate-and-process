PROCESS HUB - COMPLETE APPS SCRIPT PROJECT PACKAGE
====================================================

CONTENTS
--------
Index.html                  NEW Process Hub frontend
Code(1).gs                  ORIGINAL uploaded backend copy
Code(2).gs                  ORIGINAL uploaded backend copy
Index(1).html               ORIGINAL uploaded frontend backup
RebateCalculator.html       ORIGINAL calculator
RebateChecker.html          ORIGINAL checker
RebateMonthly.html          ORIGINAL monthly calculator
REBATE V6.1_127.xlsx        ORIGINAL spreadsheet/data backup

IMPORTANT
---------
1. Code(1).gs and Code(2).gs were both supplied by the user and appear to be
   duplicate versions. Keep only ONE Code.gs in the Apps Script project.
2. I recommend using Code(2).gs as the backend source and renaming it to
   Code.gs in Apps Script.
3. Use the NEW Index.html as the main interface.
4. Keep Index(1).html as a backup/reference; it is not required if Index.html
   is the main file.
5. Upload/import the HTML files into the Apps Script project.
6. The XLSX is included as a backup/reference. Apps Script should use the
   actual Google Sheet, not the XLSX file.

NEW FRONTEND
------------
The new Index.html calls the existing backend functions:
- checkLogin
- logoutUser
- searchTask
- includePage
- getUserHistory
- getAllUsers
- manageAccount
- getLoggedInUsersList
- forceLogoutUser

ROLES
-----
Admin = full management/session access
Semi  = management workflow according to the existing backend
User  = normal process/search/calculator/history access

DEPLOYMENT
----------
In Google Apps Script:
1. Create/restore the project.
2. Add Code.gs and paste the contents of Code(2).gs.
3. Add Index.html using the NEW Index.html in this package.
4. Add RebateCalculator.html, RebateChecker.html, and RebateMonthly.html.
5. Verify the Google Sheet ID/configuration used by your backend.
6. Deploy -> New deployment -> Web app.
7. Execute as the account that owns the spreadsheet.
8. Set the access option appropriate for your organization.
9. Open the Web App URL.

SECURITY
--------
The existing backend uses the Users sheet for authentication. Before production
use, password handling should be hardened so passwords are not exposed to the
client. This package intentionally preserves your existing backend behavior
rather than silently changing it.

BACKUP
------
Your original Index(1).html and both Code files are retained in this ZIP so
you can restore the previous version if needed.
