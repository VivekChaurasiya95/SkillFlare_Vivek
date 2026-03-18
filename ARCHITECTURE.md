# DatePicker Architecture & Integration Map

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE (DD-MM-YYYY)                      │
│                                                                          │
│                    ┌──────────────────────────────────┐                │
│                    │      DatePicker Component         │                │
│                    ├──────────────────────────────────┤                │
│                    │ • Display: DD-MM-YYYY            │                │
│                    │ • Auto-formatting input          │                │
│                    │ • Calendar widget                │                │
│                    │ • Min/max constraints            │                │
│                    │ • Error states                   │                │
│                    └──────────────────────────────────┘                │
│                                  │                                      │
│                     Emits: YYYY-MM-DD (ISO)                            │
│                                  │                                      │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ formData.deadline = "2026-03-19"
                       │ onChange handler
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FORM MANAGEMENT                                 │
│                                                                          │
│    PostTask Component (src/pages/PostTask.jsx)                         │
│    ├─ formData.deadline (stored as YYYY-MM-DD)                        │
│    ├─ Validation logic                                                 │
│    ├─ Error messages                                                   │
│    └─ Form submission                                                  │
│                                                                          │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ await taskService.createTask(formData)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API SERVICE LAYER                               │
│                                                                          │
│    taskService.createTask()                                            │
│    ├─ Sends: { deadline: "2026-03-19", ... }                          │
│    └─ POST /api/tasks                                                  │
│                                                                          │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ HTTP POST (YYYY-MM-DD format)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND VALIDATION LAYER                             │
│                                                                          │
│    taskController.createTask()                                         │
│    ├─ Receives deadline: "2026-03-19"                                 │
│    ├─ validateDeadline(deadline) [from dateUtils.js]                 │
│    │  ├─ Check: Is it a valid date? ✓                                │
│    │  ├─ Check: Is it in the future? ✓                               │
│    │  └─ Return: { valid: true } or { valid: false, error: "..." }  │
│    │                                                                   │
│    ├─ IF VALID:                                                        │
│    │  └─ Create: new Date("2026-03-19")                              │
│    │                                                                   │
│    └─ IF INVALID:                                                      │
│       └─ Return 400 Bad Request                                        │
│                                                                          │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE STORAGE                                   │
│                                                                          │
│    MongoDB Task Document                                               │
│    {                                                                    │
│      _id: ObjectId(...),                                               │
│      title: "Design Homepage",                                         │
│      deadline: ISODate("2026-03-19T00:00:00.000Z"),  ← Date Object   │
│      status: "open",                                                    │
│      ...other fields                                                   │
│    }                                                                    │
│                                                                          │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ Fetch from DB
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     API RESPONSE LAYER                                  │
│                                                                          │
│    Response to Frontend                                                │
│    {                                                                    │
│      success: true,                                                    │
│      task: {                                                           │
│        _id: "...",                                                     │
│        title: "Design Homepage",                                       │
│        deadline: "2026-03-19T00:00:00.000Z",  ← ISO String           │
│        ...other fields                                                 │
│      }                                                                 │
│    }                                                                    │
│                                                                          │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ HTTP Response (YYYY-MM-DD ISO format)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND DISPLAY LAYER                              │
│                                                                          │
│    useDateFormatter Hook (src/hooks/useDateFormatter.js)              │
│    ├─ formatToReadable("2026-03-19")   → "Thu, 19 Mar 2026"          │
│    ├─ formatToDDMMYYYY("2026-03-19")   → "19-03-2026"                │
│    ├─ getDaysUntil("2026-03-19")       → 5                            │
│    ├─ getDeadlineStatus("2026-03-19")  → "5 days left"               │
│    ├─ getDeadlineColor("2026-03-19")   → "text-green-500"            │
│    └─ isOverdue("2026-03-19")          → false                        │
│                                                                          │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ TaskCard Component
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER SEES ON SCREEN                                  │
│                                                                          │
│    ┌──────────────────────────────────────────┐                       │
│    │ Design Homepage                           │                       │
│    │                                            │                       │
│    │ Deadline: Thu, 19 Mar 2026                │                       │
│    │ Status: 5 days left (green text)         │                       │
│    │                                            │                       │
│    │ [View Details]                            │                       │
│    └──────────────────────────────────────────┘                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Transformation Flow

