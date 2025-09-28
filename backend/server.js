const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/announcements', require('./routes/announcements'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Career Reach Hub API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      resources: '/api/resources',
      applications: '/api/applications',
      announcements: '/api/announcements'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler - catch all other routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Test email route (add to server.js temporarily)
// Remove this route in production
app.get('/api/test-email/:email', async (req, res) => {
  const emailService = require('./services/emailService');
  
  try {
    const testResult = await emailService.testEmailConnection();
    if (!testResult.success) {
      return res.status(500).json(testResult);
    }
    
    const result = await emailService.sendTestEmail(req.params.email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Email service health check
app.get('/api/email/health', async (req, res) => {
  const emailService = require('./services/emailService');
  const result = await emailService.testEmailConnection();
  res.json(result);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/`);
});