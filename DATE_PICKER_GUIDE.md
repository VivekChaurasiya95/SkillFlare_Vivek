# Date Picker Implementation Guide

## Overview

This document describes the custom date picker component with DD-MM-YYYY format and its backend integration for the SkillFlare platform.

## Frontend Components

### 1. DatePicker Component (`frontend/src/components/DatePicker.jsx`)

A fully functional date picker component with calendar interface and text input.

**Features:**

- DD-MM-YYYY display format
- Interactive calendar with month/year navigation
- Keyboard input support with auto-formatting
- Min/max date constraints
- Today button for quick selection
- Selected date highlighting
- Today indicator
- Disabled dates enforcement
- Responsive design with Tailwind CSS

**Props:**

```javascript
{
  value: string,           // ISO format (YYYY-MM-DD)
  onChange: function,      // Callback function
  placeholder: string,     // Default: "DD-MM-YYYY"
  minDate: string,         // ISO format, optional
  maxDate: string,         // ISO format, optional
  name: string,            // Field name
  error: boolean,          // Show error state
  className: string        // Additional CSS classes
}
```

**Usage Example:**

```jsx
import { DatePicker } from "../components";

<DatePicker
  name="deadline"
  value={formData.deadline}
  onChange={handleChange}
  minDate={getMinDate()}
  error={!!errors.deadline}
  placeholder="DD-MM-YYYY"
/>;
```

**Return Value:**

- Emits ISO format date (YYYY-MM-DD) via onChange callback
- Frontend displays in DD-MM-YYYY format
- Backend receives and stores in Date field

---

### 2. Components Index Export (`frontend/src/components/index.js`)

Updated to export DatePicker:

```javascript
export { default as DatePicker } from "./DatePicker";
```

---

### 3. Date Formatter Hook (`frontend/src/hooks/useDateFormatter.js`)

Custom React hook for date operations without external libraries.

**Available Methods:**

```javascript
const {
  formatToDDMMYYYY, // YYYY-MM-DD → DD-MM-YYYY
  formatToReadable, // YYYY-MM-DD → "Mon, 19 Mar 2026"
  formatToReadableDateTime, // DateTime → "Mon, 19 Mar 2026, 10:30"
  getDaysUntil, // Days until deadline
  isOverdue, // Boolean check
  isToday, // Boolean check
  getDeadlineStatus, // Status text
  getDeadlineColor, // Tailwind color class
  convertToISO, // DD-MM-YYYY → YYYY-MM-DD
} = useDateFormatter();
```

**Usage Example:**

```jsx
import { useDateFormatter } from "../hooks/useDateFormatter";

function TaskCard({ task }) {
  const { formatToReadable, getDaysUntil, isOverdue } = useDateFormatter();

  return (
    <div>
      <p>{formatToReadable(task.deadline)}</p>
      <p>{getDaysUntil(task.deadline)} days left</p>
      {isOverdue(task.deadline) && <span>Overdue!</span>}
    </div>
  );
}
```

---

## Backend Integration

### 1. Date Utils Module (`backend/src/utils/dateUtils.js`)

Comprehensive date utility functions for server-side operations.

**Functions:**

#### `parseDate(dateStr)`

Converts DD-MM-YYYY string to Date object

```javascript
const date = parseDate("19-03-2026");
// Returns: Date object or null
```

#### `formatDate(date)`

Converts Date object to DD-MM-YYYY string

```javascript
const formatted = formatDate(new Date(2026, 2, 19));
// Returns: "19-03-2026"
```

#### `toISODate(date)`

Converts Date object to ISO string (YYYY-MM-DD)

```javascript
const isoDate = toISODate(new Date(2026, 2, 19));
// Returns: "2026-03-19"
```

#### `getDaysUntilDeadline(deadline)`

Returns days remaining (negative if overdue)

```javascript
const daysLeft = getDaysUntilDeadline(new Date(2026, 2, 19));
// Returns: 5, 0, or -2, etc.
```

#### `isDeadlineOverdue(deadline)`

Boolean check for overdue deadline

```javascript
const overdue = isDeadlineOverdue(deadline);
```

#### `isDeadlineToday(deadline)`

Boolean check for today's deadline

```javascript
const today = isDeadlineToday(deadline);
```

#### `getDateRange(rangeType)`

Get date range for filtering

```javascript
const { startDate, endDate } = getDateRange("month");
// rangeType: 'today', 'week', 'month', 'year'
```

#### `formatDateTime(date)`

Format with time: "DD-MM-YYYY HH:MM"

```javascript
const formatted = formatDateTime(new Date());
// Returns: "19-03-2026 14:30"
```

#### `validateDeadline(deadline, minDays = 0)`

Validate deadline for task creation

```javascript
const result = validateDeadline(deadline, 1);
// Returns: { valid: true } or { valid: false, error: "..." }
```

---

### 2. Task Controller Updates (`backend/src/controllers/taskController.js`)

#### Import Date Utils

```javascript
import { validateDeadline } from "../utils/dateUtils.js";
```

#### Create Task with Deadline Validation

