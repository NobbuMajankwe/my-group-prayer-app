import { useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Typography, alpha } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import { getAiClient, isAiAvailable } from '../utils/aiClient';

interface AiSummaryButtonProps {
  requests: string[]; // array of prayer request strings
}

export default function AiSummaryButton({ requests }: AiSummaryButtonProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!isAiAvailable()) return null;

  const handleSummarise = async () => {
    if (!requests.length) return;
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const client = getAiClient();
      const { data, errors } = await client.generations.PrayerSummary({
        requests: requests.join('\n\n'),
      });
      if (errors?.length) throw new Error(errors[0].message);
      setSummary(data?.summary ?? '');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setError(
        msg.toLowerCase().includes('mapping template') || msg.toLowerCase().includes('not configured')
          ? 'AI is still initialising — try again in a moment.'
          : msg || 'Summary failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        size="small"
        variant="outlined"
        startIcon={loading ? <CircularProgress size={13} /> : <AutoAwesomeIcon sx={{ fontSize: 15 }} />}
        onClick={handleSummarise}
        disabled={loading || requests.length === 0}
        sx={{
          textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
          borderColor: alpha('#7c3aed', 0.35), color: 'primary.main',
          '&:hover': { borderColor: '#7c3aed', bgcolor: alpha('#7c3aed', 0.04) },
        }}
      >
        {loading ? 'Summarising…' : 'AI pastoral overview'}
      </Button>

      {error && (
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.75 }}>
          {error}
        </Typography>
      )}

      {summary && (
        <Box sx={{
          mt: 1.5, p: 2, borderRadius: 2.5,
          bgcolor: alpha('#7c3aed', 0.04), border: `1px solid ${alpha('#7c3aed', 0.18)}`,
          position: 'relative',
        }}>
          <IconButton
            size="small"
            onClick={() => setSummary('')}
            sx={{ position: 'absolute', top: 6, right: 6, color: 'text.disabled' }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI Pastoral Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, pr: 2 }}>
            {summary}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
