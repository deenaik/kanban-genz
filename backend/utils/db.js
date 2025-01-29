const { pool } = require('../db');

// Utility function to execute queries with automatic client release
const executeQuery = async (queryFn) => {
  const client = await pool.connect();
  try {
    return await queryFn(client);
  } finally {
    client.release();
  }
};

// Function to check database connection on startup
const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('Database connection successful');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

module.exports = {
  executeQuery,
  checkDatabaseConnection
}; 