```javascript
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, skills, creditPoints, deadline } = req.body;

  // Validate deadline is in the future
  const deadlineDate = new Date(deadline);
  const validationResult = validateDeadline(deadlineDate, 0);

  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      message: validationResult.error,
    });
  }

  const task = await Task.create({
    title,
    description,
    skills,
    creditPoints,
    deadline: deadlineDate,
    postedBy: req.user.id,
    posterRole: req.user.role,
  });

  res.status(201).json({
    success: true,
    task,
  });
});
```

---

## Data Flow

### Frontend to Backend

1. **User Input**: User selects date using DatePicker (DD-MM-YYYY display)
2. **Component Processing**: DatePicker converts to ISO format (YYYY-MM-DD)
3. **API Call**: Frontend sends ISO format to backend
4. **Server Processing**: Backend receives YYYY-MM-DD, validates using dateUtils
5. **Database Storage**: Stored as MongoDB Date object

### Backend to Frontend

1. **Database Query**: MongoDB returns Date object
2. **API Response**: Returned as ISO string (YYYY-MM-DD)
3. **Frontend Display**: useDateFormatter converts to DD-MM-YYYY or readable format
4. **User Display**: Shows in human-readable format

---

## API Endpoints

### Create Task (with deadline)

```http
POST /api/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Design Homepage",
  "description": "Create a modern homepage design",
  "skills": ["UI Design", "Figma"],
  "deadline": "2026-03-25",
  "creditPoints": 50
}
```

**Response:**

```javascript
{
  "success": true,
  "task": {
    "_id": "...",
    "title": "Design Homepage",
    "deadline": "2026-03-25T00:00:00.000Z",
    "status": "open",
    "postedBy": {...},
    "createdAt": "2026-03-19T10:30:00.000Z"
  }
}
```

### Get Tasks (with deadline filtering)

```http
GET /api/tasks?page=1&limit=10
Authorization: Bearer <token>
```

---

## Usage Examples

### Example 1: Post Task Form

```jsx
import { useState } from "react";
import { DatePicker } from "../components";
import { taskService } from "../services/taskService";

function PostTask() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await taskService.createTask(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DatePicker
        name="deadline"
        value={formData.deadline}
        onChange={handleChange}
        minDate={new Date().toISOString().split("T")[0]}
      />
      <button type="submit">Post Task</button>
    </form>
  );
}
```

### Example 2: Display Deadline

```jsx
import { useDateFormatter } from "../hooks/useDateFormatter";

function TaskCard({ task }) {
  const {
    formatToReadable,
    getDaysUntil,
    getDeadlineStatus,
    getDeadlineColor,
  } = useDateFormatter();

  return (
    <div>
      <h3>{task.title}</h3>
      <p className={getDeadlineColor(task.deadline)}>
        {formatToReadable(task.deadline)}
      </p>
      <p>{getDeadlineStatus(task.deadline)}</p>
    </div>
  );
}
```

### Example 3: Backend Task Filtering

```javascript
import { getDateRange } from "../utils/dateUtils.js";

// Get tasks due this week
const { startDate, endDate } = getDateRange("week");
const tasks = await Task.find({
  deadline: { $gte: startDate, $lt: endDate },
});
```

---

## Validation Rules

### Frontend Validation

- ✅ Date format: DD-MM-YYYY
- ✅ Min date: Tomorrow (or configurable)
- ✅ Auto-formatting while typing
- ✅ Calendar selected date highlighting

### Backend Validation

- ✅ Deadline must be in the future
- ✅ Valid date object
- ✅ Configurable min days ahead
- ✅ Detailed error messages

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized

---

## Performance Notes

- DatePicker uses controlled component pattern
- Calendar rendering optimized with useMemo (if needed)
- No external date libraries (moment, date-fns) - lightweight
- Backend date utils are pure functions (no side effects)

---

## Future Enhancements

- [ ] Time picker integration
- [ ] Date range selection
- [ ] Recurring deadline patterns
- [ ] Timezone support
- [ ] Calendar view in Dashboard
- [ ] Deadline notifications

---

## Testing

### Frontend Testing

```javascript
// Test date formatting
const { formatToDDMMYYYY } = useDateFormatter();
expect(formatToDDMMYYYY("2026-03-19")).toBe("19-03-2026");

// Test days calculation
const { getDaysUntil } = useDateFormatter();
expect(getDaysUntil("2026-03-20")).toBe(1); // Tomorrow
```

### Backend Testing

```javascript
import { validateDeadline, getDaysUntilDeadline } from "../utils/dateUtils";

// Test deadline validation
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
expect(validateDeadline(tomorrow).valid).toBe(true);

// Test past date
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
expect(validateDeadline(yesterday).valid).toBe(false);
```

---

## Support & Troubleshooting

### Issue: Date not saving

- Check that backend receives ISO format (YYYY-MM-DD)
- Verify dateUtils import in controller
- Check MongoDB date field settings

### Issue: Calendar not opening

- Ensure DatePicker is imported from components
- Check z-index conflicts with other modals
- Verify event handlers are properly bound

### Issue: Timezone issues

- Always use UTC times in database
- Convert to local time in frontend display
- Use toISOString() for consistency

---

**Created:** March 19, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
