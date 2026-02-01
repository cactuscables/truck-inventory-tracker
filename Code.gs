/**
 * Truck Tech Inventory Tracker
 *
 * Google Apps Script that automates parts inventory management in Google Sheets.
 * Tracks usage, logs consumed parts, and visually flags items needing reorder.
 *
 * Setup:
 * 1. Create a Google Sheet with a "Truck Tech Inventory" tab
 * 2. Columns: A=Part Number, B=Description, C=Quantity, D=Used, E=Remaining
 * 3. Create a "Used Parts Log" tab (headers will be auto-created)
 * 4. Extensions > Apps Script > paste this code > Save
 *
 * Usage:
 * - Enter quantity used in Column D - automatically deducts from inventory
 * - Row turns red when quantity hits zero
 * - Replenish by updating Column C - row returns to normal
 * - All usage is logged to "Used Parts Log" for tracking/reporting
 */

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var logSheet = e.source.getSheetByName('Used Parts Log');
  var range = e.range;
  var column = range.getColumn();
  var row = range.getRow();

  // Add headers to the 'Used Parts Log' sheet if they don't exist
  if (logSheet.getRange("A1").getValue() == "") {
    logSheet.getRange("A1:C1").setValues([["Part Number", "Description", "Used"]]);
  }

  if (sheet.getName() == 'Truck Tech Inventory' && row > 1) {
    if (column == 4 && e.value > 0) {
      // Handle usage in Column D
      var partNumber = sheet.getRange(row, 1).getValue();
      var description = sheet.getRange(row, 2).getValue();
      var usedAmount = e.value;
      var currentQuantity = sheet.getRange(row, 3).getValue();

      var newQuantity = Math.max(currentQuantity - usedAmount, 0);

      sheet.getRange(row, 3).setValue(newQuantity);
      sheet.getRange(row, 5).setValue(newQuantity);

      // Append only columns A, B, and D to the 'Used Parts Log' sheet
      logSheet.appendRow([partNumber, description, usedAmount]);

      sheet.getRange(row, 4).setValue(0);

      // Apply red fill to the entire row if quantity reaches zero
      if (newQuantity == 0) {
        var lastColumn = sheet.getLastColumn();
        var rowRange = sheet.getRange(row, 1, 1, lastColumn);
        rowRange.setBackground('#FF0000');
      }
    } else if (column == 3) {
      // Handle replenishment in Column C
      var newQuantity = e.value;
      var remainingQuantity = sheet.getRange(row, 5).getValue();
      var rowColor = sheet.getRange(row, 1).getBackground();

      if (remainingQuantity == 0 && rowColor == '#ff0000') {
        sheet.getRange(row, 5).setValue(newQuantity);
        var lastColumn = sheet.getLastColumn();
        var rowRange = sheet.getRange(row, 1, 1, lastColumn);
        rowRange.setBackground(null);
      }
    }
  }
}
