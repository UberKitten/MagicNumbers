/**
 *  8b    d8    db     dP""b8 88  dP""b8     88b 88 88   88 8b    d8 88""Yb 888888 88""Yb .dP"Y8 
 *  88b  d88   dPYb   dP   `" 88 dP   `"     88Yb88 88   88 88b  d88 88__dP 88__   88__dP `Ybo." 
 *  88YbdP88  dP__Yb  Yb  "88 88 Yb          88 Y88 Y8   8P 88YbdP88 88""Yb 88""   88"Yb  o.`Y8b 
 *  88 YY 88 dP""""Yb  YboodP 88  YboodP     88  Y8 `YbodP' 88 YY 88 88oodP 888888 88  Yb 8bodP' 
 *
 *  By Astra West. MIT License.
 *  https://github.com/T3hUb3rK1tten/MagicNumbers
 */

/**
 * Will only show the first 3 to 20 digit number in the message.
 * Desirable to prevent any knowledge of the origin of the message from being exposed.
 **/
var prop_SanitizeMessage = true;

/**
 * Whether to include the header or not.
 **/
var prop_UseHeader = false;

/**
 * Whether to include the source phone number as a column in the sheet.
 * Again, desirable to prevent knowledge of the origin of the message.
 **/
var prop_IncludeFrom = false;

/**
 * How many rows to keep in the spreadsheet.
 * Must be 1 or greater unless you want a blank sheet.
 **/
var prop_HistoryCount = 1;

/***********************************************************/

var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheets()[0];

function insertRow(rowData, optIndex) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { 
    var index = optIndex || 1;
    sheet.insertRowBefore(index).getRange(index, 1, 1, rowData.length).setValues([rowData]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function clearRows(startIndex, optEndIndex) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { 
    var endIndex = optEndIndex || sheet.getLastRow();
    if (startIndex > endIndex) {
      // We are below the history limit anyways
      return;
    }
    var width = sheet.getLastColumn();
    Logger.log(startIndex + ",1," + (endIndex - startIndex + 1) + "," + width);
    sheet.getRange(startIndex,1,endIndex - startIndex + 1,width).clearContent();
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function updateHeader() {
  if (prop_UseHeader) {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try { 
      if (prop_IncludeFrom) {
        sheet.getRange(1,1,1,2).setValues([["From", "Message"]]);
      } else {
        sheet.getRange(1,1,1,2).setValues([["Message", ""]]);
      }
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
  }
}

function doGet(e) {
  sheet.appendRow([e.queryString]);
  return ContentService.createTextOutput("<Response></Response>");
}

function doPost(e) {
  var msg = e.parameter;
  var index = prop_UseHeader ? 2 : 1;
  
  updateHeader();
  if (prop_SanitizeMessage) {
    var getToken = /\d{3,20}/;
    var match = getToken.exec(msg.Body);
    if (match) {
      msg.Body = match[0];
    }
  }
  
  if (prop_IncludeFrom) {
    insertRow([msg.From,msg.Body],index);
  } else {
    insertRow([msg.Body],index);
  }
  
  clearRows(index + prop_HistoryCount);
  return ContentService.createTextOutput("<Response></Response>");
}

function test() {
  var e = {
    parameter: {
      From: "+12345556969",
      Body: "Your one-time use code is 6969420"
    }
  };
  doPost(e);
  var e = {
    parameter: {
      From: "+12345556969",
      Body: "There is no code in this message"
    }
  };
  doPost(e);
  var e = {
    parameter: {
      From: "+12345556969",
      Body: "Your phone number is 2341111420"
    }
  };
  doPost(e);
}

function releaseLock() {
  var lock = LockService.getScriptLock();
  lock.releaseLock();
}
