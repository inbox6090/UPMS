const SCRIPT_VERSION = "2.0";
const SPREADSHEET_ID = '1L0No-EVNkibCEDLOip6mqSyUdA3Fg7dQBBwytVLsu_A';

// ========================
// 🔹 MAIN ROUTES
// ========================
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getCitizens') return getSheetData('Citizens');
    if (action === 'getApplications') return getSheetData('Applications');
    if (action === 'getUsers') return getSheetData('Users');
    if (action === 'verifySerial') return verifyApplicationBySerial(e.parameter.serial);

    return jsonResponse({status: 'error', message: 'Invalid action for GET'});
  } catch (error) {
    return jsonResponse({status: 'error', message: error.toString()});
  }
}

function doPost(e) {
  try {
    let payload = {};

    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    const action = payload.action;

    if (action === 'addCitizen') return addRecord('Citizens', payload.data);
    if (action === 'addApplication') return addRecord('Applications', payload.data);
    if (action === 'updateApplicationStatus') return updateApplicationStatus(payload.id, payload.status);
    if (action === 'logAction') return addRecord('Logs', payload.data);

    return jsonResponse({status: 'error', message: 'Invalid action for POST'});
  } catch (error) {
    return jsonResponse({status: 'error', message: error.toString()});
  }
}

// ========================
// 🔹 UTIL FUNCTIONS
// ========================
function jsonResponse(responseObj) {
  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateId() {
  return 'ID-' + new Date().getTime();
}

function generateSerial() {
  return 'UDC-' + Utilities.formatDate(new Date(), "GMT+6", "yyyyMMddHHmmss");
}

// ========================
// 🔹 GET DATA
// ========================
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return jsonResponse({status: 'error', message: `Sheet ${sheetName} not found`});

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({status: 'success', data: []});

  const headers = data[0];
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }

  return jsonResponse({status: 'success', data: rows});
}

// ========================
// 🔹 ADD RECORD (UPGRADED)
// ========================
function addRecord(sheetName, recordData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return jsonResponse({status: 'error', message: `Sheet ${sheetName} not found`});

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Duplicate NID check
  if (sheetName === 'Citizens' && recordData.NID) {
    const existingData = sheet.getDataRange().getValues();
    const nidIndex = headers.indexOf('NID');

    if (nidIndex > -1) {
      for (let i = 1; i < existingData.length; i++) {
        if (existingData[i][nidIndex] == recordData.NID) {
          return jsonResponse({
            status: 'error',
            message: 'Duplicate NID found. Citizen already registered.'
          });
        }
      }
    }
  }

  const newRow = [];

  headers.forEach(header => {
    if (header === 'ID') {
      newRow.push(generateId());
    } else if (header === 'Serial') {
      newRow.push(generateSerial());
    } else if (header === 'CreatedAt') {
      newRow.push(new Date());
    } else {
      newRow.push(recordData[header] !== undefined ? recordData[header] : '');
    }
  });

  sheet.appendRow(newRow);

  return jsonResponse({
    status: 'success',
    message: `${sheetName} added successfully`
  });
}

// ========================
// 🔹 UPDATE STATUS
// ========================
function updateApplicationStatus(applicationId, newStatus) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Applications');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIndex = headers.indexOf('ID');
  const statusIndex = headers.indexOf('Status');

  if (idIndex === -1 || statusIndex === -1) {
    return jsonResponse({status: 'error', message: 'ID or Status column not found'});
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == applicationId) {
      sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
      return jsonResponse({status: 'success', message: 'Application status updated'});
    }
  }

  return jsonResponse({status: 'error', message: 'Application ID not found'});
}

// ========================
// 🔹 VERIFY SERIAL
// ========================
function verifyApplicationBySerial(serial) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Applications');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({status: 'error', message: 'No records found'});

  const headers = data[0];
  const serialIndex = headers.indexOf('Serial');

  if (serialIndex === -1) {
    return jsonResponse({status: 'error', message: 'Serial column not configured'});
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][serialIndex] == serial) {
      const rowObj = {};
      for (let j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      return jsonResponse({status: 'success', data: rowObj});
    }
  }

  return jsonResponse({status: 'error', message: 'Serial not found'});
}