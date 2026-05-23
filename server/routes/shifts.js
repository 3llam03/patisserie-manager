const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireChef } = require('../middleware/auth');
require('dotenv').config();

router.get('/', authenticate, async (req, res) => {
  const { start, end } = req.query;
  try {
    const result = await pool.query(`
      SELECT s.*, u.name as user_name, u.role as user_role
      FROM shifts s
      JOIN users u ON s.user_id = u.id
      WHERE s.shift_date BETWEEN $1 AND $2
      ORDER BY s.shift_date, s.shift_type
    `, [start, end]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireChef, async (req, res) => {
  const { user_id, shift_date, shift_type } = req.body;
  try {
    // Check if this shift slot is already taken by someone else
    const slotTaken = await pool.query(
      'SELECT id FROM shifts WHERE shift_date = $1 AND shift_type = $2',
      [shift_date, shift_type]
    );
    if (slotTaken.rows.length > 0) {
      // Update the existing slot
      const result = await pool.query(
        'UPDATE shifts SET user_id = $1 WHERE shift_date = $2 AND shift_type = $3 RETURNING *',
        [user_id, shift_date, shift_type]
      );
      return res.json(result.rows[0]);
    }
    // Check if user already has a shift that day
    const userBusy = await pool.query(
      'SELECT id, shift_type FROM shifts WHERE user_id = $1 AND shift_date = $2',
      [user_id, shift_date]
    );
    if (userBusy.rows.length > 0) {
      return res.status(400).json({
        error: `Cette personne est déjà affectée au shift ${userBusy.rows[0].shift_type} ce jour-là`
      });
    }
    const result = await pool.query(
      'INSERT INTO shifts (user_id, shift_date, shift_type, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [user_id, shift_date, shift_type, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireChef, async (req, res) => {
  try {
    await pool.query('DELETE FROM shifts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Shift supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
