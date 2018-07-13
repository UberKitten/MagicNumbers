/**
 *  8b    d8    db     dP""b8 88  dP""b8     88b 88 88   88 8b    d8 88""Yb 888888 88""Yb .dP"Y8 
 *  88b  d88   dPYb   dP   `" 88 dP   `"     88Yb88 88   88 88b  d88 88__dP 88__   88__dP `Ybo." 
 *  88YbdP88  dP__Yb  Yb  "88 88 Yb          88 Y88 Y8   8P 88YbdP88 88""Yb 88""   88"Yb  o.`Y8b 
 *  88 YY 88 dP""""Yb  YboodP 88  YboodP     88  Y8 `YbodP' 88 YY 88 88oodP 888888 88  Yb 8bodP' 
 *
 *  By Astra West
 *  https://github.com/T3hUb3rK1tten/MagicNumbers
 *  MIT License.
 */

/**
 *  .dP"Y8 8b    d8 .dP"Y8 
 *  `Ybo." 88b  d88 `Ybo." 
 *  o.`Y8b 88YbdP88 o.`Y8b 
 *  8bodP' 88 YY 88 8bodP' 
 * 
 * The below options apply to SMS only.
 **/

/**
 * Whether to process SMS messages at all.
 **/
var prop_SMS_Enable = true;

/**
 * Whether to include the table header (From, Message) or not in the spreadsheet.
 **/
var prop_SMS_UseHeader = true;

/**
 * Will only show the first 3 to 20 digit number in the message.
 * Desirable to prevent any knowledge of the origin of the message from being exposed.
 **/
var prop_SMS_SanitizeMessage = true;

/**
 * Whether to include the source phone number as a column in the sheet.
 * Again, desirable to prevent knowledge of the origin of the message.
 **/
var prop_SMS_IncludeFrom = true;

/**
 * How many rows to keep in the sheet.
 * Must be 1 or greater unless you want a blank sheet.
 **/
var prop_SMS_HistoryCount = 5;

/**
 *  88""Yb 88  88  dP"Yb  88b 88 888888 
 *  88__dP 88  88 dP   Yb 88Yb88 88__   
 *  88"""  888888 Yb   dP 88 Y88 88""   
 *  88     88  88  YbodP  88  Y8 888888 
 *
 * The below options apply to phone calls only.
 **/

/**
 * Whether to process phone calls at all.
 **/
var prop_Phone_Enable = true;

/**
 * Whether to include the table header (From) or not in the spreadsheet.
 **/
var prop_Phone_UseHeader = true;

/**
 * How many rows to keep in the spreadsms.
 * Must be 1 or greater unless you want a blank sheet.
 **/
var prop_Phone_HistoryCount = 5;

/**
 * For the below numbers, instead of immediately hanging up, send the DTMF tones specified below in prop_Phone_ActionDTMF
 * This phone number must be in the exact format (E.164) Twilio sends, i.e. +12345556969
 * Examples:
 *  prop_Phone_ActionNumbers = ["+12345556969"];
 *  prop_Phone_ActionNumbers = ["+12345556969", "+12345551337"];
 **/
var prop_Phone_ActionNumbers = [];

/**
 * Forward any numbers that are not action numbers to another phone number.
 * Handy if you have to use the same number as a contact number and controlled access number.
 **/
var prop_Phone_ForwardNonActionNumbers = true;

/**
 * Number to forward to if ForwardNonActionNumbers is enabled.
 **/
var prop_Phone_ForwardNonActionNumbersTo = "+12345555420";

/**
 * Whether to use Twilio's recording functionality when forwarding calls.
 * Make sure to consider recording consent laws, obviously.
 **/
var prop_Phone_RecordForwardedCalls = false;

/**
 * The DTMF codes to send when a calling number matches the prop_Phone_ActionNumbers.
 * This can be numbers and "w" which means that Twilio should wait 0.5 seconds before continuing.
 * For example, 9ww9 will press 9, wait 1 second, and then press 9 again.
 * You should leave at least 1 second in between numbers, or they seem to get cut off.
 */