```
Input (User Types)
    │
    │ "192020262026" → "19-20-2026" (auto-format) → Invalid!
    │ "19032026"     → "19-03-2026" → Valid DD-MM-YYYY ✓
    │
    ▼
DatePicker Processing
    │
    │ Parse: "19-03-2026" → [19, 03, 2026]
    │ Convert: [19, 03, 2026] → "2026-03-19"
    │ Validate: Is future? ✓
    │
    ▼
Form State (Internal)
    │
    │ formData.deadline = "2026-03-19" ← ISO format stored
    │
    ▼
API Transmission
    │
    │ JSON Body: { "deadline": "2026-03-19" }
    │ Send to: POST /api/tasks
    │
    ▼
Backend Processing
    │
    │ Receive: deadline = "2026-03-19"
    │ Validate: validateDeadline(new Date("2026-03-19"))
    │ Create: new Date("2026-03-19") → Date object
    │ Save to DB: ISODate("2026-03-19T00:00:00.000Z")
    │
    ▼
Database Storage
    │
    │ MongoDB holds Date object natively
    │
    ▼
API Response
    │
    │ { deadline: "2026-03-19T00:00:00.000Z" }
    │ Returned as ISO string
    │
    ▼
Frontend Display (useDateFormatter)
    │
    │ Input: "2026-03-19T00:00:00.000Z"
    │ formatToReadable() → "Thu, 19 Mar 2026"
    │ formatToDDMMYYYY() → "19-03-2026"
    │
    ▼
User Sees
    │
    │ Display Format: "Thu, 19 Mar 2026" or "19-03-2026"
    │ Readable for user ✓
    │
```

---

## 📊 Component Dependencies

```
Users Request
    │
    ├─────────────┬──────────────────────────────┐
    │             │                              │
    ▼             ▼                              ▼
Frontend      Backend                        Database
    │             │                              │
    │             │                              │
┌───┴─────────┐   │      ┌────────────────────┐  │
│  PostTask   │   │      │  dateUtils.js      │  │
│  Component  │───┼──────│  ├─ validateDate()│  │
│             │   │      │  ├─ formatDate()  │  │
│  uses:      │   │      │  └─ getDaysUntil()   │
│  ├─DatePick│   │      └────────────────────┘  │
│  │┌────────│   │                              │
│  ││        │   │      ┌────────────────────┐  │
│  │└DatePic│   │      │TaskController      │  │
│  │ in form│   │      │├─createTask()      │─────► Save
│  │        │   │      │├─validate deadline │  │   Task
│  └────────┘   │      │└─handle errors     │  │
│               │      └────────────────────┘  │
│  Display:     │                              │
│  ├─useDateFor│   ┌────────────────────────┐  │
│  │ matterHook┼──│  API Response          │  │
│  │  ├─format │   │  deadline: ISO format │  │
│  │  └─days   │   └────────────────────────┘  │
│  │ Until     │                              │
│  └────────┘   │                              │
│               │                              │
└───────────────┴──────────────────────────────┘
```

---

## 📈 Integration Points

### Frontend Integration

```jsx
1. Components/DatePicker.jsx
   ├─ Imported in: PostTask.jsx
   ├─ Props: value, onChange, minDate, error
   └─ Returns: ISO format (YYYY-MM-DD)

2. Hooks/useDateFormatter.js
   ├─ Used in: TaskCard, Dashboard, etc.
   ├─ Methods: 9 formatting/calculation functions
   └─ Returns: Readable strings, numbers, colors

3. PostTask.jsx Form
   ├─ field: deadline
   ├─ Component: <DatePicker />
   └─ Validation: errors.deadline
```

### Backend Integration

```javascript
1. dateUtils.js
   ├─ Used in: taskController.js
   ├─ Method: validateDeadline()
   └─ Usage: Validates before Task creation

2. taskController.js
   ├─ Endpoint: POST /api/tasks
   ├─ Validation: validateDeadline()
   ├─ Storage: new Date(deadline)
   └─ Error Response: 400 Bad Request
```

