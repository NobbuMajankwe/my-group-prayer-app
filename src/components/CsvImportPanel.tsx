/**
 * Reusable CSV import panel.
 *
 * Renders a textarea + parse button.  The parent provides:
 *   - format description shown as a hint
 *   - example text pre-filled in the textarea
 *   - an onImport callback that receives the parsed rows (string[][])
 *
 * Rows are split on newlines; fields on commas.
 * Empty rows and rows starting with # are ignored.
 */

import { useState } from 'react';
import {
  Alert, Box, Button, TextField, Typography, alpha,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

interface CsvImportPanelProps {
  /** Short description of the expected format shown below the textarea */
  formatHint:  string;
  /** Placeholder / example text pre-filled in the textarea */
  example:     string;
  /** Called with parsed rows (each row is an array of trimmed strings) */
  onImport:    (rows: string[][]) => void;
  /** Optional: disable the import button */
  disabled?:   boolean;
}

export default function CsvImportPanel({
  formatHint, example, onImport, disabled,
}: CsvImportPanelProps) {
  const [text,    setText]    = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleImport = () => {
    setError('');
    setSuccess('');

    const rows = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .map((line) => line.split(',').map((cell) => cell.trim()));

    if (rows.length === 0) {
      setError('Nothing to import — paste some names first.');
      return;
    }

    // Basic check: every row must have at least 1 non-empty field
    const invalid = rows.filter((r) => r.every((c) => !c));
    if (invalid.length > 0) {
      setError('Some rows appear to be empty. Please check your CSV.');
      return;
    }

    onImport(rows);
    setSuccess(`${rows.length} row${rows.length !== 1 ? 's' : ''} imported successfully.`);
    setText('');
  };

  return (
    <Box
      sx={{
        p: 2, borderRadius: 3,
        bgcolor: alpha('#7c3aed', 0.025),
        border: '1px solid', borderColor: alpha('#7c3aed', 0.12),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <UploadFileOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="caption" sx={{
          fontWeight: 700, color: 'primary.main',
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          Import from CSV
        </Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={5}
        size="small"
        placeholder={example}
        value={text}
        onChange={(e) => { setText(e.target.value); setError(''); setSuccess(''); }}
        sx={{ mb: 1 }}
        slotProps={{
          input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } },
        }}
      />

      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1.5, lineHeight: 1.5 }}>
        {formatHint}
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 1.5, borderRadius: 2, py: 0.5 }}>{error}</Alert>}
      {success && (
        <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="small" />}
          sx={{ mb: 1.5, borderRadius: 2, py: 0.5 }}>
          {success}
        </Alert>
      )}

      <Button
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<UploadFileOutlinedIcon />}
        onClick={handleImport}
        disabled={disabled || !text.trim()}
        fullWidth
      >
        Import
      </Button>
    </Box>
  );
}
