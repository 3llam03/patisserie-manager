import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate('/');
    } catch {
      setError('Identifiant ou mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a2e',
      backgroundImage: 'radial-gradient(circle at 20% 80%, #2a2a4e 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c8a97e11 0%, transparent 50%)'
    }}>
      <Card elevation={0} sx={{ width: 400, borderRadius: 3, border: '1px solid #c8a97e44' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', backgroundColor: '#1a1a2e', mb: 2 }}>
              <CakeIcon sx={{ fontSize: 36, color: '#c8a97e' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#1a1a2e">Pâtisserie Manager</Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              Connectez-vous à votre espace
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth label="Identifiant" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Mot de passe" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth variant="contained"
            sx={{ py: 1.5, backgroundColor: '#1a1a2e', '&:hover': { backgroundColor: '#2a2a4e' } }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
