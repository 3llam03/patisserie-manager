import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, IconButton, Avatar, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsers, registerUser } from '../services/api';

function Equipe() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'staff' });

  const fetchUsers = () => getUsers().then(res => setUsers(res.data));

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.username || !form.password) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    try {
      await registerUser(form);
      setSuccess(`${form.name} a été ajouté(e) avec succès !`);
      setForm({ name: '', username: '', password: '', role: 'staff' });
      setOpen(false);
      fetchUsers();
    } catch {
      setError('Erreur lors de la création du compte');
    }
  };

  const roleLabel = (role) => role === 'head_chef' ? 'Chef Pâtissier' : 'Équipe';
  const roleColor = (role) => role === 'head_chef' ? '#1a1a2e' : '#c8a97e';
  const roleTextColor = (role) => role === 'head_chef' ? '#c8a97e' : '#1a1a2e';

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Équipe</Typography>
          <Typography color="text.secondary" fontSize={14}>{users.length} membre{users.length > 1 ? 's' : ''}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#1a1a2e', '&:hover': { backgroundColor: '#2a2a4e' } }}
          onClick={() => { setOpen(true); setError(''); setSuccess(''); }}
        >
          Ajouter un membre
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {users.map(user => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  width: 52, height: 52,
                  backgroundColor: roleColor(user.role),
                  color: roleTextColor(user.role),
                  fontWeight: 700, fontSize: 20
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{user.name}</Typography>
                  <Typography fontSize={13} color="text.secondary">@{user.username}</Typography>
                  <Chip
                    label={roleLabel(user.role)}
                    size="small"
                    sx={{ mt: 0.5, backgroundColor: roleColor(user.role), color: roleTextColor(user.role), fontWeight: 600, fontSize: 11 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Nouveau membre</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Nom complet" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Identifiant" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Mot de passe" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth select label="Rôle" value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}>
            <MenuItem value="staff">Équipe</MenuItem>
            <MenuItem value="head_chef">Chef Pâtissier</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" sx={{ backgroundColor: '#1a1a2e' }} onClick={handleCreate}>
            Créer le compte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Equipe;
