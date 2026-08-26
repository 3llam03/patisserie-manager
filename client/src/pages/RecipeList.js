import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Chip, CardActionArea, CircularProgress, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getRecipes } from '../services/api';

const categoryColors = {
  'Pâtisseries Classiques': '#6d4c41',
  'Pâtisseries Gourmandes': '#8e24aa',
  'Pâtisseries de Saison': '#2e7d32',
  'Pâtisseries Salées': '#1565c0',
  'Desserts Frais': '#f9a825',
  'Viennoiserie': '#ef6c00',
  'Entremets': '#e91e63',
  'Petits Fours': '#00838f',
};

const categoryEmojis = {
  'Pâtisseries Classiques': '🎂',
  'Pâtisseries Gourmandes': '🍫',
  'Pâtisseries de Saison': '🍓',
  'Pâtisseries Salées': '🥐',
  'Desserts Frais': '🍮',
  'Viennoiserie': '🥐',
  'Entremets': '🎂',
  'Petits Fours': '🍬',
};

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    getRecipes().then(res => {
      setRecipes(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  const categories = ['All', ...new Set(recipes.map(r => r.category).filter(Boolean))];
  const filtered = activeCategory === 'All' ? recipes : recipes.filter(r => r.category === activeCategory);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Recipes</Typography>

      {/* Category Filter Bar */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const color = categoryColors[cat] || '#757575';
          return (
            <Button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              variant={isActive ? 'contained' : 'outlined'}
              size="small"
              sx={{
                borderRadius: 5,
                textTransform: 'none',
                fontWeight: isActive ? 'bold' : 'normal',
                backgroundColor: isActive ? color : 'transparent',
                borderColor: color,
                color: isActive ? '#fff' : color,
                '&:hover': {
                  backgroundColor: color,
                  color: '#fff',
                }
              }}
            >
              {categoryEmojis[cat] || ''} {cat === 'All' ? `All (${recipes.length})` : `${cat} (${recipes.filter(r => r.category === cat).length})`}
            </Button>
          );
        })}
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography color="text.secondary">No recipes in this category.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(recipe => {
            const color = categoryColors[recipe.category] || '#757575';
            return (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                <Card elevation={3} sx={{ borderRadius: 3, borderTop: `4px solid ${color}` }}>
                  <CardActionArea onClick={() => navigate(`/recipes/${recipe.id}`)}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{recipe.name}</Typography>
                      <Chip
                        label={`${categoryEmojis[recipe.category] || ''} ${recipe.category || 'Uncategorized'}`}
                        size="small"
                        sx={{ mb: 2, backgroundColor: color, color: '#fff' }}
                      />
                      {recipe.yield_quantity && (
                        <Typography variant="body2" color="text.secondary">
                          Yield: {recipe.yield_quantity} {recipe.yield_unit}
                        </Typography>
                      )}
                      {recipe.prep_time_minutes && (
                        <Typography variant="body2" color="text.secondary">
                          Prep: {recipe.prep_time_minutes} min · Bake: {recipe.bake_time_minutes} min
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default RecipeList;
