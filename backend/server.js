const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const boardRoutes = require('./routes/boards');
const authRoutes = require('./routes/auth');
const { checkDatabaseConnection } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize server
const startServer = async () => {
  try {
    // Check database connection before starting server
    await checkDatabaseConnection();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer(); 