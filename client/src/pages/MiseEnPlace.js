import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField,
  Button, Chip, Divider, IconButton, Autocomplete, Table,
  TableBody, TableCell, TableHead, TableRow, Paper, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { getRecipes } from '../services/api';

const BASE = 'http://localhost:5000/api';
const req = (method, path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {})
  }).then(r => r.json());
};

function MiseEnPlace() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [items, setItems] = useState([]);
  const [requisition, setRequisition] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    getRecipes().then(res => setRecipes(res.data));
  }, []);

  const handleAdd = () => {
    if (!selectedRecipe || !quantity) { setError('Please select a recipe and quantity'); return; }
    if (items.find(i => i.recipe_id === selectedRecipe.id)) { setError('Recipe already added'); return; }
    setItems([...items, {
      recipe_id: selectedRecipe.id,
      name: selectedRecipe.name,
      quantity_to_produce: parseInt(quantity),
      yield_unit: selectedRecipe.yield_unit || 'pcs'
    }]);
    setSelectedRecipe(null);
    setQuantity('');
    setError('');
    setRequisition(null);
  };

  const handleRemove = (id) => {
    setItems(items.filter(i => i.recipe_id !== id));
    setRequisition(null);
  };

  const handleGenerate = async () => {
    if (items.length === 0) { setError('Add at least one recipe'); return; }
    setLoading(true);
    const result = await req('POST', '/requisition/generate', { items });
    setRequisition(result.list);
    setLoading(false);
  };

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Mise en Place - ${new Date().toLocaleDateString('fr-FR')}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #4a2c2a; }
        h3 { color: #4a2c2a; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #4a2c2a; color: white; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f5f2; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .recipe-list { margin-bottom: 20px; }
        .recipe-item { display: inline-block; margin: 4px; padding: 4px 10px; background: #f0e6e0; border-radius: 12px; font-size: 13px; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Mise en Place</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sélectionnez les recettes et quantités pour générer la liste de réquisition pour l'économat.
      </Typography>

      {/* Recipe selector */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography fontWeight="bold" sx={{ mb: 2 }}>Ajouter une recette</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Autocomplete
              options={recipes}
              getOptionLabel={r => r.name}
              value={selectedRecipe}
              onChange={(_, val) => setSelectedRecipe(val)}
              sx={{ flex: 2, minWidth: 250 }}
              renderInput={params => <TextField {...params} label="Recette" />}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography>{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{option.category}</Typography>
                  </Box>
                </li>
              )}
            />
            <TextField
              label="Quantité à produire"
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              sx={{ flex: 1, minWidth: 150 }}
              InputProps={{ endAdornment: selectedRecipe?.yield_unit || 'pcs' }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: '#4a2c2a', height: 56 }}
              onClick={handleAdd}
            >
              Ajouter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Selected items */}
      {items.length > 0 && (
        <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>Recettes sélectionnées ({items.length})</Typography>
            <Grid container spacing={2}>
              {items.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.recipe_id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, backgroundColor: '#f9f5f2', borderRadius: 2 }}>
                    <Box>
                      <Typography fontWeight="bold" variant="body2">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantity_to_produce} {item.yield_unit}
                      </Typography>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleRemove(item.recipe_id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Button
              variant="contained"
              sx={{ mt: 3, backgroundColor: '#4a2c2a' }}
              onClick={handleGenerate}
              disabled={loading}
              size="large"
              fullWidth
            >
              {loading ? 'Génération...' : '🧾 Générer la Liste de Réquisition'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Requisition result */}
      {requisition && (
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">🧾 Liste de Réquisition — Économat</Typography>
              <Button startIcon={<PrintIcon />} variant="outlined" onClick={handlePrint}>
                Imprimer / PDF
              </Button>
            </Box>

            <div ref={printRef}>
              <h1 style={{ color: '#4a2c2a', fontFamily: 'Arial' }}>
                Liste de Réquisition — Pâtisserie
              </h1>
              <p style={{ fontFamily: 'Arial' }}>
                Date: {new Date().toLocaleDateString('fr-FR')} &nbsp;|&nbsp;
                Chef: Adil
              </p>

              <h3 style={{ fontFamily: 'Arial' }}>Recettes à produire:</h3>
              <div className="recipe-list">
                {items.map(item => (
                  <span key={item.recipe_id} className="recipe-item">
                    {item.name} × {item.quantity_to_produce}
                  </span>
                ))}
              </div>

              <Divider sx={{ my: 2 }} />

              <h3 style={{ fontFamily: 'Arial' }}>Ingrédients nécessaires:</h3>
              <Table size="small" component={Paper} elevation={0}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#4a2c2a' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Ingrédient</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Quantité</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Unité</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requisition.map((ing, i) => (
                    <TableRow key={i} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f5f2' }}>
                      <TableCell>{ing.name}</TableCell>
                      <TableCell align="right"><b>{ing.quantity}</b></TableCell>
                      <TableCell>{ing.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default MiseEnPlace;
