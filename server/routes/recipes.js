const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireChef } = require('../middleware/auth');
require('dotenv').config();

// Get all recipes
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes ORDER BY category, name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single recipe with ingredients
router.get('/:id', authenticate, async (req, res) => {
  try {
    const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
    const ingredients = await pool.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id', [req.params.id]);
    res.json({ ...recipe.rows[0], ingredients: ingredients.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create recipe
router.post('/', authenticate, requireChef, async (req, res) => {
  const { name, category, yield_quantity, yield_unit, prep_time_minutes, bake_time_minutes, notes, ingredients } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO recipes (name, category, yield_quantity, yield_unit, prep_time_minutes, bake_time_minutes, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, category, yield_quantity, yield_unit, prep_time_minutes, bake_time_minutes, notes]
    );
    const recipe = result.rows[0];
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        await pool.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1,$2,$3,$4)',
          [recipe.id, ing.name, ing.quantity, ing.unit]
        );
      }
    }
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update recipe info
router.put('/:id', authenticate, requireChef, async (req, res) => {
  const { name, category, yield_quantity, yield_unit, prep_time_minutes, bake_time_minutes, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE recipes SET name=$1, category=$2, yield_quantity=$3, yield_unit=$4,
       prep_time_minutes=$5, bake_time_minutes=$6, notes=$7 WHERE id=$8 RETURNING *`,
      [name, category, yield_quantity, yield_unit, prep_time_minutes, bake_time_minutes, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update ingredients (replace all)
router.put('/:id/ingredients', authenticate, requireChef, async (req, res) => {
  const { ingredients } = req.body;
  try {
    await pool.query('DELETE FROM ingredients WHERE recipe_id = $1', [req.params.id]);
    for (const ing of ingredients) {
      if (ing.name) {
        await pool.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1,$2,$3,$4)',
          [req.params.id, ing.name, ing.quantity || 0, ing.unit || '']
        );
      }
    }
    const result = await pool.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete recipe
router.delete('/:id', authenticate, requireChef, async (req, res) => {
  try {
    await pool.query('DELETE FROM recipes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Recette supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
