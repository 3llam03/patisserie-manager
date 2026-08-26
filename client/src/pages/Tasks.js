import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTasks, createTask, deleteTask, updateTaskStatus, getUsers, getRecipes } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = { pending: '#ff9800', in_progress: '#1e88e5', done: '#43a047' };
const priorityColors = { low: '#90a4ae', normal: '#1e88e5', high: '#e53935' };

function TaskCard({ task, user, onStatus, onDelete }) {
  const nextStatus = { pending: 'in_progress', in_progress: 'done', done: 'pending' };
  const nextLabel = { pending: 'Start', in_progress: 'Mark Done', done: 'Reopen' };

  return (
    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: `4px solid ${priorityColors[task.priority] || '#ccc'}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography fontWeight="bold" variant="h6">{task.title}</Typography>
          {user.role === 'head_chef' && (
            <IconButton size="small" color="error" onClick={() => onDelete(task.id)}><DeleteIcon fontSize="small" /></IconButton>
          )}
        </Box>
        {task.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{task.description}</Typography>}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          <Chip label={task.status.replace('_', ' ')} size="small" sx={{ backgroundColor: statusColors[task.status], color: '#fff' }} />
          <Chip label={task.priority} size="small" sx={{ backgroundColor: priorityColors[task.priority], color: '#fff' }} />
          {task.recipe_name && <Chip label={task.recipe_name} size="small" variant="outlined" />}
          {task.quantity && <Chip label={`Qty: ${task.quantity}`} size="small" variant="outlined" />}
        </Box>
        {user.role === 'head_chef' && task.assigned_to_name && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>👤 {task.assigned_to_name}</Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          📅 {task.due_date?.split('T')[0]}
        </Typography>
        <Button size="small" variant="outlined" onClick={() => onStatus(task.id, nextStatus[task.status])}>
          {nextLabel[task.status]}
        </Button>
      </CardContent>
    </Card>
  );
}

function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', recipe_id: '', assigned_to: '',
    quantity: '', due_date: new Date().toISOString().split('T')[0], priority: 'normal'
  });

  const fetchTasks = () => getTasks().then(res => setTasks(res.data));

  useEffect(() => {
    Promise.all([
      getTasks(),
      user.role === 'head_chef' ? getUsers() : Promise.resolve({ data: [] }),
      getRecipes()
    ]).then(([t, u, r]) => {
      setTasks(t.data);
      setUsers(u.data);
      setRecipes(r.data);
      setLoading(false);
    });
  }, [user]);

  const handleCreate = async () => {
    if (!form.title || !form.assigned_to) {
      setError('Title and assigned member are required');
      return;
    }
    try {
      await createTask(form);
      setOpen(false);
      setError('');
      setForm({
        title: '', description: '', recipe_id: '', assigned_to: '',
        quantity: '', due_date: new Date().toISOString().split('T')[0], priority: 'normal'
      });
      fetchTasks();
    } catch (err) {
      setError('Error creating task');
    }
  };

  const handleStatus = async (id, status) => {
    await updateTaskStatus(id, status);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
      fetchTasks();
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.due_date?.split('T')[0] === today);
  const upcomingTasks = tasks.filter(t => t.due_date?.split('T')[0] > today);
  const pastTasks = tasks.filter(t => t.due_date?.split('T')[0] < today);

  const tabTasks = [todayTasks, upcomingTasks, pastTasks][tab];

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Production Tasks</Typography>
        {user.role === 'head_chef' && (
          <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#4a2c2a' }} onClick={() => setOpen(true)}>
            New Task
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Today (${todayTasks.length})`} />
        <Tab label={`Upcoming (${upcomingTasks.length})`} />
        <Tab label={`Past (${pastTasks.length})`} />
      </Tabs>

      {tabTasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography color="text.secondary">No tasks here.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tabTasks.map(task => (
            <Grid item xs={12} md={6} key={task.id}>
              <TaskCard task={task} user={user} onStatus={handleStatus} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">New Production Task</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Task Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth select label="Assign To" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} sx={{ mb: 2 }}>
            {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Recipe (optional)" value={form.recipe_id} onChange={e => setForm({ ...form, recipe_id: e.target.value })} sx={{ mb: 2 }}>
            <MenuItem value="">None</MenuItem>
            {recipes.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField fullWidth label="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            <TextField fullWidth type="date" label="Due Date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField fullWidth select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpen(false); setError(''); }}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: '#4a2c2a' }} onClick={handleCreate}>Create Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tasks;
