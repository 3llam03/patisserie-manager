import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Divider, Tab, Tabs
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getRecipes, getTasks, getUsers } from '../services/api';

const COLORS = ['#1a1a2e', '#c8a97e', '#2e7d32', '#1565c0', '#8e24aa', '#e65100'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ backgroundColor: '#1a1a2e', color: '#fff', px: 2, py: 1, borderRadius: 2, fontSize: 13 }}>
        {label && <div><b>{label}</b></div>}
        {payload.map((p, i) => <div key={i}>{p.name}: <b>{p.value}</b></div>)}
      </Box>
    );
  }
  return null;
};

function StatCard({ label, value, sub, color = '#c8a97e' }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3 }}>
      <CardContent>
        <Typography fontSize={13} color="text.secondary">{label}</Typography>
        <Typography variant="h3" fontWeight={700} color={color}>{value}</Typography>
        {sub && <Typography fontSize={12} color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

function Statistiques() {
  const [recipes, setRecipes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([getRecipes(), getTasks(), getUsers()]).then(([r, t, u]) => {
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

  // Recipe stats
  const categories = [...new Set(recipes.map(r => r.category).filter(Boolean))];
  const categoryData = categories.map(cat => ({
    name: cat.replace('Pâtisseries ', ''),
    recettes: recipes.filter(r => r.category === cat).length
  }));

  // Task stats
  const taskStatusData = [
    { name: 'En attente', value: tasks.filter(t => t.status === 'pending').length },
    { name: 'En cours',   value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Terminé',    value: tasks.filter(t => t.status === 'done').length },
  ];

  const taskPriorityData = [
    { name: 'Haute',   value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Normale', value: tasks.filter(t => t.priority === 'normal').length },
    { name: 'Faible',  value: tasks.filter(t => t.priority === 'low').length },
  ];

  // Staff performance
  const staffData = users.filter(u => u.role === 'staff').map(u => ({
    name: u.name,
    total:    tasks.filter(t => t.assigned_to === u.id).length,
    termines: tasks.filter(t => t.assigned_to === u.id && t.status === 'done').length,
    enCours:  tasks.filter(t => t.assigned_to === u.id && t.status === 'in_progress').length,
  }));

  // Tasks by date
  const tasksByDate = tasks.reduce((acc, t) => {
    const date = t.due_date?.split('T')[0];
    if (!date) return acc;
    if (!acc[date]) acc[date] = { date, total: 0, termines: 0 };
    acc[date].total++;
    if (t.status === 'done') acc[date].termines++;
    return acc;
  }, {});
  const timelineData = Object.values(tasksByDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Statistiques</Typography>
      <Typography color="text.secondary" fontSize={14} sx={{ mb: 3 }}>
        Vue d'ensemble de la pâtisserie
      </Typography>

      {/* KPI cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Total recettes" value={recipes.length} sub={`${categories.length} catégories`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Total tâches" value={tasks.length} sub={`${doneTasks} terminées`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Taux de complétion" value={`${completionRate}%`} sub="des tâches terminées" color={completionRate > 70 ? '#43a047' : '#ff9800'} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Équipe" value={users.length} sub={`${users.filter(u => u.role === 'staff').length} pâtissiers`} />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3, borderColor: '#c8a97e33' }} />

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
        <Tab label="Recettes" />
        <Tab label="Tâches" />
        <Tab label="Équipe" />
        <Tab label="Timeline" />
      </Tabs>

      {/* RECETTES TAB */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Recettes par catégorie</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="recettes" radius={[6, 6, 0, 0]}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Répartition</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="recettes" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={3}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TÂCHES TAB */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Statut des tâches</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={3}>
                    {taskStatusData.map((_, i) => <Cell key={i} fill={['#ff9800', '#1e88e5', '#43a047'][i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Priorité des tâches</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={taskPriorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {taskPriorityData.map((_, i) => <Cell key={i} fill={['#e53935', '#1e88e5', '#90a4ae'][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ÉQUIPE TAB */}
      {tab === 2 && (
        <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 2 }}>Performance de l'équipe</Typography>
          {staffData.length === 0 ? (
            <Typography color="text.secondary">Aucun membre d'équipe.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                <Bar dataKey="total" name="Total" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="termines" name="Terminés" fill="#43a047" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enCours" name="En cours" fill="#c8a97e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      {/* TIMELINE TAB */}
      {tab === 3 && (
        <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, p: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 2 }}>Tâches sur 14 jours</Typography>
          {timelineData.length === 0 ? (
            <Typography color="text.secondary">Pas assez de données.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#1a1a2e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="termines" name="Terminés" stroke="#43a047" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}
    </Box>
  );
}

export default Statistiques;
