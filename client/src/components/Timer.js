import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, TextField, IconButton, Card, CardContent } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import TimerIcon from '@mui/icons-material/Timer';

function Timer({ defaultMinutes = 0 }) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
  const [remaining, setRemaining] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleSet = () => {
    const total = parseInt(minutes) * 60 + parseInt(seconds || 0);
    setTotalSeconds(total);
    setRemaining(total);
    setRunning(false);
    setFinished(false);
  };

  const handleReset = () => {
    setRemaining(totalSeconds);
    setRunning(false);
    setFinished(false);
  };

  const displayMin = Math.floor(remaining / 60).toString().padStart(2, '0');
  const displaySec = (remaining % 60).toString().padStart(2, '0');
  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;

  return (
    <Card elevation={0} sx={{ border: `1px solid ${finished ? '#e53935' : '#c8a97e44'}`, borderRadius: 3, backgroundColor: finished ? '#fff5f5' : 'inherit' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TimerIcon sx={{ color: '#c8a97e' }} />
          <Typography fontWeight={600}>Minuteur</Typography>
        </Box>

        {/* Time display */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h3" fontWeight={700} sx={{ color: finished ? '#e53935' : '#1a1a2e', fontFamily: 'monospace' }}>
            {displayMin}:{displaySec}
          </Typography>
          {finished && <Typography color="error" fontWeight={600}>⏰ Temps écoulé !</Typography>}
        </Box>

        {/* Progress bar */}
        <Box sx={{ height: 6, backgroundColor: '#f0ece4', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${progress}%`, backgroundColor: finished ? '#e53935' : '#c8a97e', borderRadius: 3, transition: 'width 1s linear' }} />
        </Box>

        {/* Set time */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField size="small" label="Min" type="number" value={minutes}
            onChange={e => setMinutes(e.target.value)} sx={{ flex: 1 }} />
          <TextField size="small" label="Sec" type="number" value={seconds}
            onChange={e => setSeconds(e.target.value)} sx={{ flex: 1 }} />
          <Button variant="outlined" size="small" onClick={handleSet}
            sx={{ borderColor: '#c8a97e', color: '#c8a97e' }}>
            Régler
          </Button>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <IconButton
            onClick={() => setRunning(!running)}
            disabled={remaining === 0}
            sx={{ backgroundColor: '#1a1a2e', color: '#c8a97e', '&:hover': { backgroundColor: '#2a2a4e' }, '&.Mui-disabled': { backgroundColor: '#eee' } }}
          >
            {running ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={handleReset} sx={{ border: '1px solid #c8a97e44', color: '#c8a97e' }}>
            <ReplayIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Timer;
