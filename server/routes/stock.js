const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

// Get all stock
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stock ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update stock quantity
router.patch('/:id', authenticate, async (req, res) => {
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE stock SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
