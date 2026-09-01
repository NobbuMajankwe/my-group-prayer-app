import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import type { LeaderPerson, LeaderRole } from '../types/ReviewEntry';

const MAX_LEADERS = 10;

const ROLE_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

interface LeaderSetupProps {
  onComplete: (leaders: LeaderPerson[]) => void;
}

export default function LeaderSetup({ onComplete }: LeaderSetupProps) {
  const [leaders, setLeaders]     = useState<LeaderPerson[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputRole, setInputRole]   = useState<LeaderRole>('leader');
  const [inputError, setInputError] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) { setInputError('Please enter a name.'); return; }
    if (leaders.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('That name is already added.'); return;
    }
    if (leaders.length >= MAX_LEADERS) { setInputError(`Maximum ${MAX_LEADERS} leaders.`); return; }
    setLeaders((p) => [...p, { name: trimmed, role: inputRole }]);
    setInputValue('');
    setInputError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        bgcolor: '#faf5ff',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 10% 10%, #ede9fe 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 90% 90%, #fce7f3 0%, transparent 60%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha('#7c3aed', 0.12),
        }}
      >
        {/* Logo + app name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            component="img"
            src="/favicon_io/android-chrome-192x192.png"
            alt="logo"
            sx={{ width: 48, height: 48, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(124,58,237,0.18)' }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}
            >
              Review &amp; Action Tracker
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Set up your leaders to get started.
            </Typography>
          </Box>
        </Box>

        {/* Role legend */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2.5,
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha('#7c3aed', 0.03),
            border: '1px solid',
            borderColor: alpha('#7c3aed', 0.1),
          }}
        >
          {(['leader', 'core'] as LeaderRole[]).map((r) => (
            <Box key={r} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r === 'leader' ? '#eab308' : '#14b8a6', flexShrink: 0 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', lineHeight: 1.2 }}>
                  {r === 'leader' ? 'Leader' : 'Core / Intern'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                  {r === 'leader' ? 'Reviews members & core' : 'Reviews members only'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Role toggle + name input */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <ToggleButtonGroup
            value={inputRole}
            exclusive
            onChange={(_, v) => { if (v) setInputRole(v as LeaderRole); }}
            size="small"
            fullWidth
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, gap: 0.5 } }}
          >
            <ToggleButton value="leader" sx={{ gap: 0.75 }}>
              <StarOutlinedIcon sx={{ fontSize: 16 }} /> Leader
            </ToggleButton>
            <ToggleButton value="core" sx={{ gap: 0.75 }}>
              <GroupsOutlinedIcon sx={{ fontSize: 16 }} /> Core / Intern
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            fullWidth
            label="Name"
            placeholder={inputRole === 'leader' ? 'e.g. Shereen' : 'e.g. Aisha'}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); if (inputError) setInputError(''); }}
            onKeyDown={handleKeyDown}
            error={Boolean(inputError)}
            helperText={inputError || `${leaders.length} / ${MAX_LEADERS} added`}
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
                      aria-label="Add person"
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* People chips */}
        {leaders.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              mb: 3,
              p: 1.5,
              borderRadius: 3,
              bgcolor: alpha('#7c3aed', 0.03),
              border: '1px dashed',
              borderColor: alpha('#7c3aed', 0.15),
            }}
          >
            {leaders.map((person) => {
              const c = ROLE_COLOURS[person.role];
              return (
                <Chip
                  key={person.name}
                  label={`${person.name} · ${person.role === 'leader' ? 'Leader' : 'Core'}`}
                  size="small"
                  onDelete={() => setLeaders((p) => p.filter((l) => l.name !== person.name))}
                  deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                  sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, border: '1px solid', borderColor: c.border }}
                />
              );
            })}
          </Box>
        )}

        {/* Continue */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          disabled={leaders.length === 0}
          onClick={() => onComplete(leaders)}
          sx={{ py: 1.25 }}
        >
          {leaders.length === 0 ? 'Add at least one person' : 'Get started'}
        </Button>
      </Paper>
    </Box>
  );
}
