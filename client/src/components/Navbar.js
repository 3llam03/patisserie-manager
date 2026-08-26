import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CakeIcon from '@mui/icons-material/Cake';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useAuth } from '../context/AuthContext';

const navItems = (role) => [
  { label: 'Tableau de bord', path: '/' },
  { label: 'Recettes', path: '/recipes' },
  { label: 'Tâches', path: '/tasks' },
  { label: 'Stock', path: '/stock' },
  ...(role === 'head_chef' ? [
    { label: 'Mise en Place', path: '/mise-en-place' },
    { label: 'Planning', path: '/planning' },
    { label: 'Équipe', path: '/equipe' },
    { label: 'Statistiques', path: '/statistiques' },
    { label: '+ Recette', path: '/new' },
  ] : []),
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [anchor, setAnchor] = useState(null);
  const handleLogout = () => { logoutUser(); navigate('/login'); };
  const items = navItems(user?.role);

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1a1a2e', borderBottom: '1px solid #c8a97e33' }}>
      <Toolbar sx={{ gap: 0.5 }}>
        <CakeIcon sx={{ color: '#c8a97e', mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer', color: '#fff', letterSpacing: 0.5 }} onClick={() => navigate('/')}>
          Pâtisserie <span style={{ color: '#c8a97e' }}>Manager</span>
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          {items.map(item => (
            <Button key={item.path} onClick={() => navigate(item.path)} sx={{
              textTransform: 'none',
              color: location.pathname === item.path ? '#c8a97e' : '#ffffffcc',
              borderBottom: location.pathname === item.path ? '2px solid #c8a97e' : '2px solid transparent',
              borderRadius: 0, px: 1.5,
              '&:hover': { color: '#c8a97e', background: 'transparent' }
            }}>
              {item.label}
            </Button>
          ))}
          <Button
            onClick={() => navigate('/cuisine')}
            startIcon={<RestaurantIcon />}
            sx={{
              ml: 1, textTransform: 'none',
              backgroundColor: '#c8a97e', color: '#1a1a2e',
              fontWeight: 700, borderRadius: 2, px: 2,
              '&:hover': { backgroundColor: '#b8996e' }
            }}
          >
            Mode Cuisine
          </Button>
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#c8a97e', color: '#1a1a2e', fontSize: 13, fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ color: '#ffffffcc', fontSize: 13 }}>{user?.name}</Typography>
            <Button size="small" onClick={handleLogout} sx={{ color: '#c8a97e', border: '1px solid #c8a97e44', textTransform: 'none', fontSize: 12 }}>
              Déconnexion
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={e => setAnchor(e.currentTarget)}><MenuIcon /></IconButton>
          <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
            {items.map(item => (
              <MenuItem key={item.path} onClick={() => { navigate(item.path); setAnchor(null); }}>{item.label}</MenuItem>
            ))}
            <MenuItem onClick={() => { navigate('/cuisine'); setAnchor(null); }}>🍳 Mode Cuisine</MenuItem>
            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
