import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Divider
} from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import { getRecipes, getTodayTasks, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#1a1a2e', '#c8a97e', '#2e7d32', '#1565c0', '#8e24aa', '#e65100'];

function StatCard({ icon, label, value, sub }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ backgroundColor: '#1a1a2e', borderRadius: 2, p: 1.5, display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
          <Typography color="text.secondary" fontSize={13}>{label}</Typography>
          {sub && <Typography fontSize={11} color="#c8a97e">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ backgroundColor: '#1a1a2e', color: '#fff', px: 2, py: 1, borderRadius: 2, fontSize: 13 }}>
        <b>{payload[0].name}</b>: {payload[0].value}
      </Box>
    );
  }
  return null;
};

function Dashboard() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRecipes(), getTodayTasks(), getUsers()])
      .then(([r, t, u]) => {
        setRecipes(Array.isArray(r.data) ? r.data : []);
        setTasks(Array.isArray(t.data) ? t.data : []);
        setUsers(Array.isArray(u.data) ? u.data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress sx={{ color: '#c8a97e' }} />
    </Box>
  );

  const categories = [...new Set(recipes.map(r => r.category).filter(Boolean))];
  const categoryData = categories.map(cat => ({
    name: cat.replace('Pâtisseries ', ''),
    value: recipes.filter(r => r.category === cat).length
  }));

  const taskData = [
    { name: 'En attente', value: tasks.filter(t => t.status === 'pending').length },
    { name: 'En cours', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Terminé', value: tasks.filter(t => t.status === 'done').length },
  ].filter(t => t.value > 0);

  const staffUsers = users.filter(u => u.role === 'staff');

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Bonjour, <span style={{ color: '#c8a97e' }}>{user?.name}</span> 👋
        </Typography>
        <Typography color="text.secondary">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard icon={<MenuBookIcon sx={{ color: '#c8a97e' }} />} label="Recettes" value={recipes.length} sub={`${categories.length} catégories`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<AssignmentIcon sx={{ color: '#c8a97e' }} />} label="Tâches aujourd'hui" value={tasks.length} sub={`${tasks.filter(t => t.status === 'done').length} terminées`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<GroupIcon sx={{ color: '#c8a97e' }} />} label="Équipe" value={users.length} sub={`${staffUsers.length} pâtissier${staffUsers.length > 1 ? 's' : ''}`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<InventoryIcon sx={{ color: '#c8a97e' }} />} label="Catégories" value={categories.length} sub="de recettes" />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4, borderColor: '#c8a97e33' }} />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
            <Typography fontWeight={600} sx={{ mb: 2 }}>Recettes par catégorie</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {categoryData.map((entry, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length] }} />
                  <Typography fontSize={11} color="text.secondary">{entry.name} ({entry.value})</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
            <Typography fontWeight={600} sx={{ mb: 2 }}>Tâches du jour</Typography>
            {taskData.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                <Typography color="text.secondary">Aucune tâche aujourd'hui</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={taskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {taskData.map((_, i) => <Cell key={i} fill={['#ff9800', '#1e88e5', '#43a047'][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3, borderColor: '#c8a97e33' }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Tâches du jour</Typography>
          {tasks.length === 0 ? (
            <Typography color="text.secondary">Aucune tâche pour aujourd'hui.</Typography>
          ) : (
            tasks.slice(0, 6).map(t => (
              <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0ece4' }}>
                <Box>
                  <Typography fontSize={14} fontWeight={500}>{t.title}</Typography>
                  {t.assigned_to_name && <Typography fontSize={12} color="text.secondary">👤 {t.assigned_to_name}</Typography>}
                </Box>
                <Box sx={{
                  px: 1.5, py: 0.3, borderRadius: 10, fontSize: 12, fontWeight: 500,
                  backgroundColor: t.status === 'done' ? '#e8f5e9' : t.status === 'in_progress' ? '#e3f2fd' : '#fff8e1',
                  color: t.status === 'done' ? '#2e7d32' : t.status === 'in_progress' ? '#1565c0' : '#f57f17'
                }}>
                  {t.status === 'done' ? 'Terminé' : t.status === 'in_progress' ? 'En cours' : 'En attente'}
                </Box>
              </Box>
            ))
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Équipe</Typography>
          {users.map(u => (
            <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: '1px solid #f0ece4' }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: u.role === 'head_chef' ? '#1a1a2e' : '#c8a97e',
                color: u.role === 'head_chef' ? '#c8a97e' : '#1a1a2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14
              }}>
                {u.name.charAt(0).toUpperCase()}
              </Box>
              <Box>
                <Typography fontSize={14} fontWeight={500}>{u.name}</Typography>
                <Typography fontSize={12} color="text.secondary">
                  {u.role === 'head_chef' ? 'Chef Pâtissier' : 'Équipe'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
