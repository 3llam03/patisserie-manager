import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Card, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, TextField, Tooltip, CircularProgress, Alert,
  Tabs, Tab
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getUsers } from '../services/api';
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

const SHIFTS = {
  matin:  { label: 'Matin',      hours: '7h → 15h',  color: '#c8a97e', text: '#1a1a2e' },
  aprem:  { label: 'Après-midi', hours: '15h → 23h', color: '#1a1a2e', text: '#c8a97e' },
  nuit:   { label: 'Nuit',       hours: '23h → 7h',  color: '#2e3b55', text: '#90caf9' },
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + weekOffset * 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthDates(monthOffset = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return { first, last, year: first.getFullYear(), month: first.getMonth() };
}

function Planning() {
  const { user } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [view, setView] = useState(0); // 0=week, 1=month
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ user_id: '', shift_type: 'matin' });
  const [error, setError] = useState('');
  const [copyMsg, setCopyMsg] = useState('');
  const printRef = useRef();

  const weekDates = getWeekDates(weekOffset);
  const start = formatDate(weekDates[0]);
  const end = formatDate(weekDates[6]);

  const monthInfo = getMonthDates(monthOffset);

  const fetchShifts = async (s, e) => {
    const data = await req('GET', `/shifts?start=${s}&end=${e}`);
    setShifts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    setLoading(true);
    let s, e;
    if (view === 0) {
      s = start; e = end;
    } else {
      s = formatDate(monthInfo.first);
      e = formatDate(monthInfo.last);
    }
    Promise.all([getUsers(), fetchShifts(s, e)]).then(([u]) => {
      setUsers(u.data);
      setLoading(false);
    });
  }, [weekOffset, monthOffset, view]);

  const getShiftForSlot = (date, shiftType) =>
    shifts.find(s => s.shift_date?.startsWith(date) && s.shift_type === shiftType);

  const uncoveredCount = weekDates.reduce((total, d) => {
    const date = formatDate(d);
    return total + Object.keys(SHIFTS).filter(st => !getShiftForSlot(date, st)).length;
  }, 0);

  const handleCellClick = (date, shiftType) => {
    if (user.role !== 'head_chef') return;
    const existing = getShiftForSlot(date, shiftType);
    setError('');
    setDialog({ date, shiftType, existing });
    setForm({ user_id: existing?.user_id || '', shift_type: shiftType });
  };

  const handleAssign = async () => {
    if (!form.user_id) { setError('Veuillez sélectionner un membre'); return; }
    const userOtherShift = shifts.find(
      s => s.user_id === parseInt(form.user_id) &&
      s.shift_date?.startsWith(dialog.date) &&
      s.shift_type !== dialog.shiftType
    );
    if (userOtherShift) {
      setError(`Déjà au shift ${SHIFTS[userOtherShift.shift_type].label} ce jour-là`);
      return;
    }
    const result = await req('POST', '/shifts', {
      user_id: parseInt(form.user_id),
      shift_date: dialog.date,
      shift_type: dialog.shiftType
    });
    if (result.error) { setError(result.error); return; }
    await fetchShifts(start, end);
    setDialog(null);
    setError('');
  };

  const handleRemove = async (shiftId, e) => {
    e.stopPropagation();
    await req('DELETE', `/shifts/${shiftId}`);
    await fetchShifts(start, end);
  };

  // Drag and drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const [fromDate, fromShift] = result.source.droppableId.split('__');
    const [toDate, toShift] = result.destination.droppableId.split('__');
    if (fromDate === toDate && fromShift === toShift) return;

    const shift = getShiftForSlot(fromDate, fromShift);
    if (!shift) return;

    // Check if destination is taken
    const destShift = getShiftForSlot(toDate, toShift);
    if (destShift) {
      setError('Ce créneau est déjà occupé');
      setTimeout(() => setError(''), 3000);
      return;
    }

    await req('DELETE', `/shifts/${shift.id}`);
    await req('POST', '/shifts', {
      user_id: shift.user_id,
      shift_date: toDate,
      shift_type: toShift
    });
    await fetchShifts(start, end);
  };

  // Copy week to next week
  const handleCopyWeek = async () => {
    const nextWeekDates = getWeekDates(weekOffset + 1);
    let copied = 0;
    for (const shift of shifts) {
      const shiftDate = shift.shift_date?.split('T')[0];
      const dayIndex = weekDates.findIndex(d => formatDate(d) === shiftDate);
      if (dayIndex === -1) continue;
      const nextDate = formatDate(nextWeekDates[dayIndex]);
      const existing = await req('GET', `/shifts?start=${nextDate}&end=${nextDate}`);
      const conflict = Array.isArray(existing) && existing.find(s => s.shift_type === shift.shift_type);
      if (!conflict) {
        await req('POST', '/shifts', {
          user_id: shift.user_id,
          shift_date: nextDate,
          shift_type: shift.shift_type
        });
        copied++;
      }
    }
    setCopyMsg(`✅ ${copied} shift${copied > 1 ? 's' : ''} copié${copied > 1 ? 's' : ''} vers la semaine prochaine !`);
    setTimeout(() => setCopyMsg(''), 4000);
  };

  // Export PDF
  const handleExportPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.setFontSize(16);
    pdf.text('Planning des Shifts — Pâtisserie', 14, 14);
    pdf.setFontSize(10);
    pdf.text(`Semaine du ${weekDates[0].toLocaleDateString('fr-FR')} au ${weekDates[6].toLocaleDateString('fr-FR')}`, 14, 22);
    pdf.addImage(imgData, 'PNG', 0, 28, pdfWidth, pdfHeight - 28);
    pdf.save(`planning-${start}.pdf`);
  };

  const isToday = (date) => formatDate(new Date()) === date;

  // Month view helpers
  const getDaysInMonth = () => {
    const { first, last } = monthInfo;
    const days = [];
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress sx={{ color: '#c8a97e' }} />
    </Box>
  );

  return (
    <Box sx={{ mt: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Planning des shifts</Typography>
          {view === 0 ? (
            <Typography color="text.secondary" fontSize={14}>
              {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} —{' '}
              {weekDates[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          ) : (
            <Typography color="text.secondary" fontSize={14}>
              {MONTHS_FR[monthInfo.month]} {monthInfo.year}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {view === 0 && user.role === 'head_chef' && (
            <>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyWeek}
                sx={{ color: '#c8a97e', border: '1px solid #c8a97e44', textTransform: 'none' }}
              >
                Copier semaine
              </Button>
              <Button
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPDF}
                sx={{ color: '#c8a97e', border: '1px solid #c8a97e44', textTransform: 'none' }}
              >
                Export PDF
              </Button>
            </>
          )}
          <IconButton onClick={() => view === 0 ? setWeekOffset(w => w - 1) : setMonthOffset(m => m - 1)} sx={{ border: '1px solid #c8a97e44' }}>
            <ChevronLeftIcon />
          </IconButton>
          <Button onClick={() => { setWeekOffset(0); setMonthOffset(0); }} sx={{ color: '#c8a97e', border: '1px solid #c8a97e44', textTransform: 'none' }}>
            Aujourd'hui
          </Button>
          <IconButton onClick={() => view === 0 ? setWeekOffset(w => w + 1) : setMonthOffset(m => m + 1)} sx={{ border: '1px solid #c8a97e44' }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* View tabs */}
      <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none' }, '& .Mui-selected': { color: '#c8a97e !important' }, '& .MuiTabs-indicator': { backgroundColor: '#c8a97e' } }}>
        <Tab label="Vue semaine" />
        <Tab label="Vue mois" />
      </Tabs>

      {copyMsg && <Alert severity="success" sx={{ mb: 2 }}>{copyMsg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {view === 0 && uncoveredCount > 0 && (
        <Alert icon={<WarningAmberIcon />} severity="warning" sx={{ mb: 3 }}>
          {uncoveredCount} shift{uncoveredCount > 1 ? 's' : ''} non couvert{uncoveredCount > 1 ? 's' : ''} cette semaine
        </Alert>
      )}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {Object.entries(SHIFTS).map(([key, s]) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: 1, backgroundColor: s.color }} />
            <Typography fontSize={12} color="text.secondary"><b>{s.label}</b> {s.hours}</Typography>
          </Box>
        ))}
        {user.role === 'head_chef' && view === 0 && (
          <Typography fontSize={12} color="text.secondary" sx={{ ml: 2 }}>
            💡 Glissez-déposez les shifts · Cliquez pour modifier
          </Typography>
        )}
      </Box>

      {/* WEEK VIEW */}
      {view === 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, overflow: 'auto' }} ref={printRef}>
            <Box sx={{ minWidth: 680 }}>
              {/* Day headers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '110px repeat(7, 1fr)', backgroundColor: '#1a1a2e' }}>
                <Box sx={{ p: 1.5 }}>
                  <Typography fontSize={12} color="#c8a97e" fontWeight={600}>Shift</Typography>
                </Box>
                {weekDates.map((d, i) => (
                  <Box key={i} sx={{
                    p: 1.5, textAlign: 'center',
                    backgroundColor: isToday(formatDate(d)) ? '#c8a97e22' : 'transparent',
                    borderLeft: '1px solid #ffffff11'
                  }}>
                    <Typography fontSize={12} color="#c8a97e" fontWeight={600}>{DAYS_FR[i]}</Typography>
                    <Typography fontSize={11} color={isToday(formatDate(d)) ? '#c8a97e' : '#ffffff88'}>
                      {d.getDate()}/{d.getMonth() + 1}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Shift rows */}
              {Object.entries(SHIFTS).map(([shiftKey, shiftInfo], si) => (
                <Box key={shiftKey} sx={{
                  display: 'grid',
                  gridTemplateColumns: '110px repeat(7, 1fr)',
                  borderTop: '1px solid #f0ece4',
                  backgroundColor: si % 2 === 0 ? '#fff' : '#faf8f5'
                }}>
                  <Box sx={{ p: 1.5, borderRight: `3px solid ${shiftInfo.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography fontSize={13} fontWeight={700} color={shiftInfo.color}>{shiftInfo.label}</Typography>
                    <Typography fontSize={11} color="text.secondary">{shiftInfo.hours}</Typography>
                  </Box>

                  {weekDates.map((d, di) => {
                    const dateStr = formatDate(d);
                    const shift = getShiftForSlot(dateStr, shiftKey);
                    const droppableId = `${dateStr}__${shiftKey}`;

                    return (
                      <Droppable key={di} droppableId={droppableId}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            onClick={() => !shift && handleCellClick(dateStr, shiftKey)}
                            sx={{
                              p: 0.75, minHeight: 64,
                              borderLeft: '1px solid #f0ece4',
                              backgroundColor: snapshot.isDraggingOver ? '#f5f0e8' : isToday(dateStr) ? '#fffbf0' : 'transparent',
                              cursor: user.role === 'head_chef' && !shift ? 'pointer' : 'default',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            {shift ? (
                              <Draggable draggableId={String(shift.id)} index={0} isDragDisabled={user.role !== 'head_chef'}>
                                {(provided, snapshot) => (
                                  <Tooltip title={`${shift.user_name} — ${shiftInfo.label} · Cliquez pour modifier`}>
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => handleCellClick(dateStr, shiftKey)}
                                      sx={{
                                        backgroundColor: shiftInfo.color,
                                        color: shiftInfo.text,
                                        borderRadius: 2, px: 1, py: 0.75,
                                        fontSize: 12, fontWeight: 600,
                                        width: '100%', textAlign: 'center',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', gap: 0.5,
                                        cursor: 'grab',
                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                        boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                                        transition: 'box-shadow 0.2s'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                                        <Box sx={{
                                          width: 20, height: 20, borderRadius: '50%',
                                          backgroundColor: shiftInfo.text, color: shiftInfo.color,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: 10, fontWeight: 700, flexShrink: 0
                                        }}>
                                          {shift.user_name?.charAt(0).toUpperCase()}
                                        </Box>
                                        <Typography fontSize={11} fontWeight={600} noWrap>{shift.user_name}</Typography>
                                      </Box>
                                      {user.role === 'head_chef' && (
                                        <CloseIcon
                                          sx={{ fontSize: 13, cursor: 'pointer', opacity: 0.7, flexShrink: 0, '&:hover': { opacity: 1 } }}
                                          onClick={e => handleRemove(shift.id, e)}
                                        />
                                      )}
                                    </Box>
                                  </Tooltip>
                                )}
                              </Draggable>
                            ) : (
                              user.role === 'head_chef' ? (
                                <Box sx={{
                                  width: '100%', height: 40,
                                  border: '1.5px dashed #e0dbd0', borderRadius: 2,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  <Typography fontSize={11} color="#bbb">Non couvert</Typography>
                                </Box>
                              ) : (
                                <Typography fontSize={11} color="#ddd">—</Typography>
                              )
                            )}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Card>
        </DragDropContext>
      )}

      {/* MONTH VIEW */}
      {view === 1 && (
        <Card elevation={0} sx={{ border: '1px solid #c8a97e33', borderRadius: 3, overflow: 'auto' }}>
          <Box sx={{ minWidth: 700 }}>
            {/* Day names header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#1a1a2e' }}>
              {DAYS_FR.map(d => (
                <Box key={d} sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography fontSize={12} color="#c8a97e" fontWeight={600}>{d}</Typography>
                </Box>
              ))}
            </Box>

            {/* Calendar grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {getDaysInMonth().map((d, i) => {
                if (!d) return <Box key={`empty-${i}`} sx={{ minHeight: 100, borderRight: '1px solid #f0ece4', borderBottom: '1px solid #f0ece4' }} />;
                const dateStr = formatDate(d);
                const dayShifts = shifts.filter(s => s.shift_date?.startsWith(dateStr));
                const today = isToday(dateStr);

                return (
                  <Box key={dateStr} sx={{
                    minHeight: 100, p: 0.5,
                    borderRight: '1px solid #f0ece4',
                    borderBottom: '1px solid #f0ece4',
                    backgroundColor: today ? '#fffbf0' : '#fff'
                  }}>
                    <Typography fontSize={12} fontWeight={today ? 700 : 400} color={today ? '#c8a97e' : 'text.primary'} sx={{ mb: 0.5 }}>
                      {d.getDate()}
                    </Typography>
                    {dayShifts.map(shift => (
                      <Box key={shift.id} sx={{
                        backgroundColor: SHIFTS[shift.shift_type]?.color || '#ccc',
                        color: SHIFTS[shift.shift_type]?.text || '#fff',
                        borderRadius: 1, px: 0.5, py: 0.25, mb: 0.3,
                        fontSize: 10, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 0.5
                      }}>
                        <span>{SHIFTS[shift.shift_type]?.label?.charAt(0)}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shift.user_name}</span>
                      </Box>
                    ))}
                    {dayShifts.length < 3 && user.role === 'head_chef' && (
                      <Box
                        onClick={() => {
                          const missingShift = Object.keys(SHIFTS).find(st => !dayShifts.find(s => s.shift_type === st));
                          if (missingShift) handleCellClick(dateStr, missingShift);
                        }}
                        sx={{ cursor: 'pointer', color: '#ccc', fontSize: 16, textAlign: 'center', lineHeight: 1 }}
                      >+</Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Card>
      )}

      {/* Assign dialog */}
      <Dialog open={!!dialog} onClose={() => { setDialog(null); setError(''); }} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>
          {dialog?.existing ? 'Modifier le shift' : 'Affecter'} — {dialog && SHIFTS[dialog.shiftType]?.label} ({SHIFTS[dialog?.shiftType]?.hours})
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" fontSize={13} sx={{ mb: 2 }}>
            {dialog && new Date(dialog.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth select label="Membre de l'équipe"
            value={form.user_id}
            onChange={e => { setForm({ ...form, user_id: e.target.value }); setError(''); }}
          >
            {users.map(u => {
              const alreadyBusy = shifts.find(
                s => s.user_id === u.id &&
                s.shift_date?.startsWith(dialog?.date) &&
                s.shift_type !== dialog?.shiftType
              );
              return (
                <MenuItem key={u.id} value={u.id} disabled={!!alreadyBusy}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 26, height: 26, borderRadius: '50%',
                      backgroundColor: u.role === 'head_chef' ? '#1a1a2e' : '#c8a97e',
                      color: u.role === 'head_chef' ? '#c8a97e' : '#1a1a2e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700
                    }}>
                      {u.name.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography fontSize={13}>{u.name}</Typography>
                      {alreadyBusy && <Typography fontSize={11} color="text.secondary">Déjà au shift {SHIFTS[alreadyBusy.shift_type]?.label}</Typography>}
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setDialog(null); setError(''); }}>Annuler</Button>
          <Button variant="contained" sx={{ backgroundColor: '#1a1a2e' }} onClick={handleAssign}>
            {dialog?.existing ? 'Modifier' : 'Affecter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Planning;
