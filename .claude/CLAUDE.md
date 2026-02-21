# Truck Inventory Tracker

## What This Is
Google Apps Script that automates parts inventory tracking in Google Sheets for a field service truck. Enter how many parts you used, the sheet auto-deducts, logs usage, and flags rows red when stock hits zero.

## Architecture
- Single script: `Code.gs` — `onEdit` trigger + `doGet` JSONP endpoint
- Google Apps Script (JavaScript) attached to a Google Sheet
- Event-driven — fires automatically on cell edit, no manual triggers needed
- `doGet` enables the Field Buddy PWA Stock tab to fetch inventory via JSONP

## Cannot Run Locally
This is a Google Apps Script. Edit code here, commit/push, then paste into script.google.com (Extensions > Apps Script in the Sheet).

## Sheet Structure

**Tab: `Truck Tech Inventory`** (exact name required)

| Col A | Col B | Col C | Col D | Col E | Col F |
|-------|-------|-------|-------|-------|-------|
| Part Number | Description | Quantity | Used | Remaining | Min Stock |

- **Col F (Min Stock):** Fill in your reorder threshold per item. Row turns yellow when remaining ≤ this value.

**Tab: `Used Parts Log`** (exact name required)

| Col A | Col B | Col C | Col D |
|-------|-------|-------|-------|
| Part Number | Description | Used | Date |

## How It Works
1. Type quantity used into column D
2. Script subtracts from C and E, logs to Used Parts Log (with date), clears D
3. Row turns red if remaining hits zero; yellow if remaining ≤ Min Stock (col F)
4. Updating column C (restock) auto-clears highlight (re-checks min stock threshold)

## PWA Stock Tab Setup
1. Deploy Code.gs as a Web App: Extensions > Apps Script > Deploy > New Deployment
2. Execute as: Me | Who has access: Anyone
3. Copy the web app URL into the Field Buddy PWA (Stock tab > "Change Stock Sheet URL")

## Gotchas
- Tab names are hard-coded and case-sensitive — must match exactly
- All inventory rows must have numeric values in column C — empty/text causes NaN
- No undo — manually fix quantity and delete log row to reverse
- `onEdit` is a simple trigger — cannot send emails or call external APIs without converting to installable trigger
- Red highlight auto-clear only works if background is exactly `#ff0000`

## What NOT to Do
- Don't rename the sheet tabs
- Don't put formulas in columns C or E — the script writes values directly and will overwrite them
- Don't put formulas in column F — just fill in plain numbers for Min Stock thresholds
