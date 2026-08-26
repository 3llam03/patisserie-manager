import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, Button, CircularProgress, Grid, TextField,
  InputAdornment, Slider, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getRecipe, deleteRecipe, updateIngredients } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Timer from '../components/Timer';

const categoryColors = {
  'Pâtisseries Classiques': '#6d4c41',
  'Pâtisseries Gourmandes': '#8e24aa',
  'Pâtisseries de Saison': '#2e7d32',
  'Pâtisseries Salées': '#1565c0',
  'Desserts Frais': '#f9a825',
};

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [multiplier, setMultiplier] = useState(1);
  const [targetQty, setTargetQty] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editIngredients, setEditIngredients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchRecipe = () => getRecipe(id).then(res => {
    setRecipe(res.data);
    setTargetQty(res.data.yield_quantity || 1);
  });

  useEffect(() => { fetchRecipe(); }, [id]);

  const handleTargetChange = (val) => {
    setTargetQty(val);
    if (recipe?.yield_quantity && val > 0) {
      setMultiplier(parseFloat((val / recipe.yield_quantity).toFixed(3)));
    }
  };

  const handleMultiplierChange = (val) => {
    setMultiplier(val);
    if (recipe?.yield_quantity) setTargetQty(Math.round(recipe.yield_quantity * val));
  };

  const scaleQty = (qty) => {
    const scaled = parseFloat(qty) * multiplier;
    return scaled % 1 === 0 ? scaled : parseFloat(scaled.toFixed(3));
  };

  const handleOpenEdit = () => {
    setEditIngredients(
      recipe.ingredients?.length > 0
        ? recipe.ingredients.map(i => ({ ...i }))
        : [{ name: '', quantity: '', unit: '' }]
    );
    setEditOpen(true);
    setSaveMsg('');
  };

  const handleIngChange = (i, field, val) => {
    const updated = [...editIngredients];
    updated[i][field] = val;
    setEditIngredients(updated);
  };

  const handleAddIng = () => setEditIngredients([...editIngredients, { name: '', quantity: '', unit: '' }]);
  const handleRemoveIng = (i) => setEditIngredients(editIngredients.filter((_, idx) => idx !== i));

  const handleSaveIngredients = async () => {
    setSaving(true);
    const valid = editIngredients.filter(i => i.name.trim());
    await updateIngredients(id, valid);
    await fetchRecipe();
    setSaving(false);
    setEditOpen(false);
    setSaveMsg('Ingrédients mis à jour !');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette recette ?')) {
      await deleteRecipe(id);
      navigate('/recipes');
    }
  };

  if (!recipe) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#c8a97e' }} /></Box>;

  const color = categoryColors[recipe.category] || '#c8a97e';
  const hasIngredients = recipe.ingredients?.length > 0;

  return (
    <Box sx={{ mt: 3 }}>
      <Button onClick={() => navigate('/recipes')} sx={{ mb: 2, color: '#c8a97e' }}>← Retour</Button>

      <Box sx={{ borderLeft: `4px solid ${color}`, pl: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>{recipe.name}</Typography>
        <Chip label={recipe.category} size="small" sx={{ mt: 1, backgroundColor: color, color: '#fff' }} />
      </Box>

      {saveMsg && <Alert severity="success" sx={{ mb: 2 }}>{saveMsg}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>

          {/* Info */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            {recipe.yield_quantity && (
              <Box>
                <Typography fontSize={12} color="text.secondary">Rendement de base</Typography>
                <Typography fontWeight={600}>{recipe.yield_quantity} {recipe.yield_unit}</Typography>
              </Box>
            )}
            {recipe.prep_time_minutes && (
              <Box>
                <Typography fontSize={12} color="text.secondary">Préparation</Typography>
                <Typography fontWeight={600}>{recipe.prep_time_minutes} min</Typography>
              </Box>
            )}
            {recipe.bake_time_minutes && (
              <Box>
                <Typography fontSize={12} color="text.secondary">Cuisson</Typography>
                <Typography fontWeight={600}>{recipe.bake_time_minutes} min</Typography>
              </Box>
            )}
          </Box>

          {recipe.notes && <Typography sx={{ mb: 3 }} color="text.secondary">{recipe.notes}</Typography>}

          <Divider sx={{ mb: 3, borderColor: '#c8a97e33' }} />

          {/* Scaling */}
          {hasIngredients && (
            <Box sx={{ mb: 3, p: 2.5, backgroundColor: '#f9f5f2', borderRadius: 3, border: '1px solid #c8a97e33' }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>⚖️ Mise à l'échelle</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth size="small" label="Quantité à produire" type="number"
                    value={targetQty}
                    onChange={e => handleTargetChange(parseFloat(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{recipe.yield_unit || 'pcs'}</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Typography fontSize={12} color="text.secondary" sx={{ mb: 1 }}>
                    Multiplicateur: <b style={{ color: '#c8a97e' }}>×{multiplier}</b>
                  </Typography>
                  <Slider value={multiplier} min={0.25} max={10} step={0.25}
                    onChange={(_, val) => handleMultiplierChange(val)}
                    sx={{ color: '#c8a97e' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontSize={11} color="text.secondary">×0.25</Typography>
                    <Typography fontSize={11} color="text.secondary">×10</Typography>
                  </Box>
                </Grid>
              </Grid>
              {multiplier !== 1 && (
                <Button size="small" sx={{ mt: 1, color: '#c8a97e' }}
                  onClick={() => { setMultiplier(1); setTargetQty(recipe.yield_quantity); }}>
                  Réinitialiser
                </Button>
              )}
            </Box>
          )}

          {/* Ingredients */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Ingrédients</Typography>
            {user?.role === 'head_chef' && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleOpenEdit}
                sx={{
                  color: '#c8a97e', border: '1px solid #c8a97e44', textTransform: 'none',
                  backgroundColor: !hasIngredients ? '#fff8f0' : 'transparent'
                }}
              >
                {hasIngredients ? 'Modifier' : '+ Ajouter les ingrédients'}
              </Button>
            )}
          </Box>

          {hasIngredients ? (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1a1a2e' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ingrédient</TableCell>
                  <TableCell sx={{ color: '#c8a97e', fontWeight: 600 }} align="right">
                    Quantité {multiplier !== 1 && `(×${multiplier})`}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Unité</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipe.ingredients.map((ing, i) => (
                  <TableRow key={i} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f5f2' }}>
                    <TableCell>{ing.name}</TableCell>
                    <TableCell align="right">
                      <b style={{ color: multiplier !== 1 ? '#c8a97e' : 'inherit' }}>
                        {scaleQty(ing.quantity)}
                      </b>
                    </TableCell>
                    <TableCell>{ing.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', border: '1.5px dashed #e0dbd0', borderRadius: 3 }}>
              <Typography color="text.secondary" fontSize={14}>Aucun ingrédient enregistré.</Typography>
              {user?.role === 'head_chef' && (
                <Button onClick={handleOpenEdit} sx={{ mt: 1, color: '#c8a97e', textTransform: 'none' }}>
                  + Ajouter les ingrédients maintenant
                </Button>
              )}
            </Box>
          )}

          {user?.role === 'head_chef' && (
            <Button color="error" variant="outlined" sx={{ mt: 4 }} onClick={handleDelete}>
              Supprimer la recette
            </Button>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Timer defaultMinutes={recipe.bake_time_minutes || 0} />
        </Grid>
      </Grid>

      {/* Edit ingredients dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          Ingrédients — {recipe.name}
        </DialogTitle>
        <DialogContent>
          <Typography fontSize={13} color="text.secondary" sx={{ mb: 2 }}>
            Ajoutez ou modifiez les ingrédients de cette recette.
          </Typography>
          {editIngredients.map((ing, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
              <TextField
                label="Ingrédient" value={ing.name} size="small"
                onChange={e => handleIngChange(i, 'name', e.target.value)}
                sx={{ flex: 2 }}
              />
              <TextField
                label="Qté" value={ing.quantity} size="small" type="number"
                onChange={e => handleIngChange(i, 'quantity', e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Unité" value={ing.unit} size="small"
                onChange={e => handleIngChange(i, 'unit', e.target.value)}
                placeholder="kg, L, p..."
                sx={{ flex: 1 }}
              />
              <IconButton size="small" color="error" onClick={() => handleRemoveIng(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={handleAddIng}
            sx={{ mt: 1, color: '#c8a97e', textTransform: 'none' }}>
            Ajouter un ingrédient
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button variant="contained" sx={{ backgroundColor: '#1a1a2e' }}
            onClick={handleSaveIngredients} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecipeDetail;