var prop_Phone_ActionDTMF = "9ww9ww9ww9ww9ww9ww9";

/**
 *  88""Yb 88   88 .dP"Y8 88  88  dP"Yb  Yb    dP 888888 88""Yb 
 *  88__dP 88   88 `Ybo." 88  88 dP   Yb  Yb  dP  88__   88__dP 
 *  88"""  Y8   8P o.`Y8b 888888 Yb   dP   YbdP   88""   88"Yb  
 *  88     `YbodP' 8bodP' 88  88  YbodP     YP    888888 88  Yb 
 *
 * Pushover is a service to make it easy to push notifications to devices on any platform: https://pushover.net/
 **/

/**
 * Your Pushover application API token.
 * Get it from: https://pushover.net/apps/build
 **/
var prop_Pushover_AppToken = "";

/**
 * Your Pushover user API token.
 * Get it from: https://pushover.net/
 **/
var prop_Pushover_UserToken = "";

/**
 * Whether to notify for SMS.
 **/
var prop_Pushover_SMS = true;

/**
 * Whether to notify for phone calls.
 **/
var prop_Pushover_Phone = true;

/***********************************************************/

// Common variables
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sms = ss.getSheetByName("SMS");
var phone = ss.getSheetByName("phone");

// Run this after changing your properties above to set up your sheets.
function setup() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { 
    // Delete all sheets except one
    for (var i=0; i + 1 < ss.getNumSheets(); i++) {
      ss.deleteSheet(ss.getSheets()[0]);
    }
    
    // Replace the last sheet with a clean one
    ss.insertSheet();
    ss.deleteSheet(ss.getSheets()[0]);
    
    // Now based on what we have enabled, set the sheet names and update the common variables
    if (prop_SMS_Enable && prop_Phone_Enable) {
      ss.insertSheet();
      sms = ss.getSheets()[0];
      sms.setName("SMS");
      phone = ss.getSheets()[1];
      phone.setName("Phone");
    } else if (prop_SMS_Enable && !prop_Phone_Enable) {
      sms = ss.getSheets()[0];
      sms.setName("SMS")
    } else if (!prop_SMS_Enable && prop_Phone_Enable) {
      phone = ss.getSheets()[0];
      phone.setName("Phone");
    }
    
    updateHeaders();
  } finally {
    lock.releaseLock();
  }
}

