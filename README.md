# Truck Tech Inventory Tracker

Google Apps Script that automates parts inventory management for field service technicians.

## The Problem

Field technicians carry hundreds of small parts in their trucks. Tracking what's used and what needs reordering is tedious:
- Manual counting wastes time
- Forgetting to reorder causes delays on jobs
- No visibility into usage patterns

## The Solution

A Google Sheet with automation that:
1. **Tracks usage** - Enter amount used, inventory auto-deducts
2. **Logs everything** - Every part used is recorded with timestamp
3. **Visual alerts** - Row turns red when stock hits zero
4. **Easy replenishment** - Update quantity, row returns to normal

## How It Works

| Column | Purpose |
|--------|---------|
| A | Part Number |
| B | Description |
| C | Current Quantity |
| D | Used (enter amount, then auto-clears) |
| E | Remaining (synced with C) |

### When you use a part:
1. Find the part row
2. Enter quantity used in Column D
3. Script automatically:
   - Subtracts from inventory
   - Logs to "Used Parts Log" sheet
   - Clears the Used column
   - Turns row red if quantity = 0

### When you restock:
1. Update quantity in Column C
2. Red highlighting clears automatically

## Setup

1. Create a new Google Sheet
2. Create two tabs:
   - `Truck Tech Inventory` (main inventory)
   - `Used Parts Log` (auto-populated log)
3. Add headers to Truck Tech Inventory: `Part Number | Description | Quantity | Used | Remaining`
4. Go to **Extensions > Apps Script**
5. Delete any existing code, paste contents of `Code.gs`
6. Save (Ctrl+S)
7. Return to sheet and start using

## Example

```
Before using 2 filters:
| Part Number | Description    | Quantity | Used | Remaining |
|-------------|----------------|----------|------|-----------|
| FLT-001     | Oil Filter     | 5        |      | 5         |

Enter "2" in Used column...

After:
| Part Number | Description    | Quantity | Used | Remaining |
|-------------|----------------|----------|------|-----------|
| FLT-001     | Oil Filter     | 3        | 0    | 3         |

Used Parts Log now shows:
| Part Number | Description    | Used |
|-------------|----------------|------|
| FLT-001     | Oil Filter     | 2    |
```

## Tech Stack

- Google Apps Script (JavaScript)
- Google Sheets
- Event-driven automation (onEdit trigger)

## Author

Built by Dustin Williams to streamline field service inventory management.
