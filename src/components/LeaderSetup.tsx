import { useState } from 'react';
import {
  Alert, Box, Button, Chip, Divider, IconButton,
  Paper, Step, StepLabel, Stepper,
  TextField, ToggleButton, ToggleButtonGroup, Typography, alpha,
} from '@mui/material';
import AddIcon            from '@mui/icons-material/Add';
import ArrowForwardIcon   from '@mui/icons-material/ArrowForward';
import CloseIcon          from '@mui/icons-material/Close';
import EditOutlinedIcon   from '@mui/icons-material/EditOutlined';
import StarOutlinedIcon   from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { hashPin }        from '../utils/crypto';
import type { LeaderPerson, LeaderRole } from '../types/ReviewEntry';

const MAX_LEADERS = 10;

const ROLE_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

interface Draft {
  name:     string;
  role:     LeaderRole;
  password: string;
  confirm:  string;
}

const EMPTY_DRAFT: Draft = { name: '', role: 'leader', password: '', confirm: '' };

interface LeaderSetupProps {
  onComplete: (leaders: LeaderPerson[]) => void;
}

export default function LeaderSetup({ onComplete }: LeaderSetupProps) {
  const [leaders,    setLeaders]    = useState<LeaderPerson[]>([]);
  const [draft,      setDraft]      = useState<Draft>(EMPTY_DRAFT);
  const [draftError, setDraftError] = useState('');
  const [adding,     setAdding]     = useState(false);
  const [step,       setStep]       = useState(0); // 0 = add people, 1 = review

  const setD = (p: Partial<Draft>) => { setDraft((d) => ({ ...d, ...p })); setDraftError(''); };

  const handleAdd = async () => {
    const name = draft.name.trim();
    if (!name)                         { setDraftError('Please enter a name.'); return; }
    if (leaders.some((l) => l.name.toLowerCase() === name.toLowerCase()))
                                       { setDraftError('That name is already added.'); return; }
    if (leaders.length >= MAX_LEADERS) { setDraftError(`Maximum ${MAX_LEADERS} people.`); return; }
    if (draft.password.length < 4)     { setDraftError('Password must be at least 4 characters.'); return; }
    if (draft.password !== draft.confirm) { setDraftError('Passwords do not match.'); return; }

    setAdding(true);
    try {
      const hash = await hashPin(draft.password);
      setLeaders((p) => [...p, { name, role: draft.role, passwordHash: hash }]);
      setDraft(EMPTY_DRAFT);
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', px: 2, bgcolor: '#faf5ff',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 10% 10%, #ede9fe 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 90% 90%, #fce7f3 0%, transparent 60%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%', maxWidth: 520, p: { xs: 3, sm: 4 },
          borderRadius: 4, border: '1px solid', borderColor: alpha('#7c3aed', 0.12),
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            component="img"
            src="/favicon_io/android-chrome-192x192.png"
            alt="logo"
            sx={{ width: 48, height: 48, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(124,58,237,0.18)' }}
          />
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', lineHeight: 1.2,
            }}>
              PrayTogether
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Set up your team
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step><StepLabel>Add people</StepLabel></Step>
          <Step><StepLabel>Confirm &amp; start</StepLabel></Step>
        </Stepper>

        {/* ── Step 0: Add people ── */}
        {step === 0 && (
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
              Add each leader or core/intern. Each person sets their own password here — they'll use it to log in.
            </Typography>

            {/* Role toggle */}
            <ToggleButtonGroup
              value={draft.role} exclusive size="small" fullWidth
              onChange={(_, v) => { if (v) setD({ role: v as LeaderRole }); }}
              sx={{ mb: 1.5, '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 } }}
            >
              <ToggleButton value="leader" sx={{ gap: 0.75 }}>
                <StarOutlinedIcon sx={{ fontSize: 15 }} /> Leader
              </ToggleButton>
              <ToggleButton value="core" sx={{ gap: 0.75 }}>
                <GroupsOutlinedIcon sx={{ fontSize: 15 }} /> Core / Intern
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              <TextField
                size="small" label="Name" fullWidth
                value={draft.name}
                onChange={(e) => setD({ name: e.target.value })}
                onKeyDown={handleKeyDown}
                disabled={adding}
                placeholder={draft.role === 'leader' ? 'e.g. Shereen' : 'e.g. Aisha'}
              />
              <TextField
                size="small" label="Password" type="password" fullWidth
                value={draft.password}
                onChange={(e) => setD({ password: e.target.value })}
                onKeyDown={handleKeyDown}
                disabled={adding}
                helperText="Minimum 4 characters"
              />
              <TextField
                size="small" label="Confirm password" type="password" fullWidth
                value={draft.confirm}
                onChange={(e) => setD({ confirm: e.target.value })}
                onKeyDown={handleKeyDown}
                disabled={adding}
              />
            </Box>

            {draftError && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{draftError}</Alert>
            )}

            <Button
              fullWidth variant="outlined" color="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={adding || leaders.length >= MAX_LEADERS}
              sx={{ mb: 2 }}
            >
              {adding ? 'Adding…' : `Add person  (${leaders.length} / ${MAX_LEADERS})`}
            </Button>

            {/* Added people chips */}
            {leaders.length > 0 && (
              <Box sx={{
                display: 'flex', flexWrap: 'wrap', gap: 0.75,
                p: 1.5, borderRadius: 3,
                bgcolor: alpha('#7c3aed', 0.03),
                border: '1px dashed', borderColor: alpha('#7c3aed', 0.15),
                mb: 2,
              }}>
                {leaders.map((l) => {
                  const c = ROLE_COLOURS[l.role];
                  return (
                    <Chip
                      key={l.name} size="small"
                      label={`${l.name} · ${l.role === 'leader' ? 'Leader' : 'Core'}`}
                      onDelete={() => setLeaders((p) => p.filter((x) => x.name !== l.name))}
                      deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, border: '1px solid', borderColor: c.border }}
                    />
                  );
                })}
              </Box>
            )}

            <Button
              fullWidth variant="contained" color="primary"
              endIcon={<ArrowForwardIcon />}
              disabled={leaders.length === 0}
              onClick={() => setStep(1)}
              sx={{ py: 1.25 }}
            >
              Review &amp; continue
            </Button>
          </>
        )}

        {/* ── Step 1: Confirm ── */}
        {step === 1 && (
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Confirm your team before getting started.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {leaders.map((l) => {
                const c = ROLE_COLOURS[l.role];
                return (
                  <Box key={l.name} sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 1, borderRadius: 2.5,
                    bgcolor: alpha('#7c3aed', 0.03),
                    border: '1px solid', borderColor: alpha('#7c3aed', 0.1),
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{l.name}</Typography>
                    <Chip
                      label={l.role === 'leader' ? 'Leader' : 'Core'} size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                    />
                    <IconButton size="small"
                      onClick={() => setLeaders((p) => p.filter((x) => x.name !== l.name))}
                      sx={{ color: 'text.disabled' }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined" color="inherit"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setStep(0)}
                sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}
              >
                Back
              </Button>
              <Button
                fullWidth variant="contained" color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => onComplete(leaders)}
                sx={{ py: 1.25 }}
              >
                Get started
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
