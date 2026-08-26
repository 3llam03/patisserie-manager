import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField,
  Button, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, InputAdornment,
  LinearProgress, Tabs, Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:5000/api';
const req = (method, path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {})
  }).then(r => r.json());
};

function Stock() {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [newQty, setNewQty] = useState('');
  const [newMin, setNewMin] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const fetchStock = () => req('GET', '/stock').then(data => {
    setStock(Array.isArray(data) ? data : []);
    setLoading(false);
  });

  useEffect(() => { fetchStock(); }, []);

  const handleUpdate = async () => {
    if (newQty === '') { setError('Veuillez entrer une quantité'); return; }
    await req('PATCH', `/stock/${editItem.id}`, {
      quantity: parseFloat(newQty),
      min_quantity: parseFloat(newMin) || editItem.min_quantity
    });
    setEditItem(null);
    setNewQty('');
    setNewMin('');
    fetchStock();
  };

  const getStatus = (item) => {
    const qty = parseFloat(item.quantity);
    const min = parseFloat(item.min_quantity) || 5;
    if (qty <= 0) return 'empty';
    if (qty <= min) return 'low';
    if (qty <= min * 2) return 'warning';
    return 'ok';
  };

  const getStatusColor = (status) => ({
    empty:   '#e53935',
    low:     '#ff9800',
    warning: '#ffc107',
    ok:      '#43a047'
  }[status]);

  const getProgressValue = (item) => {
    const qty = parseFloat(item.quantity);
    const min = parseFloat(item.min_quantity) || 5;
    const max = min * 5;
    return Math.min(100, (qty / max) * 100);
  };

  const emptyItems   = stock.filter(s => getStatus(s) === 'empty');
  const lowItems     = stock.filter(s => getStatus(s) === 'low');
  const warningItems = stock.filter(s => getStatus(s) === 'warning');
  const okItems      = stock.filter(s => getStatus(s) === 'ok');

  const getTabItems = () => {
    const filtered = (items) => items.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    if (tab === 0) return filtered(stock);
    if (tab === 1) return filtered([...emptyItems, ...lowItems]);
    if (tab === 2) return filtered(okItems);
    return filtered(stock);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress sx={{ color: '#c8a97e' }} />
    </Box>
  );

  const alertCount = emptyItems.length + lowItems.length;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Stock</Typography>
      <Typography color="text.secondary" fontSize={14} sx={{ mb: 3 }}>
        {stock.length} ingrédients · {alertCount > 0 ? `⚠️ ${alertCount} en alerte` : '✅ Tout est OK'}
      </Typography>

      {/* Alert banners */}
      {emptyItems.length > 0 && (
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          sx={{ mb: 2 }}
        >
          <b>Stock épuisé :</b> {emptyItems.map(s => s.name).join(', ')}
        </Alert>
      )}
      {lowItems.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon />}
          sx={{ mb: 2 }}
        >
          <b>Stock bas :</b> {lowItems.map(s => `${s.name} (${s.quantity} ${s.unit})`).join(', ')}
        </Alert>
      )}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Rechercher un ingrédient..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
        }}
      />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none' },
          '& .Mui-selected': { color: '#c8a97e !important' },
          '& .MuiTabs-indicator': { backgroundColor: '#c8a97e' }
        }}
      >
        <Tab label={`Tout (${stock.length})`} />
        <Tab label={`⚠️ Alertes (${alertCount})`} />
        <Tab label={`✅ OK (${okItems.length})`} />
      </Tabs>

      {/* Stock grid */}
      <Grid container spacing={2}>
        {getTabItems().map(item => {
          const status = getStatus(item);
          const color = getStatusColor(status);
          const progress = getProgressValue(item);

          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card elevation={0} sx={{
                borderRadius: 3,
                border: `1px solid ${status === 'ok' ? '#c8a97e33' : color + '66'}`,
                borderLeft: `4px solid ${color}`,
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600} fontSize={14}>{item.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="h5" fontWeight={700} color={color}>
                          {parseFloat(item.quantity)}
                        </Typography>
                        <Typography color="text.secondary" fontSize={13}>{item.unit}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      {status === 'empty' && <Chip label="Épuisé" size="small" sx={{ backgroundColor: '#e53935', color: '#fff', fontWeight: 600 }} />}
                      {status === 'low' && <Chip label="Stock bas" size="small" sx={{ backgroundColor: '#ff9800', color: '#fff', fontWeight: 600 }} />}
                      {status === 'warning' && <Chip label="Attention" size="small" sx={{ backgroundColor: '#ffc107', color: '#1a1a2e', fontWeight: 600 }} />}
                      {status === 'ok' && <CheckCircleIcon sx={{ color: '#43a047', fontSize: 20 }} />}
                    </Box>
                  </Box>

                  {/* Progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6, borderRadius: 3, mb: 1,
                      backgroundColor: '#f0ece4',
                      '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: 3 }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontSize={11} color="text.secondary">
                      Seuil min: {item.min_quantity} {item.unit}
                    </Typography>
                    {user.role === 'head_chef' && (
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => { setEditItem(item); setNewQty(item.quantity); setNewMin(item.min_quantity); }}
                        sx={{ color: '#c8a97e', textTransform: 'none', fontSize: 11 }}
                      >
                        Modifier
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Modifier — {editItem?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={`Quantité actuelle (${editItem?.unit})`}
            type="number"
            value={newQty}
            onChange={e => { setNewQty(e.target.value); setError(''); }}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label={`Seuil d'alerte minimum (${editItem?.unit})`}
            type="number"
            value={newMin}
            onChange={e => setNewMin(e.target.value)}
            helperText="Une alerte s'affiche quand le stock descend sous ce seuil"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditItem(null)}>Annuler</Button>
          <Button variant="contained" sx={{ backgroundColor: '#1a1a2e' }} onClick={handleUpdate}>
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Stock;
