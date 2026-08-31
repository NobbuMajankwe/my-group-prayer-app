import { Box, Button, Tooltip, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import GroupIcon from '@mui/icons-material/PeopleAltOutlined';
import type { ReviewEntry } from '../types/ReviewEntry';
import { generateReviewsPdf } from '../utils/pdfGenerator';

interface HeaderProps {
  entries: ReviewEntry[];
  onEditLeaders: () => void;
}

export default function Header({ entries, onEditLeaders }: HeaderProps) {
  return (
    <Box component="header" sx={{ mb: 5 }}>
      {/* Title row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 0.5,
            }}
          >
            Review &amp; Action Tracker
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Capture reviews and the actions planned in response.
          </Typography>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
          <Tooltip title="Add or remove leaders">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<GroupIcon />}
              onClick={onEditLeaders}
            >
              Leaders
            </Button>
          </Tooltip>

          <Tooltip title={entries.length === 0 ? 'Add entries first' : 'Download all entries as PDF'}>
            <span>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => generateReviewsPdf(entries)}
                disabled={entries.length === 0}
              >
                PDF
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          mt: 3,
          height: 2,
          borderRadius: 1,
          background: 'linear-gradient(90deg, #7c3aed22 0%, #db277722 100%)',
        }}
      />
    </Box>
  );
}
