# Truck Inventory Tracker

## What This Is
Google Apps Script that automates parts inventory tracking in Google Sheets for a field service truck. Enter how many parts you used, the sheet auto-deducts, logs usage, and flags rows red when stock hits zero.

## Architecture
- Single script: `Code.gs` — one `onEdit` trigger function (~70 lines)
- Google Apps Script (JavaScript) attached to a Google Sheet
- Event-driven — fires automatically on cell edit, no manual triggers needed

## Cannot Run Locally
This is a Google Apps Script. Edit code here, commit/push, then paste into script.google.com (Extensions > Apps Script in the Sheet).

## Sheet Structure

**Tab: `Truck Tech Inventory`** (exact name required)

| Col A | Col B | Col C | Col D | Col E |
|-------|-------|-------|-------|-------|
| Part Number | Description | Quantity | Used | Remaining |

**Tab: `Used Parts Log`** (exact name required)

| Col A | Col B | Col C |
|-------|-------|-------|
| Part Number | Description | Used |

## How It Works
1. Type quantity used into column D
2. Script subtracts from C and E, logs to Used Parts Log, clears D
3. Row turns red if remaining hits zero
4. Updating column C (restock) auto-clears red highlight

## Gotchas
- Tab names are hard-coded and case-sensitive — must match exactly
- All inventory rows must have numeric values in column C — empty/text causes NaN
- No undo — manually fix quantity and delete log row to reverse
- Used Parts Log does NOT include timestamps (only Part Number, Description, Used amount)
- `onEdit` is a simple trigger — cannot send emails or call external APIs without converting to installable trigger
- Red highlight auto-clear only works if background is exactly `#ff0000`

## What NOT to Do
- Don't rename the sheet tabs
- Don't put formulas in columns C or E — the script writes values directly and will overwrite them
