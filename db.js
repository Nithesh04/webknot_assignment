const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'campus_events.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign key constraints
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
const initializeDatabase = () => {
  const createTables = `
    CREATE TABLE IF NOT EXISTS Colleges (
      college_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Students (
      student_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      college_id INTEGER,
      FOREIGN KEY (college_id) REFERENCES Colleges(college_id)
    );

    CREATE TABLE IF NOT EXISTS Events (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      college_id INTEGER,
      FOREIGN KEY (college_id) REFERENCES Colleges(college_id)
    );

    CREATE TABLE IF NOT EXISTS Registrations (
      reg_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      event_id INTEGER,
      UNIQUE(student_id, event_id),
      FOREIGN KEY (student_id) REFERENCES Students(student_id),
      FOREIGN KEY (event_id) REFERENCES Events(event_id)
    );

    CREATE TABLE IF NOT EXISTS Attendance (
      att_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      event_id INTEGER,
      status TEXT CHECK(status IN ('present','absent')),
      FOREIGN KEY (student_id) REFERENCES Students(student_id),
      FOREIGN KEY (event_id) REFERENCES Events(event_id)
    );

    CREATE TABLE IF NOT EXISTS Feedback (
      feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      event_id INTEGER,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      FOREIGN KEY (student_id) REFERENCES Students(student_id),
      FOREIGN KEY (event_id) REFERENCES Events(event_id)
    );
  `;

  db.exec(createTables, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    } else {
      console.log('Database tables created successfully');
      // Insert sample data
      insertSampleData();
    }
  });
};

// Insert sample data for testing
const insertSampleData = () => {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM Colleges", (err, row) => {
    if (err) {
      console.error('Error checking existing data:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const sampleData = `
        INSERT INTO Colleges (name) VALUES 
        ('Computer Science College'),
        ('Engineering College'),
        ('Business College');

        INSERT INTO Students (name, email, college_id) VALUES 
        ('John Doe', 'john.doe@email.com', 1),
        ('Jane Smith', 'jane.smith@email.com', 1),
        ('Mike Johnson', 'mike.johnson@email.com', 2),
        ('Sarah Wilson', 'sarah.wilson@email.com', 3),
        ('David Brown', 'david.brown@email.com', 2),
        ('Emily Davis', 'emily.davis@email.com', 1),
        ('Alex Chen', 'alex.chen@email.com', 3);

        INSERT INTO Events (title, type, date, college_id) VALUES 
        ('Tech Conference 2025', 'Conference', '2025-02-15', 1),
        ('Engineering Workshop', 'Workshop', '2025-02-20', 2),
        ('Business Seminar', 'Seminar', '2025-02-25', 3),
        ('Coding Bootcamp', 'Workshop', '2025-03-01', 1),
        ('Hackathon 2025', 'Workshop', '2025-09-15', 1);
      `;

      db.exec(sampleData, (err) => {
        if (err) {
          console.error('Error inserting sample data:', err.message);
        } else {
          console.log('Sample data inserted successfully');
        }
      });
    }
  });
};

// Initialize database on startup
initializeDatabase();

module.exports = db;
