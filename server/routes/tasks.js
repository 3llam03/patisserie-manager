const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireChef } = require('../middleware/auth');
require('dotenv').config();

// Get all tasks (head chef sees all, staff sees only theirs)
router.get('/', authenticate, async (req, res) => {
  try {
    let query;
    let params;
    if (req.user.role === 'head_chef') {
      query = `
        SELECT t.*, u.name as assigned_to_name, r.name as recipe_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN recipes r ON t.recipe_id = r.id
        ORDER BY t.due_date ASC, t.priority DESC
      `;
      params = [];
    } else {
      query = `
        SELECT t.*, u.name as assigned_to_name, r.name as recipe_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN recipes r ON t.recipe_id = r.id
        WHERE t.assigned_to = $1
        ORDER BY t.due_date ASC, t.priority DESC
      `;
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's tasks
router.get('/today', authenticate, async (req, res) => {
  try {
    let query;
    let params;
    if (req.user.role === 'head_chef') {
      query = `
        SELECT t.*, u.name as assigned_to_name, r.name as recipe_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN recipes r ON t.recipe_id = r.id
        WHERE t.due_date = CURRENT_DATE
        ORDER BY t.priority DESC
      `;
      params = [];
    } else {
      query = `
        SELECT t.*, u.name as assigned_to_name, r.name as recipe_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN recipes r ON t.recipe_id = r.id
        WHERE t.assigned_to = $1 AND t.due_date = CURRENT_DATE
        ORDER BY t.priority DESC
      `;
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task (head chef only)
router.post('/', authenticate, requireChef, async (req, res) => {
  const { title, description, recipe_id, assigned_to, quantity, due_date, priority } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, recipe_id, assigned_to, created_by, quantity, due_date, priority)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, recipe_id, assigned_to, req.user.id, quantity, due_date, priority || 'normal']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task (head chef only)
router.delete('/:id', authenticate, requireChef, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
