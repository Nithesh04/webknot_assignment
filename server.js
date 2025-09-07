const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const eventsRoutes = require('./routes/events');
const registerRoutes = require('./routes/register');
const attendanceRoutes = require('./routes/attendance');
const feedbackRoutes = require('./routes/feedback');
const reportsRoutes = require('./routes/reports');

// Use routes
app.use('/events', eventsRoutes);
app.use('/events', registerRoutes);
app.use('/events', attendanceRoutes);
app.use('/events', feedbackRoutes);
app.use('/reports', reportsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Campus Event Management Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      events: 'POST /events, GET /events',
      registration: 'POST /events/:id/register',
      attendance: 'POST /events/:id/attendance',
      feedback: 'POST /events/:id/feedback',
      reports: 'GET /reports/popularity, GET /reports/student/:id, GET /reports/top-students'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});