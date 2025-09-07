const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /events/:id/register - Register student for an event
router.post('/:id/register', (req, res) => {
  const eventId = req.params.id;
  const { student_id } = req.body;

  // Validation
  if (!student_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: student_id'
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

      // Check if already registered
      db.get('SELECT reg_id FROM Registrations WHERE student_id = ? AND event_id = ?', 
        [student_id, eventId], (err, regRow) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        if (regRow) {
          return res.status(409).json({
            success: false,
            message: 'Student is already registered for this event'
          });
        }

        // Insert registration
        const sql = 'INSERT INTO Registrations (student_id, event_id) VALUES (?, ?)';
        db.run(sql, [student_id, eventId], function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Failed to register student',
              error: err.message
            });
          }

          res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: {
              reg_id: this.lastID,
              student_id,
              event_id: eventId
            }
          });
        });
      });
    });
  });
});

// GET /events/:id/registrations - Get all registrations for an event
router.get('/:id/registrations', (req, res) => {
  const eventId = req.params.id;

  const sql = `
    SELECT r.reg_id, s.student_id, s.name, s.email, c.name as college_name
    FROM Registrations r
    JOIN Students s ON r.student_id = s.student_id
    JOIN Colleges c ON s.college_id = c.college_id
    WHERE r.event_id = ?
    ORDER BY s.name
  `;

  db.all(sql, [eventId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Registrations fetched successfully',
      data: rows
    });
  });
});

module.exports = router;
