/**
 * Truck Tech Inventory Tracker
 *
 * Google Apps Script that automates parts inventory management in Google Sheets.
 * Tracks usage, logs consumed parts with timestamps, and visually flags items
 * needing reorder (zero stock = red, at/below min stock = yellow).
 *
 * Sheet structure:
 *
 * Tab: "Truck Tech Inventory"
 *   A: Part Number | B: Description | C: Quantity | D: Used | E: Remaining | F: Min Stock
 *
 * Tab: "Used Parts Log"
 *   A: Part Number | B: Description | C: Used | D: Date
 *
 * Setup:
 * 1. Create a Google Sheet with a "Truck Tech Inventory" tab
 * 2. Add column headers: Part Number, Description, Quantity, Used, Remaining, Min Stock
 * 3. Fill column F (Min Stock) with your reorder threshold for each part
 * 4. Create a "Used Parts Log" tab (headers will be auto-created)
 * 5. Extensions > Apps Script > paste this code > Save
 * 6. To enable the PWA Stock tab: Deploy > New deployment > Web app
 *    (Execute as: Me, Who has access: Anyone) — copy the URL into the PWA
 */

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var logSheet = e.source.getSheetByName('Used Parts Log');
  var range = e.range;
  var column = range.getColumn();
  var row = range.getRow();

  // Auto-create headers for Used Parts Log if they're missing
  if (logSheet.getRange("A1").getValue() == "") {
    logSheet.getRange("A1:D1").setValues([["Part Number", "Description", "Used", "Date"]]);
  }

  if (sheet.getName() == 'Truck Tech Inventory' && row > 1) {

    if (column == 4 && e.value > 0) {
      // Column D edited — record usage and deduct from stock
      var partNumber = sheet.getRange(row, 1).getValue();
      var description = sheet.getRange(row, 2).getValue();
      var usedAmount = e.value;
      var currentQuantity = sheet.getRange(row, 3).getValue();
      var minStock = sheet.getRange(row, 6).getValue(); // Col F: Min Stock threshold

      var newQuantity = Math.max(currentQuantity - usedAmount, 0);

      // Update Quantity (C) and Remaining (E), clear the Used (D) input
      sheet.getRange(row, 3).setValue(newQuantity);
      sheet.getRange(row, 5).setValue(newQuantity);
      sheet.getRange(row, 4).setValue(0);

      // Log the usage with a timestamp in col D
      var today = new Date().toLocaleDateString();
      logSheet.appendRow([partNumber, description, usedAmount, today]);

      // Color coding: red = out of stock, yellow = at or below min stock threshold
      var lastColumn = sheet.getLastColumn();
      var rowRange = sheet.getRange(row, 1, 1, lastColumn);

      if (newQuantity == 0) {
        rowRange.setBackground('#FF0000');
      } else if (minStock > 0 && newQuantity <= minStock) {
        rowRange.setBackground('#FFF176'); // light yellow
      } else {
        rowRange.setBackground(null); // clear any old highlight
      }

    } else if (column == 3) {
      // Column C edited — restocking. Recalculate remaining and clear red highlight.
      var newQuantity = e.value;
      var minStock = sheet.getRange(row, 6).getValue();
      var rowColor = sheet.getRange(row, 1).getBackground();

      // Only auto-clear highlight when restocking from zero (red row)
      if (rowColor == '#ff0000') {
        sheet.getRange(row, 5).setValue(newQuantity);
        var lastColumn = sheet.getLastColumn();
        var rowRange = sheet.getRange(row, 1, 1, lastColumn);
        // Re-check if new quantity still triggers yellow threshold
        if (minStock > 0 && newQuantity <= minStock && newQuantity > 0) {
          rowRange.setBackground('#FFF176');
        } else {
          rowRange.setBackground(null);
        }
      }
    }
  }
}

/**
 * doGet — JSONP endpoint for the Field Buddy PWA Stock tab.
 *
 * Called by the PWA via a <script> tag injection (JSONP pattern).
 * Returns all inventory rows as JSON so the PWA can display and cache them.
 *
 * URL format: [web app URL]?callback=myFn
 * Response: myFn({ status: "ok", items: [...] })
 *
 * To deploy: Extensions > Apps Script > Deploy > New Deployment > Web App
 * Execute as: Me | Who has access: Anyone
 */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Truck Tech Inventory');

  // Read all data (includes header row)
  var data = sheet.getDataRange().getValues();

  // Build array of item objects, skipping the header row (row 0)
  var items = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var partNum = row[0];
    var desc = row[1];
    var qty = row[2];
    var remaining = row[4]; // Col E
    var minStock = row[5];  // Col F

    // Skip empty rows
    if (!partNum && !desc) continue;

    items.push({
      partNum: String(partNum),
      desc: String(desc),
      qty: Number(qty) || 0,
      remaining: Number(remaining) || 0,
      minStock: Number(minStock) || 0
    });
  }

  // JSONP response — wraps JSON in the callback function name the PWA sent
  var callback = e.parameter.callback || 'callback';
  var json = JSON.stringify({ status: 'ok', items: items });
  return ContentService
    .createTextOutput(callback + '(' + json + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
