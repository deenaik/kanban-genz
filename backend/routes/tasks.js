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
  console.log('Update request received:', {
    params: req.params,
    body: req.body
  });
  const { id } = req.params;
  const { content, column_id, column_order } = req.body;
  
  try {
    // First check if the task exists
    const checkTask = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (checkTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the task
    const result = await pool.query(
      `UPDATE tasks 
       SET content = COALESCE($1, content),
           column_id = COALESCE($2, column_id),
           column_order = COALESCE($3, column_order)
       WHERE id = $4 
       RETURNING *`,
      [content, column_id, column_order, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ 
      error: err.message,
      details: err.stack 
    });
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