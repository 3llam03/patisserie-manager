import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  Chip, CircularProgress, LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getTodayTasks, updateTaskStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending:     { bg: '#fff8e1', border: '#f9a825', chip: '#f9a825', text: '#1a1a2e', label: 'En attente' },
  in_progress: { bg: '#e3f2fd', border: '#1e88e5', chip: '#1e88e5', text: '#fff',    label: 'En cours' },
  done:        { bg: '#e8f5e9', border: '#43a047', chip: '#43a047', text: '#fff',    label: 'Terminé' },
};

const priorityLabel = { low: 'Faible', normal: 'Normale', high: 'Haute' };
const priorityColor = { low: '#90a4ae', normal: '#1e88e5', high: '#e53935' };

function ModeCuisine() {
  const { user, logoutUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchTasks = () =>
    getTodayTasks().then(res => {
      setTasks(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatus = async (task) => {
    const next = { pending: 'in_progress', in_progress: 'done', done: 'pending' };
    setUpdating(task.id);
    await updateTaskStatus(task.id, next[task.status]);
    await fetchTasks();
    setUpdating(null);
  };

  const done = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1a1a2e' }}>
      <CircularProgress sx={{ color: '#c8a97e' }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1a2e', p: 3 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#c8a97e">
            👨‍🍳 {user?.name}
          </Typography>
          <Typography color="#ffffff88" fontSize={14}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Typography>
        </Box>
        <Button
          onClick={() => { logoutUser(); window.location.href = '/login'; }}
          sx={{ color: '#c8a97e', border: '1px solid #c8a97e44', textTransform: 'none' }}
        >
          Quitter
        </Button>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="#ffffff88" fontSize={13}>Progression du jour</Typography>
          <Typography color="#c8a97e" fontSize={13} fontWeight={600}>{done}/{tasks.length} tâches</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8, borderRadius: 4,
            backgroundColor: '#ffffff22',
            '& .MuiLinearProgress-bar': { backgroundColor: '#c8a97e', borderRadius: 4 }
          }}
        />
      </Box>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography variant="h5" color="#c8a97e" fontWeight={700}>🎉 Aucune tâche aujourd'hui !</Typography>
          <Typography color="#ffffff88" sx={{ mt: 1 }}>Bonne journée !</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tasks.map(task => {
            const s = statusColors[task.status];
            const isDone = task.status === 'done';
            return (
              <Card
                key={task.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `2px solid ${s.border}`,
                  backgroundColor: s.bg,
                  opacity: isDone ? 0.7 : 1,
                  transition: 'all 0.3s'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      {/* Title */}
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="#1a1a2e"
                        sx={{ textDecoration: isDone ? 'line-through' : 'none', mb: 1 }}
                      >
                        {task.title}
                      </Typography>

                      {/* Description */}
                      {task.description && (
                        <Typography color="#555" fontSize={15} sx={{ mb: 1.5 }}>
                          {task.description}
                        </Typography>
                      )}

                      {/* Chips */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={s.label}
                          size="small"
                          sx={{ backgroundColor: s.border, color: '#fff', fontWeight: 600 }}
                        />
                        {task.recipe_name && (
                          <Chip label={`🥐 ${task.recipe_name}`} size="small" variant="outlined" />
                        )}
                        {task.quantity && (
                          <Chip label={`Qté: ${task.quantity}`} size="small" variant="outlined" />
                        )}
                        <Chip
                          label={`Priorité: ${priorityLabel[task.priority]}`}
                          size="small"
                          sx={{ backgroundColor: priorityColor[task.priority], color: '#fff' }}
                        />
                      </Box>
                    </Box>

                    {/* Action button */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Button
                        onClick={() => handleStatus(task)}
                        disabled={updating === task.id}
                        variant="contained"
                        sx={{
                          minWidth: 120,
                          py: 1.5,
                          backgroundColor: isDone ? '#43a047' : task.status === 'in_progress' ? '#1e88e5' : '#1a1a2e',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 15,
                          borderRadius: 2,
                          '&:hover': { opacity: 0.9 }
                        }}
                        startIcon={isDone ? <CheckCircleIcon /> : task.status === 'in_progress' ? <AccessTimeIcon /> : <RadioButtonUncheckedIcon />}
                      >
                        {updating === task.id ? '...' : isDone ? 'Terminé' : task.status === 'in_progress' ? 'Finir' : 'Démarrer'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* All done message */}
      {tasks.length > 0 && done === tasks.length && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" color="#c8a97e" fontWeight={700}>
            🎉 Toutes les tâches sont terminées !
          </Typography>
          <Typography color="#ffffff88" sx={{ mt: 1 }}>Excellent travail aujourd'hui !</Typography>
        </Box>
      )}
    </Box>
  );
}

export default ModeCuisine;
