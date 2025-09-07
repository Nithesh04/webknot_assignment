const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /events/:id/attendance - Mark attendance for a student
router.post('/:id/attendance', (req, res) => {
  const eventId = req.params.id;
  const { student_id, status } = req.body;

  // Validation
  if (!student_id || !status) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: student_id, status'
    });
  }

  // Validate status
  if (!['present', 'absent'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either "present" or "absent"'
    });
  }

  // Check if event exists
  db.get('SELECT event_id FROM Events WHERE event_id = ?', [eventId], (err, eventRow) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    if (!eventRow) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if student exists
    db.get('SELECT student_id FROM Students WHERE student_id = ?', [student_id], (err, studentRow) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }

      if (!studentRow) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if attendance already marked
      db.get('SELECT att_id FROM Attendance WHERE student_id = ? AND event_id = ?', 
        [student_id, eventId], (err, attRow) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        if (attRow) {
          return res.status(409).json({
            success: false,
            message: 'Attendance already marked for this student'
          });
        }

        // Insert attendance
        const sql = 'INSERT INTO Attendance (student_id, event_id, status) VALUES (?, ?, ?)';
        db.run(sql, [student_id, eventId, status], function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Failed to mark attendance',
              error: err.message
            });
          }

          res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: {
              att_id: this.lastID,
              student_id,
              event_id: eventId,
              status
            }
          });
        });
      });
    });
  });
});

// GET /events/:id/attendance - Get all attendance for an event
router.get('/:id/attendance', (req, res) => {
  const eventId = req.params.id;

  const sql = `
    SELECT a.att_id, s.student_id, s.name, s.email, a.status, c.name as college_name
    FROM Attendance a
    JOIN Students s ON a.student_id = s.student_id
    JOIN Colleges c ON s.college_id = c.college_id
    WHERE a.event_id = ?
    ORDER BY s.name
  `;

  db.all(sql, [eventId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Attendance fetched successfully',
      data: rows
    });
  });
});

module.exports = router;
