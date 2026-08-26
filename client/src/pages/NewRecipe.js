import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { createRecipe } from '../services/api';
import { useNavigate } from 'react-router-dom';

const categories = ['Viennoiserie', 'Entremets', 'Petits Fours', 'Tarts', 'Bread', 'Other'];

function NewRecipe() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: '', yield_quantity: '', yield_unit: '',
    prep_time_minutes: '', bake_time_minutes: '', notes: ''
  });
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleIngredient = (i, e) => {
    const updated = [...ingredients];
    updated[i][e.target.name] = e.target.value;
    setIngredients(updated);
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    await createRecipe({ ...form, ingredients });
    navigate('/');
  };

  return (
    <Box sx={{ mt: 3, maxWidth: 700 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>New Recipe</Typography>

      <TextField fullWidth label="Recipe Name" name="name" value={form.name} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth select label="Category" name="category" value={form.category} onChange={handleChange} sx={{ mb: 2 }}>
        {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </TextField>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth label="Yield Quantity" name="yield_quantity" value={form.yield_quantity} onChange={handleChange} />
        <TextField fullWidth label="Yield Unit" name="yield_unit" value={form.yield_unit} onChange={handleChange} placeholder="pieces, kg..." />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth label="Prep Time (min)" name="prep_time_minutes" value={form.prep_time_minutes} onChange={handleChange} />
        <TextField fullWidth label="Bake Time (min)" name="bake_time_minutes" value={form.bake_time_minutes} onChange={handleChange} />
      </Box>
      <TextField fullWidth multiline rows={3} label="Notes" name="notes" value={form.notes} onChange={handleChange} sx={{ mb: 3 }} />

      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Ingredients</Typography>

      {ingredients.map((ing, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
          <TextField label="Name" name="name" value={ing.name} onChange={e => handleIngredient(i, e)} sx={{ flex: 2 }} />
          <TextField label="Qty" name="quantity" value={ing.quantity} onChange={e => handleIngredient(i, e)} sx={{ flex: 1 }} />
          <TextField label="Unit" name="unit" value={ing.unit} onChange={e => handleIngredient(i, e)} sx={{ flex: 1 }} />
          <IconButton onClick={() => removeIngredient(i)} color="error"><DeleteIcon /></IconButton>
        </Box>
      ))}

      <Button startIcon={<AddIcon />} onClick={addIngredient} sx={{ mt: 1, mb: 3 }}>Add Ingredient</Button>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" sx={{ backgroundColor: '#4a2c2a' }} onClick={handleSubmit}>Save Recipe</Button>
        <Button variant="outlined" onClick={() => navigate('/')}>Cancel</Button>
      </Box>
    </Box>
  );
}

export default NewRecipe;
