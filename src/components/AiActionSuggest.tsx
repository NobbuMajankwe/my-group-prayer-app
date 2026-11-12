import { useState } from 'react';
import { Box, Button, CircularProgress, Typography, alpha } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { getAiClient, isAiAvailable } from '../utils/aiClient';

interface AiActionSuggestProps {
  prayerRequest: string;
  onAccept: (suggestion: string) => void;
}

export default function AiActionSuggest({ prayerRequest, onAccept }: AiActionSuggestProps) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  if (!isAiAvailable()) return null;

  const handleSuggest = async () => {
    if (!prayerRequest.trim()) return;
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const client = getAiClient();
      const { data, errors } = await client.generations.PrayerAssistant({ prayerRequest });
      if (errors?.length) throw new Error(errors[0].message);
      setSuggestion(data?.action ?? '');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setError(
        msg.toLowerCase().includes('mapping template') || msg.toLowerCase().includes('not configured')
          ? 'AI is still initialising — try again in a moment.'
          : msg || 'AI suggestion failed',
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
        startIcon={loading ? <CircularProgress size={13} /> : <AutoFixHighIcon sx={{ fontSize: 15 }} />}
        onClick={handleSuggest}
        disabled={loading || !prayerRequest.trim()}
        sx={{
          textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
          borderColor: alpha('#7c3aed', 0.35), color: 'primary.main',
          '&:hover': { borderColor: '#7c3aed', bgcolor: alpha('#7c3aed', 0.04) },
        }}
      >
        {loading ? 'Thinking…' : 'Suggest follow-up action'}
      </Button>

      {error && (
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.75 }}>
          {error}
        </Typography>
      )}

      {suggestion && (
        <Box sx={{
          mt: 1, p: 1.5, borderRadius: 2,
          bgcolor: alpha('#7c3aed', 0.05), border: `1px solid ${alpha('#7c3aed', 0.2)}`,
        }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5 }}>
            AI suggestion
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
            {suggestion}
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => { onAccept(suggestion); setSuggestion(''); }}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', py: 0.4, px: 1.5 }}
          >
            Use this
          </Button>
        </Box>
      )}
    </Box>
  );
}