// Insert a row in the sheet thread-safely
function insertRow(sheet, rowData, optIndex) {
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

// Delete rows in the sheets that are beyond the end index (history count limit) thread-safely
function clearRows(sheet, startIndex, optEndIndex) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { 
    var endIndex = optEndIndex || sheet.getLastRow();
    if (startIndex > endIndex) {
      // We are below the end index anyways
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

// Set the headers in the sheets to match what properties are set in the script
function updateHeaders() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { 
    if (prop_SMS_Enable && prop_SMS_UseHeader) {
      if (prop_SMS_IncludeFrom) {
        sms.getRange(1,1,1,2).setValues([["From", "Message"]]);
      } else {
        sms.getRange(1,1,1,2).setValues([["Message", ""]]);
      }
    } 
    if (prop_Phone_Enable && prop_Phone_UseHeader) {
      phone.getRange(1,1,1,3).setValues([["From", "Action Sent", "Forwarded"]])
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function pushover(message) {
 var data = {
   'token': prop_Pushover_AppToken,
   'user': prop_Pushover_UserToken,
   'message': message
 };
 var options = {
   'method' : 'post',
   'payload' : data
 };
 UrlFetchApp.fetch('https://api.pushover.net/1/messages.json', options);
}

// Message and call parsing main function
function doGet(e) {
  var msg = e.parameter;
  var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";
  
  if (msg.hasOwnProperty("CallStatus")) {
    // Phone call
    // Docs: https://www.twilio.com/docs/api/twiml/twilio_request
    if (prop_Phone_Enable) {
      var index = prop_Phone_UseHeader ? 2 : 1;
      
      if (prop_Phone_ActionNumbers.indexOf(msg.From) > -1) {
        // Custom action number
        insertRow(phone, [msg.From, "Yes", "No"],index);
        clearRows(phone, index + prop_Phone_HistoryCount);
        
        if (prop_Pushover_Phone) {
          pushover("Phone: " + msg.From + ": Sent code");
        }
        
        return ContentService.createTextOutput(xml + "<Response><Play digits=\"" + prop_Phone_ActionDTMF + "\"></Play></Response>").setMimeType(ContentService.MimeType.XML);
      } else {
        if (prop_Phone_ForwardNonActionNumbers) {
          insertRow(phone, [msg.From, "No", "Yes"],index);
          clearRows(phone, index + prop_Phone_HistoryCount);
          
          if (prop_Pushover_Phone) {
            pushover("Phone: " + msg.From + ": Forwarded");
          }
          
          if (prop_Phone_RecordForwardedCalls) {
            return ContentService.createTextOutput(xml + "<Response><Dial record=\"record-from-answer-dual\" answerOnBridge=\"true\"><Number>" + prop_Phone_ForwardNonActionNumbersTo + "</Number></Dial></Response>").setMimeType(ContentService.MimeType.XML);
          } else {
            return ContentService.createTextOutput(xml + "<Response><Dial answerOnBridge=\"true\"><Number>" + prop_Phone_ForwardNonActionNumbersTo + "</Number></Dial></Response>").setMimeType(ContentService.MimeType.XML);
          }
        } else {
          insertRow(phone, [msg.From, "No", "No"],index);
          clearRows(phone, index + prop_Phone_HistoryCount);
          
          if (prop_Pushover_Phone) {
            pushover("Phone: " + msg.From + ": Did not send code");
          }
          return ContentService.createTextOutput(xml + "<Response></Response>").setMimeType(ContentService.MimeType.XML);
        }
      }
    }
  } else {
    // SMS
    // Docs: https://www.twilio.com/docs/api/twiml/sms/twilio_request
    if (prop_SMS_Enable) {
      var index = prop_SMS_UseHeader ? 2 : 1;
      
      updateHeaders();
      
      if (prop_SMS_SanitizeMessage) {
        // Get the first match of a number between 4 and 20 characters long with optionally a dash or space in the middle
        // Square Cash, Signal both use codes with a dash
        // Examples that will match: "123456" "123-456" "12-234567" "123 4567" "1234567890"
        var getToken = /\d{2,10}[\- ]?\d{2,10}/;
        
        var match = getToken.exec(msg.Body);
        if (match) {
          msg.Body = match[0];
        }
      }
      
      if (prop_SMS_IncludeFrom) {
        insertRow(sms, [msg.From,msg.Body],index);
        if (prop_Pushover_SMS) {
          pushover("SMS: " + msg.From + ": " + msg.Body);
        }
      } else {
        insertRow(sms, [msg.Body],index);
        if (prop_Pushover_SMS) {
          pushover("SMS: " + msg.Body);
        }
      }
      
      clearRows(sms, index + prop_SMS_HistoryCount);
      return ContentService.createTextOutput(xml + "<Response></Response>").setMimeType(ContentService.MimeType.XML);
    }
  }
}

// POST does not work with Twilio and Google App Scripts :(
function doPost(e) { }

// Process a couple test messages without using Twilio
function testSms() {
  var e = {
    parameter: {
      From: "+12345556969",
      Body: "Your one-time use code is 6969-420"
    }
  };
  doGet(e);
  var e = {
    parameter: {
      From: "+12345551337",
      Body: "There is no code in this message"
    }
  };
  doGet(e);
  var e = {
    parameter: {
      From: "+12345554321",
      Body: "Your phone number is 2341111420"
    }
  };
  doGet(e);
}

function testPhone() {
  var e = {
    parameter: {
      From: "+12345556969",
      CallStatus: "something"
    }
  };
  doGet(e);
  var e = {
    parameter: {
      From: "+12345551337",
      CallStatus: "something"
    }
  };
  doGet(e);
}
