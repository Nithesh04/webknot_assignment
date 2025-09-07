# Campus Event Management Platform

This project is a backend system built with **Node.js**, **Express**, and **SQLite**.  
It is designed to handle campus events, where admins can create events and students can register, mark attendance, and share feedback.  
The aim of this prototype is to show how a complete event workflow can be tracked and reported in a simple but structured way.

---

## 🚀 Getting Started

### Setup Instructions
1. Clone the repository or download the project files.  
2. Install all required dependencies:

```bash
npm install
```

Start the server:

```bash

npm start
```

For development with auto-reload, use:

```bash
npm run dev
```
The server runs by default at: http://localhost:3000

📊 Database Overview
The database uses SQLite and is created automatically when the project starts.
It contains the following tables:

Colleges → stores college information

Students → basic student details with a link to their college

Events → event details such as title, type, date, and college

Registrations → which student registered for which event

Attendance → attendance status (present/absent)

Feedback → feedback ratings for each event (1–5 scale)

Foreign keys are enabled to keep relationships valid, and duplicate registrations are prevented.

🔗 API Routes
Events
POST /events → Create a new event

GET /events → View all events

GET /events/:id → Get details of a specific event

Registrations
POST /events/:id/register → Register a student to an event

GET /events/:id/registrations → List all students registered for an event

Attendance
POST /events/:id/attendance → Mark a student’s attendance

GET /events/:id/attendance → View attendance list of an event

Feedback
POST /events/:id/feedback → Submit feedback (rating 1–5)

GET /events/:id/feedback → Get feedback for an event

Reports
GET /reports/popularity → Events sorted by registration count

GET /reports/student/:id → Participation details of a student

GET /reports/top-students → Top 3 students by attendance

GET /reports/overview → Quick stats across events and students

🧪 Seed Data
The system includes default sample data for quick testing:

A few colleges (e.g., Engineering, Computer Science, Business)

Students linked to those colleges

Sample events

Prefilled registrations, attendance records, and feedback

### Error Handling
The API handles common issues such as:

Preventing duplicate registrations

Validating feedback ratings (must be between 1–5)

Rejecting invalid or missing input

Handling cases where a student or event doesn’t exist

📂 Project Layout
```bash
campus-event-management/
├── server.js         # Entry point
├── db.js             # Database connection and schema setup
├── routes/
│   ├── events.js     # Event management routes
│   ├── register.js   # Student registration
│   ├── attendance.js # Attendance tracking
│   ├── feedback.js   # Feedback submission
│   └── reports.js    # Report generation
├── package.json
└── README.md

```

🔧 Tech Stack
Express.js → API framework

SQLite3 → Database engine

CORS → Allow cross-origin requests

Nodemon → For development auto-reload

📝 Workflow Example
Admin creates an event

Students register for the event

On event day, attendance is recorded

After the event, students give feedback

Reports are generated to analyze participation and event popularity

🎯 Key Features
Simple event creation and management

Student registration with duplicate check

Attendance tracking system

Feedback ratings for events

Reports on popularity, participation, and top students

Database consistency using foreign keys

Preloaded sample data for quick testing
