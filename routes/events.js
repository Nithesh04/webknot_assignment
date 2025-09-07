const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /events - Create a new event
router.post('/', (req, res) => {
  const { title, type, date, college_id } = req.body;

  // Validation
  if (!title || !type || !date || !college_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, type, date, college_id'
    });
  }

  // Check if college exists
  db.get('SELECT college_id FROM Colleges WHERE college_id = ?', [college_id], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    if (!row) {
      return res.status(400).json({
        success: false,
        message: 'College not found'
      });
    }

    // Insert new event
    const sql = 'INSERT INTO Events (title, type, date, college_id) VALUES (?, ?, ?, ?)';
    db.run(sql, [title, type, date, college_id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create event',
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: {
          event_id: this.lastID,
          title,
          type,
          date,
          college_id
        }
      });
    });
  });
});

// GET /events - List all events
router.get('/', (req, res) => {
  const sql = `
    SELECT e.*, c.name as college_name 
    FROM Events e 
    JOIN Colleges c ON e.college_id = c.college_id 
    ORDER BY e.date DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Events fetched successfully',
      data: rows
    });
  });
});

// GET /events/:id - Get specific event
router.get('/:id', (req, res) => {
  const eventId = req.params.id;

  const sql = `
    SELECT e.*, c.name as college_name 
    FROM Events e 
    JOIN Colleges c ON e.college_id = c.college_id 
    WHERE e.event_id = ?
  `;
  
  db.get(sql, [eventId], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event fetched successfully',
      data: row
    });
  });
});

module.exports = router;
