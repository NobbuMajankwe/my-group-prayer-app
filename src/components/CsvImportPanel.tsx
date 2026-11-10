/**
 * Reusable CSV import panel.
 *
 * Supports:
 *  - File upload (.csv) — user picks a file, content loads into the textarea for review
 *  - Paste — user pastes CSV text directly
 *
 * Parsing rules:
 *  - Empty lines and lines whose first field starts with # are ignored (comments)
 *  - Quoted fields (Excel-style) are unquoted
 *  - Trailing empty columns are stripped per row
 *  - Fields are trimmed of whitespace
 */

import { useState, useRef } from 'react';
import {
  Alert, Box, Button, Divider, TextField, Tooltip,
  Typography, alpha,
} from '@mui/material';
import UploadFileOutlinedIcon  from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon               from '@mui/icons-material/Close';

// ── CSV parsing ────────────────────────────────────────────────────────────

/**
 * Parse a raw CSV string into rows of strings.
 * Handles basic RFC-4180 quoting (double-quotes, escaped quotes).
 */
function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;                       // skip blank lines

    const fields: string[] = [];
    let cur   = '';
    let inQ   = false;

    for (let i = 0; i < trimmed.length; i++) {
      const ch   = trimmed[i];
      const next = trimmed[i + 1];

      if (inQ) {
        if (ch === '"' && next === '"') { cur += '"'; i++; }  // escaped quote
        else if (ch === '"')            { inQ = false; }       // end of quoted field
        else                            { cur += ch; }
      } else {
        if (ch === '"')  { inQ = true; }
        else if (ch === ',') { fields.push(cur.trim()); cur = ''; }
        else             { cur += ch; }
      }
    }
    fields.push(cur.trim());  // last field

    // Strip trailing empty fields (Excel often adds ,, at the end)
    while (fields.length > 0 && fields[fields.length - 1] === '') fields.pop();
    if (fields.length === 0) continue;

    // Skip comment rows (first field starts with #)
    if (fields[0].startsWith('#')) continue;

    rows.push(fields);
  }

  return rows;
}

// ── Component ──────────────────────────────────────────────────────────────

interface CsvImportPanelProps {
  formatHint: string;
  example:    string;
  onImport:   (rows: string[][]) => void;
  disabled?:  boolean;
}

export default function CsvImportPanel({
  formatHint, example, onImport, disabled,
}: CsvImportPanelProps) {
  const [text,     setText]     = useState('');
  const [fileName, setFileName] = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File picker ────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a .csv file.');
      return;
    }

    setFileName(file.name);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content ?? '');
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleClearFile = () => {
    setText('');
    setFileName('');
    setError('');
    setSuccess('');
  };

  // ── Import ─────────────────────────────────────────────────────────────

  const handleImport = () => {
    setError('');
    setSuccess('');

    const rows = parseCsv(text);

    if (rows.length === 0) {
      setError('Nothing to import — the file or text appears to be empty or only contains comments.');
      return;
    }

    onImport(rows);
    setSuccess(`${rows.length} row${rows.length !== 1 ? 's' : ''} imported successfully.`);
    setText('');
    setFileName('');
  };

  return (
    <Box
      sx={{
        p: 2, borderRadius: 3,
        bgcolor: alpha('#7c3aed', 0.025),
        border: '1px solid', borderColor: alpha('#7c3aed', 0.12),
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
        <UploadFileOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="caption" sx={{
          fontWeight: 700, color: 'primary.main',
          textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1,
        }}>
          Import from CSV
        </Typography>
      </Box>

      {/* File upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<InsertDriveFileOutlinedIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          sx={{ flexShrink: 0 }}
        >
          Choose CSV file
        </Button>

        {fileName ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'primary.dark', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {fileName}
            </Typography>
            <Tooltip title="Clear file">
              <CloseIcon
                sx={{ fontSize: 14, color: 'text.disabled', cursor: 'pointer', flexShrink: 0,
                  '&:hover': { color: 'error.main' } }}
                onClick={handleClearFile}
              />
            </Tooltip>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            or paste below
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 1.5, borderColor: alpha('#7c3aed', 0.08) }} />

      {/* Text area — shows file content after upload, or accepts paste */}
      <TextField
        fullWidth
        multiline
        rows={5}
        size="small"
        placeholder={example}
        value={text}
        onChange={(e) => { setText(e.target.value); setFileName(''); setError(''); setSuccess(''); }}
        sx={{ mb: 1 }}
        slotProps={{
          input: { sx: { fontFamily: 'monospace', fontSize: '0.78rem' } },
        }}
      />

      <Typography
        variant="caption"
        sx={{ color: 'text.disabled', display: 'block', mb: 1.5, lineHeight: 1.6, whiteSpace: 'pre-line' }}
      >
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
        variant="contained"
        color="primary"
        size="small"
        startIcon={<UploadFileOutlinedIcon />}
        onClick={handleImport}
        disabled={disabled || !text.trim()}
        fullWidth
      >
        Import {text.trim() ? `(${parseCsv(text).length} rows)` : ''}
      </Button>
    </Box>
  );
}
