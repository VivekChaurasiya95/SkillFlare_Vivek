# DatePicker Quick Implementation Reference

## 📁 Files Created/Modified

### Frontend

1. **`components/DatePicker.jsx`** (NEW)
   - Custom date picker component with DD-MM-YYYY format
   - Calendar interface with month/year navigation
   - Auto-formatting keyboard input
   - Min/max date constraints

2. **`hooks/useDateFormatter.js`** (NEW)
   - Date formatting utilities hook
   - Methods: formatToDDMMYYYY, formatToReadable, getDaysUntil, etc.
   - Zero dependencies (no moment.js or date-fns)

3. **`components/index.js`** (UPDATED)
   - Added: `export { default as DatePicker } from './DatePicker';`

4. **`hooks/index.js`** (UPDATED)
   - Added: `export { useDateFormatter } from "./useDateFormatter";`

5. **`pages/PostTask.jsx`** (UPDATED)
   - Changed from native `<input type="date">` to `<DatePicker />`
   - Replaced: ArrowLeft import with ArrowLeft, PlusCircle, X, Plus, Info
   - Replaced: `import { ButtonLoading, Alert }` with `{ ButtonLoading, Alert, DatePicker }`
   - Updated form section to use DatePicker component

### Backend

1. **`utils/dateUtils.js`** (NEW)
   - Core date utility functions:
     - `parseDate()` - DD-MM-YYYY string to Date
     - `formatDate()` - Date to DD-MM-YYYY string
     - `toISODate()` - Date to YYYY-MM-DD ISO string
     - `getDaysUntilDeadline()` - Calculate days left
     - `isDeadlineOverdue()` - Overdue check
     - `validateDeadline()` - Validate for task creation
     - And more...

2. **`controllers/taskController.js`** (UPDATED)
   - Added import: `import { validateDeadline } from "../utils/dateUtils.js";`
   - Updated `createTask()` function:
     - Added deadline validation before creating task
     - Returns 400 error if deadline is not in future
     - Added logging for successful task creation

---

## 🚀 Quick Start

### Using DatePicker in a Form

```jsx
import { DatePicker } from "../components";

<DatePicker
  name="deadline"
  value={formData.deadline} // YYYY-MM-DD format
  onChange={handleChange} // Sets YYYY-MM-DD format
  minDate={getMinDate()} // ISO format
  error={!!errors.deadline} // Show error state
  placeholder="DD-MM-YYYY"
/>;
```

### Using Date Formatter Hook

```jsx
import { useDateFormatter } from "../hooks";

function MyComponent({ deadlineDate }) {
  const {
    formatToReadable, // → "Mon, 19 Mar 2026"
    getDaysUntil, // → 5
    getDeadlineStatus, // → "5 days left"
    getDeadlineColor, // → "text-green-500"
  } = useDateFormatter();

  return (
    <div className={getDeadlineColor(deadlineDate)}>
      <p>{formatToReadable(deadlineDate)}</p>
      <p>{getDeadlineStatus(deadlineDate)}</p>
    </div>
  );
}
```

### Using Backend Date Utils

```javascript
import { validateDeadline, getDaysUntilDeadline } from "../utils/dateUtils";

// Validate deadline before saving
const validation = validateDeadline(new Date(deadline), 0);
if (!validation.valid) {
  return res.status(400).json({ error: validation.error });
}

// Get days remaining for a task
const daysLeft = getDaysUntilDeadline(task.deadline);
```

---

## 📋 API Contract

### Create Task

```
POST /api/tasks
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "skills": ["string"],
  "deadline": "2026-03-25",    // YYYY-MM-DD format
  "creditPoints": number
}
```

**Validation:**

- ❌ Deadline in past → 400 Bad Request
- ❌ Invalid date format → 400 Bad Request
- ✅ Valid future date → 201 Created

---

## 🎨 DatePicker Features

| Feature            | Status | Notes                         |
| ------------------ | ------ | ----------------------------- |
| DD-MM-YYYY Display | ✅     | Shows formatted text in input |
| Calendar Interface | ✅     | Month/year navigation         |
| Keyboard Input     | ✅     | Auto-formats as you type      |
| Min Date           | ✅     | Disables past dates           |
| Max Date           | ✅     | Configurable max date         |
| Today Button       | ✅     | Quick selection for today     |
| Error State        | ✅     | Red border when error         |
| Mobile Friendly    | ✅     | Responsive design             |
| Accessibility      | ✅     | Keyboard navigation           |

---

## 🔄 Data Format Conversion

```
User Input (Display)  →  Component Conversion  →  API Transmission
   "19-03-2026"      →  formatDDMMYYYY()      →  "2026-03-19"
                     ↓
                  Backend Storage
                  MongoDB Date Object
                     ↓
   "19-03-2026"      ←  formatDate()          ←  "2026-03-19"
```

---

## 📊 Component Hierarchy

```
PostTask (Page)
  ├─ DatePicker (Component)
  │   └─ Calendar + Input Field
  └─ taskService.createTask()
     └─ Backend: POST /api/tasks
        └─ dateUtils.validateDeadline()
```

---

## ✅ Testing Checklist

- [ ] DatePicker renders correctly
- [ ] Clicking dates updates form
- [ ] Keyboard input works (123456789 → "12-34-5678")
- [ ] Min date enforcement works
- [ ] Today button selects current date
- [ ] Form submission converts to YYYY-MM-DD
- [ ] Backend receives correct format
- [ ] Deadline validation rejects past dates
- [ ] Error messages display properly
- [ ] Mobile responsiveness works

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid date format"

**Solution:** Ensure backend receives ISO format (YYYY-MM-DD)

### Issue: "Timezone mismatch"

**Solution:** Always use UTC dates in database and convert in frontend

### Issue: "Calendar not closing"

**Solution:** Check for z-index conflicts with modal stack

### Issue: "Min date not working"

**Solution:** Ensure minDate is passed as ISO format string

---

## 📚 Documentation Files

1. **`DATE_PICKER_GUIDE.md`** - Comprehensive implementation reference
2. **`QUICK_REFERENCE.md`** - This file (quick lookup)
3. **Code comments** - In DatePicker.jsx, dateUtils.js, useDateFormatter.js

---

## 🔗 Integration Points

| Module        | File                  | Purpose                   |
| ------------- | --------------------- | ------------------------- |
| Frontend Form | `PostTask.jsx`        | Uses DatePicker component |
| UI Component  | `DatePicker.jsx`      | Renders date picker UI    |
| Utilities     | `useDateFormatter.js` | Format dates for display  |
| Backend API   | `taskController.js`   | Validates & stores dates  |
| Backend Utils | `dateUtils.js`        | Core date functions       |

---

## 🎯 Next Steps

1. ✅ Test DatePicker in PostTask page
2. ✅ Verify backend validation works
3. ⏳ Update MentorProfile.jsx to use DatePicker (optional for consistency)
4. ⏳ Add date range filtering to task browse page
5. ⏳ Add deadline notifications feature
6. ⏳ Create calendar view in Dashboard

---

**Version:** 1.0.0  
**Date:** March 19, 2026  
**Status:** ✅ Ready for Testing
