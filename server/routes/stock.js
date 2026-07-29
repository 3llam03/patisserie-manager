const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stock ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  const { quantity, min_quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE stock SET quantity = COALESCE($1, quantity), min_quantity = COALESCE($2, min_quantity) WHERE id = $3 RETURNING *',
      [quantity, min_quantity, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
