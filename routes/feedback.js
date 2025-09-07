const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /events/:id/feedback - Submit feedback for an event
router.post('/:id/feedback', (req, res) => {
  const eventId = req.params.id;
  const { student_id, rating } = req.body;

  // Validation
  if (!student_id || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: student_id, rating'
    });
  }

  // Validate rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5'
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

      // Check if feedback already submitted
      db.get('SELECT feedback_id FROM Feedback WHERE student_id = ? AND event_id = ?', 
        [student_id, eventId], (err, feedbackRow) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        if (feedbackRow) {
          return res.status(409).json({
            success: false,
            message: 'Feedback already submitted for this event'
          });
        }

        // Insert feedback
        const sql = 'INSERT INTO Feedback (student_id, event_id, rating) VALUES (?, ?, ?)';
        db.run(sql, [student_id, eventId, rating], function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Failed to submit feedback',
              error: err.message
            });
          }

          res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
              feedback_id: this.lastID,
              student_id,
              event_id: eventId,
              rating
            }
          });
        });
      });
    });
  });
});

// GET /events/:id/feedback - Get all feedback for an event
router.get('/:id/feedback', (req, res) => {
  const eventId = req.params.id;

  const sql = `
    SELECT f.feedback_id, s.student_id, s.name, s.email, f.rating, c.name as college_name
    FROM Feedback f
    JOIN Students s ON f.student_id = s.student_id
    JOIN Colleges c ON s.college_id = c.college_id
    WHERE f.event_id = ?
    ORDER BY f.rating DESC
  `;

  db.all(sql, [eventId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback',
        error: err.message
      });
    }

    // Calculate average rating
    const avgRating = rows.length > 0 
      ? (rows.reduce((sum, row) => sum + row.rating, 0) / rows.length).toFixed(2)
      : 0;

    res.json({
      success: true,
      message: 'Feedback fetched successfully',
      data: {
        feedback: rows,
        average_rating: parseFloat(avgRating),
        total_responses: rows.length
      }
    });
  });
});

module.exports = router;
