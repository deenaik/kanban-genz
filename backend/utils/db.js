const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kanban',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

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
  checkDatabaseConnection,
  pool
}; 