import { Box, Button, IconButton, Typography } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CloseIcon             from '@mui/icons-material/Close';

interface NotificationPromptProps {
  leaderName: string;
  onAllow:    () => void;
  onDismiss:  () => void;
}

export default function NotificationPrompt({ leaderName, onAllow, onDismiss }: NotificationPromptProps) {
  return (
    <Box
      sx={{
        mb: 3, p: 2, borderRadius: 3,
        background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)',
        border: '1px solid rgba(124,58,237,0.2)',
        boxShadow: '0 2px 12px rgba(124,58,237,0.1)',
        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
        animation: 'slideDown 0.4s ease',
        '@keyframes slideDown': {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        sx={{
          width: 36, height: 36, borderRadius: 2.5, flexShrink: 0,
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
        }}
      >
        <NotificationsNoneIcon className="wiggle" sx={{ fontSize: 18, color: '#fff' }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 160 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#5b21b6', lineHeight: 1.3 }}>
          Stay on top of action plans, {leaderName.split(' ')[0]} 💜
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Allow weekly reminders so you never miss a follow-up.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onAllow}
          sx={{ whiteSpace: 'nowrap', py: 0.5 }}
        >
          Allow
        </Button>
        <IconButton size="small" onClick={onDismiss} sx={{ color: 'text.disabled' }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
