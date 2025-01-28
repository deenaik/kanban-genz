const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY column_id, column_order'
    );
    console.log('Fetched tasks:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  const { content, column_id, column_order } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (content, column_id, column_order) VALUES ($1, $2, $3) RETURNING *',
      [content, column_id, column_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, column_id, column_order } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET content = $1, column_id = $2, column_order = $3 WHERE id = $4 RETURNING *',
      [content, column_id, column_order, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 