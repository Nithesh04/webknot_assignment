const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /reports/popularity - Events sorted by number of registrations
router.get('/popularity', (req, res) => {
  const sql = `
    SELECT 
      e.event_id,
      e.title,
      e.type,
      e.date,
      c.name as college_name,
      COUNT(r.reg_id) AS registrations
    FROM Events e
    LEFT JOIN Registrations r ON e.event_id = r.event_id
    JOIN Colleges c ON e.college_id = c.college_id
    GROUP BY e.event_id
    ORDER BY registrations DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch popularity report',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Popularity report fetched successfully',
      data: rows
    });
  });
});

// GET /reports/student/:id - Student participation (number of events attended)
router.get('/student/:id', (req, res) => {
  const studentId = req.params.id;

  // First check if student exists
  db.get('SELECT * FROM Students WHERE student_id = ?', [studentId], (err, student) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student participation data
    const sql = `
      SELECT 
        s.student_id,
        s.name,
        s.email,
        c.name as college_name,
        COUNT(a.att_id) AS events_attended,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS events_present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS events_absent,
        COUNT(r.reg_id) AS total_registrations
      FROM Students s
      JOIN Colleges c ON s.college_id = c.college_id
      LEFT JOIN Attendance a ON s.student_id = a.student_id
      LEFT JOIN Registrations r ON s.student_id = r.student_id
      WHERE s.student_id = ?
      GROUP BY s.student_id
    `;

    db.get(sql, [studentId], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch student participation',
          error: err.message
        });
      }

      res.json({
        success: true,
        message: 'Student participation report fetched successfully',
        data: row
      });
    });
  });
});

// GET /reports/top-students - Top 3 most active students (by attendance)
router.get('/top-students', (req, res) => {
  const sql = `
    SELECT 
      s.student_id,
      s.name,
      s.email,
      c.name as college_name,
      COUNT(a.att_id) AS events_attended
    FROM Students s
    JOIN Attendance a ON s.student_id = a.student_id
    JOIN Colleges c ON s.college_id = c.college_id
    WHERE a.status = 'present'
    GROUP BY s.student_id
    ORDER BY events_attended DESC
    LIMIT 3
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch top students report',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Top students report fetched successfully',
      data: rows
    });
  });
});

// GET /reports/overview - General overview statistics
router.get('/overview', (req, res) => {
  const queries = {
    totalEvents: 'SELECT COUNT(*) as count FROM Events',
    totalStudents: 'SELECT COUNT(*) as count FROM Students',
    totalRegistrations: 'SELECT COUNT(*) as count FROM Registrations',
    totalAttendance: 'SELECT COUNT(*) as count FROM Attendance WHERE status = "present"',
    totalFeedback: 'SELECT COUNT(*) as count FROM Feedback',
    avgRating: 'SELECT AVG(rating) as avg FROM Feedback'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch overview statistics',
          error: err.message
        });
      }

      results[key] = row.count || row.avg || 0;
      completed++;

      if (completed === total) {
        res.json({
          success: true,
          message: 'Overview statistics fetched successfully',
          data: results
        });
      }
    });
  });
});

module.exports = router;
