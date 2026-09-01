import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import type { LeaderPerson, LeaderRole } from '../types/ReviewEntry';

const MAX_LEADERS = 10;

const ROLE_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

interface Props {
  open: boolean;
  currentLeaders: LeaderPerson[];
  onSave: (leaders: LeaderPerson[]) => void;
  onClose: () => void;
}

export default function EditLeadersDialog({ open, currentLeaders, onSave, onClose }: Props) {
  const [leaders, setLeaders]       = useState<LeaderPerson[]>(currentLeaders);
  const [inputValue, setInputValue] = useState('');
  const [inputRole, setInputRole]   = useState<LeaderRole>('leader');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (open) {
      setLeaders(currentLeaders);
      setInputValue('');
      setInputRole('leader');
      setInputError('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) { setInputError('Please enter a name.'); return; }
    if (leaders.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('Already in the list.'); return;
    }
    if (leaders.length >= MAX_LEADERS) { setInputError(`Max ${MAX_LEADERS}.`); return; }
    setLeaders((p) => [...p, { name: trimmed, role: inputRole }]);
    setInputValue('');
    setInputError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  const handleRemove = (name: string) =>
    setLeaders((p) => p.filter((l) => l.name !== name));

  const handleRoleToggle = (name: string, newRole: LeaderRole) =>
    setLeaders((p) => p.map((l) => l.name === name ? { ...l, role: newRole } : l));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Leaders</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400, mt: 0.25 }}>
          Add, remove, or change roles. Leaders can review members and core; Core / Intern can only review members.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        {/* Role toggle + input */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <ToggleButtonGroup
            value={inputRole}
            exclusive
            onChange={(_, v) => { if (v) setInputRole(v as LeaderRole); }}
            size="small"
            fullWidth
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 } }}
          >
            <ToggleButton value="leader" sx={{ gap: 0.75 }}>
              <StarOutlinedIcon sx={{ fontSize: 15 }} /> Leader
            </ToggleButton>
            <ToggleButton value="core" sx={{ gap: 0.75 }}>
              <GroupsOutlinedIcon sx={{ fontSize: 15 }} /> Core / Intern
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            fullWidth
            label="Add a person"
            placeholder="Name"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); if (inputError) setInputError(''); }}
            onKeyDown={handleKeyDown}
            error={Boolean(inputError)}
            helperText={inputError || `${leaders.length} / ${MAX_LEADERS}`}
            disabled={leaders.length >= MAX_LEADERS}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleAdd}
                      disabled={leaders.length >= MAX_LEADERS || !inputValue.trim()}
                      edge="end"
                      color="primary"
                      aria-label="Add"
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Existing people — show as rows so role can be toggled inline */}
        {leaders.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {leaders.map((person) => {
              const c = ROLE_COLOURS[person.role];
              return (
                <Box
                  key={person.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2.5,
                    bgcolor: alpha('#7c3aed', 0.03),
                    border: '1px solid',
                    borderColor: alpha('#7c3aed', 0.1),
                  }}
                >
                  {/* Role dot */}
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />

                  {/* Name */}
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: 'text.primary' }}>
                    {person.name}
                  </Typography>

                  {/* Inline role toggle */}
                  <ToggleButtonGroup
                    value={person.role}
                    exclusive
                    onChange={(_, v) => { if (v) handleRoleToggle(person.name, v as LeaderRole); }}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        py: 0.25,
                        px: 1,
                        lineHeight: 1.4,
                        border: `1px solid ${alpha('#7c3aed', 0.15)}`,
                      },
                    }}
                  >
                    <ToggleButton value="leader">Leader</ToggleButton>
                    <ToggleButton value="core">Core</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Role badge */}
                  <Chip
                    label={person.role === 'leader' ? 'Leader' : 'Core'}
                    size="small"
                    sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, border: `1px solid ${c.border}`, display: { xs: 'none', sm: 'flex' } }}
                  />

                  {/* Remove */}
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(person.name)}
                    sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                  >
                    <CloseIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}>
            No people added yet.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}
          sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={() => onSave(leaders)} disabled={leaders.length === 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
