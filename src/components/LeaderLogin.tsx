import { useState, useRef, useEffect } from 'react';
import {
  Alert, Avatar, Box, Button, Divider,
  Paper, TextField, Typography, alpha,
} from '@mui/material';
import LoginIcon          from '@mui/icons-material/Login';
import ArrowBackIcon      from '@mui/icons-material/ArrowBackOutlined';
import StarOutlinedIcon   from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { verifyPin }      from '../utils/crypto';
import type { LeaderPerson } from '../types/ReviewEntry';

const MAX_ATTEMPTS = 5;

const ROLE_COLOURS = {
  leader: { bg: 'rgba(234,179,8,0.10)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', color: '#0f766e' },
};

interface LeaderLoginProps {
  leaders:   LeaderPerson[];
  onSuccess: (leader: LeaderPerson) => void;
}

export default function LeaderLogin({ leaders, onSuccess }: LeaderLoginProps) {
  const [selected, setSelected] = useState<LeaderPerson | null>(null);
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading,  setLoading]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) inputRef.current?.focus();
  }, [selected]);

  const handleSelect = (l: LeaderPerson) => {
    setSelected(l);
    setPassword('');
    setError('');
    setAttempts(0);
  };

  const handleBack = () => {
    setSelected(null);
    setPassword('');
    setError('');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selected || !password || loading) return;
    setLoading(true);
    setError('');
    try {
      const ok = await verifyPin(password, selected.passwordHash);
      if (ok) {
        onSuccess(selected);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        const rem = MAX_ATTEMPTS - next;
        setError(
          rem > 0
            ? `Incorrect password. ${rem} attempt${rem === 1 ? '' : 's'} remaining.`
            : 'Too many attempts. Please refresh the page.'
        );
        setPassword('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const locked      = attempts >= MAX_ATTEMPTS;
  const displayName = (l: LeaderPerson) => l.displayName || l.name;
  const initials    = (l: LeaderPerson) => displayName(l).slice(0, 2).toUpperCase();

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', px: 2, bgcolor: '#faf5ff',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 10% 10%, #ede9fe 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 90% 90%, #fce7f3 0%, transparent 60%),' +
          'radial-gradient(ellipse 35% 25% at 50% 50%, rgba(167,139,250,0.08) 0%, transparent 70%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid', borderColor: alpha('#7c3aed', 0.12),
          animation: 'fadeIn 0.4s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(16px)' },
            to:   { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2.5,
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
              p: '2px',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/favicon_io/android-chrome-192x192.png"
              alt="logo"
              sx={{ width: '100%', height: '100%', borderRadius: 2, display: 'block' }}
            />
          </Box>
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
              Review &amp; Action Tracker
            </Typography>
          </Box>
        </Box>

        {/* ── Step 1: pick who you are ── */}
        {!selected && (
          <>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 0.25, fontWeight: 800 }}>
                Who are you? 👋
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Select your name to continue.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {leaders.map((l, idx) => {
                const rc = ROLE_COLOURS[l.role];
                return (
                  <Box
                    key={l.name}
                    onClick={() => handleSelect(l)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      px: 2, py: 1.5, borderRadius: 3, cursor: 'pointer',
                      border: '1px solid', borderColor: alpha('#7c3aed', 0.1),
                      bgcolor: 'background.paper',
                      transition: 'all 0.15s ease',
                      animation: `slideIn 0.3s ease ${idx * 0.06}s both`,
                      '@keyframes slideIn': {
                        from: { opacity: 0, transform: 'translateX(-10px)' },
                        to:   { opacity: 1, transform: 'translateX(0)' },
                      },
                      '&:hover': {
                        bgcolor: alpha('#7c3aed', 0.05),
                        borderColor: alpha('#7c3aed', 0.3),
                        boxShadow: 2,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36, height: 36, bgcolor: rc.bg,
                        color: rc.color, fontSize: '0.85rem', fontWeight: 700,
                      }}
                    >
                      {initials(l)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {displayName(l)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {l.role === 'leader'
                          ? <StarOutlinedIcon   sx={{ fontSize: 11, color: '#eab308' }} />
                          : <GroupsOutlinedIcon sx={{ fontSize: 11, color: '#14b8a6' }} />}
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {l.role === 'leader' ? 'Leader' : 'Core / Intern'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {/* ── Step 2: enter password ── */}
        {selected && (
          <>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5,
                p: 1.5, borderRadius: 3,
                bgcolor: alpha('#7c3aed', 0.04),
                border: '1px solid', borderColor: alpha('#7c3aed', 0.1),
              }}
            >
              <Avatar
                sx={{
                  width: 40, height: 40,
                  bgcolor: ROLE_COLOURS[selected.role].bg,
                  color:   ROLE_COLOURS[selected.role].color,
                  fontWeight: 700,
                }}
              >
                {initials(selected)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {displayName(selected)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {selected.role === 'leader' ? 'Leader' : 'Core / Intern'}
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
              >
                Change
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {error && (
              <Alert severity={locked ? 'error' : 'warning'} sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                inputRef={inputRef}
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={locked || loading}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<LoginIcon />}
                disabled={locked || loading || !password}
                sx={{ py: 1.25 }}
              >
                {loading ? 'Checking…' : 'Log in'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