---

## 🔌 File Connections

```
┌─────────────────────────────────────────────────────────────┐
│                     Index Files                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  components/index.js                                        │
│  ├─ exports DatePicker ────────┐                           │
│  │                            │                            │
│  └─ imported by: PostTask.jsx │                            │
│                            │                            │
│  hooks/index.js                                            │
│  ├─ exports useDateFormatter ──┐                          │
│  │                            │                            │
│  └─ imported by: TaskCard,  │                            │
│     Dashboard, etc.        │                            │
│                            │                            │
└────────────────────────────┴────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Build                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Output: DatePicker component                              │
│  Output: useDateFormatter hook                             │
│  Output: Integrated in PostTask                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              User Browser                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DatePicker visible in form                                │
│  Ready for user interaction                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ User selects date
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              API Call                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/tasks                                           │
│  { deadline: "2026-03-19" }                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Processing                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  taskController.createTask()                               │
│  ├─ Import: dateUtils                                      │
│  ├─ Call: validateDeadline()                               │
│  └─ If valid: Create Task in DB                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Integration Points Summary

| Layer            | Component        | File                          | Function                     |
| ---------------- | ---------------- | ----------------------------- | ---------------------------- |
| **UI**           | DatePicker       | components/DatePicker.jsx     | Display & capture date input |
| **UI Utilities** | useDateFormatter | hooks/useDateFormatter.js     | Format & calculate dates     |
| **Form**         | PostTask         | pages/PostTask.jsx            | Use DatePicker component     |
| **API**          | taskService      | services/taskService.js       | Send to backend              |
| **Backend**      | dateUtils        | utils/dateUtils.js            | Utility functions            |
| **Validation**   | taskController   | controllers/taskController.js | Validate deadline            |
| **Storage**      | Task Model       | models/Task.js                | Store in database            |

---

## 🗂️ File Tree with Relationships

```
frontend/
├── src/
│   ├── components/
│   │   ├── DatePicker.jsx ←─────────┐
│   │   ├── index.js (exports)       │
│   │   └─ ... others                │
│   │                                 │
│   ├── hooks/                        │
│   │   ├── useDateFormatter.js ←──┐ │
│   │   ├── index.js (exports)    │ │
│   │   └─ ... others             │ │
│   │                              │ │
│   ├── pages/                     │ │
│   │   └── PostTask.jsx ──────────┴─┤
│   │       (imports both)           │
│   └── services/                    │
│       └── taskService.js ──────────┤
│           (sends data to API)      │
│                                    │
backend/                             │
├── src/                             │
│   ├── controllers/                 │
│   │   └── taskController.js ───────┘
│   │       (validates deadline)
│   │
│   ├── utils/
│   │   └── dateUtils.js ┐
│   │       (pure functions)
│   │
│   └── models/
│       └── Task.js
│           (stores date)
```

---

## 🚀 Complete Flow Diagram

```
STEP 1: User Opens Form
   └─→ PostTask component renders
       └─→ DatePicker component loads

STEP 2: User Interacts with DatePicker
   └─→ Clicks/types date
       └─→ Auto-formats as DD-MM-YYYY
           └─→ Calendar shows selected date

STEP 3: User Submits Form
   └─→ formData.deadline = "2026-03-19"
       └─→ Calls taskService.createTask()
           └─→ Sends POST /api/tasks

STEP 4: Backend Receives Request
   └─→ taskController.createTask()
       └─→ Validates: validateDeadline()
           └─→ dateUtils.validateDeadline()
               └─→ Check: Valid date + Future date
                   └─→ IF ✓: Create task
                      └─→ IF ✗: Return 400 error

STEP 5: Response Sent to Frontend
   └─→ If OK (201): Task created
       └─→ Frontend refreshes
           └─→ useDateFormatter converts date
               └─→ User sees readable format

STEP 6: Display to User
   └─→ TaskCard shows deadline
       └─→ "Thu, 19 Mar 2026" (readable format)
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** March 19, 2026
