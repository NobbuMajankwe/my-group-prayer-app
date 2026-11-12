import { useState } from 'react';
import { Box, Button, CircularProgress, Typography, alpha } from '@mui/material';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import { getAiClient, isAiAvailable } from '../utils/aiClient';

interface AiMemberNotesProps {
  memberName: string;
  recentRequests: string[]; // prayer requests for this member
  onAccept: (note: string) => void;
}

export default function AiMemberNotes({ memberName, recentRequests, onAccept }: AiMemberNotesProps) {
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!isAiAvailable() || !recentRequests.length) return null;

  const handleSuggest = async () => {
    setLoading(true);
    setError('');
    setNote('');
    try {
      const client = getAiClient();
      const { data, errors } = await client.generations.MemberNoteSuggestion({
        memberName,
        recentRequests: recentRequests.join('\n'),
      });
      if (errors?.length) {
        const e = errors[0] as any;
        throw new Error(`${e.message} [${e.errorType ?? 'unknown'}]`);
      }
      setNote(data?.note ?? '');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Suggestion failed';
      console.error('[AiMemberNotes]', e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        size="small"
        variant="outlined"
        startIcon={loading ? <CircularProgress size={13} /> : <PsychologyAltIcon sx={{ fontSize: 15 }} />}
        onClick={handleSuggest}
        disabled={loading}
        sx={{
          textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
          borderColor: alpha('#7c3aed', 0.3), color: 'primary.main',
          '&:hover': { borderColor: '#7c3aed', bgcolor: alpha('#7c3aed', 0.04) },
        }}
      >
        {loading ? 'Thinking…' : 'Suggest note from prayer history'}
      </Button>

      {error && (
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
          {error}
        </Typography>
      )}

      {note && (
        <Box sx={{
          mt: 1, p: 1.25, borderRadius: 2,
          bgcolor: alpha('#7c3aed', 0.05), border: `1px solid ${alpha('#7c3aed', 0.2)}`,
        }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.4 }}>
            AI suggestion
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, fontSize: '0.82rem' }}>
            {note}
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => { onAccept(note); setNote(''); }}
            sx={{ mt: 0.75, textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', py: 0.3, px: 1.25 }}
          >
            Use this
          </Button>
        </Box>
      )}
    </Box>
  );
}
