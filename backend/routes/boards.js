const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all boards
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM boards ORDER BY created_at DESC'
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching boards:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Create new board
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name } = req.body;
    const result = await client.query(
      'INSERT INTO boards (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Get tasks for a specific board
router.get('/:id/tasks', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM tasks WHERE board_id = $1 ORDER BY column_id, column_order',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router; 