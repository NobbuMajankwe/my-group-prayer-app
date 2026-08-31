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
  Typography,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const MAX_LEADERS = 10;

interface Props {
  open: boolean;
  currentLeaders: string[];
  onSave: (leaders: string[]) => void;
  onClose: () => void;
}

export default function EditLeadersDialog({ open, currentLeaders, onSave, onClose }: Props) {
  const [leaders, setLeaders] = useState<string[]>(currentLeaders);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (open) {
      setLeaders(currentLeaders);
      setInputValue('');
      setInputError('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) { setInputError('Please enter a name.'); return; }
    if (leaders.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('Already in the list.'); return;
    }
    if (leaders.length >= MAX_LEADERS) { setInputError(`Max ${MAX_LEADERS} leaders.`); return; }
    setLeaders((p) => [...p, trimmed]);
    setInputValue('');
    setInputError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Leaders</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400, mt: 0.25 }}>
          Add or remove leaders for the dropdown.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        {/* Input */}
        <TextField
          fullWidth
          label="Add a leader"
          placeholder="e.g. Shereen"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); if (inputError) setInputError(''); }}
          onKeyDown={handleKeyDown}
          error={Boolean(inputError)}
          helperText={inputError || `${leaders.length} / ${MAX_LEADERS}`}
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
        {leaders.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              p: 1.5,
              borderRadius: 3,
              bgcolor: alpha('#7c3aed', 0.03),
              border: '1px dashed',
              borderColor: alpha('#7c3aed', 0.15),
            }}
          >
            {leaders.map((l) => (
              <Chip
                key={l}
                label={l}
                size="small"
                onDelete={() => setLeaders((p) => p.filter((x) => x !== l))}
                deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                sx={{
                  bgcolor: alpha('#7c3aed', 0.08),
                  color: 'primary.dark',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha('#7c3aed', 0.18),
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}>
            No leaders yet.
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
