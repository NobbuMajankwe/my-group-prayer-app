import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const MAX_LEADERS = 10;

interface LeaderSetupProps {
  onComplete: (leaders: string[]) => void;
}

export default function LeaderSetup({ onComplete }: LeaderSetupProps) {
  const [leaders, setLeaders] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) { setInputError('Please enter a name.'); return; }
    if (leaders.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('That name is already added.'); return;
    }
    if (leaders.length >= MAX_LEADERS) { setInputError(`Maximum ${MAX_LEADERS} leaders.`); return; }
    setLeaders((p) => [...p, trimmed]);
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
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha('#7c3aed', 0.12),
        }}
      >
        {/* Icon + heading */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '2.5rem', lineHeight: 1, mb: 1 }}>👋</Typography>
          <Typography variant="h5" sx={{ mb: 0.5, color: 'primary.main' }}>
            Set up your leaders
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Add up to {MAX_LEADERS} names. You can change these later.
          </Typography>
        </Box>

        {/* Input */}
        <TextField
          fullWidth
          label="Leader name"
          placeholder="e.g. Shereen"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); if (inputError) setInputError(''); }}
          onKeyDown={handleKeyDown}
          error={Boolean(inputError)}
          helperText={inputError || `${leaders.length} / ${MAX_LEADERS} added`}
          disabled={leaders.length >= MAX_LEADERS}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleAdd}
                    disabled={leaders.length >= MAX_LEADERS || !inputValue.trim()}
                    edge="end"
                    color="primary"
                    aria-label="Add leader"
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Chips */}
        {leaders.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              mb: 3,
              p: 1.5,
              borderRadius: 3,
              bgcolor: alpha('#7c3aed', 0.04),
              border: '1px dashed',
              borderColor: alpha('#7c3aed', 0.18),
              minHeight: 44,
            }}
          >
            {leaders.map((leader) => (
              <Chip
                key={leader}
                label={leader}
                size="small"
                onDelete={() => setLeaders((p) => p.filter((l) => l !== leader))}
                deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  bgcolor: alpha('#7c3aed', 0.08),
                  color: 'primary.dark',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha('#7c3aed', 0.2),
                }}
              />
            ))}
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
          {leaders.length === 0 ? 'Add at least one leader' : 'Get started'}
        </Button>
      </Paper>
    </Box>
  );
}
