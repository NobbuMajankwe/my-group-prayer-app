import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  alpha,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { ReviewEntry } from '../types/ReviewEntry';

interface Props {
  entry: ReviewEntry | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationDialog({ entry, open, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: alpha('#dc2626', 0.08),
            }}
          >
            <WarningAmberRoundedIcon sx={{ color: 'error.main', fontSize: 20 }} />
          </Box>
          <Typography variant="h6">Delete entry?</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This will permanently delete the entry for{' '}
          <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {entry?.revieweeName ?? (entry as any)?.name}
          </Typography>
          . This cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel}
          sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
