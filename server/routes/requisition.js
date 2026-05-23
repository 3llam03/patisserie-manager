const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireChef } = require('../middleware/auth');
require('dotenv').config();

// Generate mise en place / requisition
router.post('/generate', authenticate, requireChef, async (req, res) => {
  const { items } = req.body;
  // items = [{ recipe_id, quantity_to_produce }]
  try {
    const aggregated = {};

    for (const item of items) {
      const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [item.recipe_id]);
      const ingredients = await pool.query('SELECT * FROM ingredients WHERE recipe_id = $1', [item.recipe_id]);

      const baseYield = recipe.rows[0].yield_quantity || 1;
      const multiplier = item.quantity_to_produce / baseYield;

      for (const ing of ingredients.rows) {
        const key = `${ing.name}__${ing.unit}`;
        if (!aggregated[key]) {
          aggregated[key] = { name: ing.name, unit: ing.unit, quantity: 0 };
        }
        aggregated[key].quantity += parseFloat(ing.quantity) * multiplier;
      }
    }

    const list = Object.values(aggregated).map(i => ({
      ...i,
      quantity: Math.ceil(i.quantity * 100) / 100
    })).sort((a, b) => a.name.localeCompare(b.name));

    res.json({ list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
