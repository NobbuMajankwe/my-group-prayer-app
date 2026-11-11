import { Avatar, Box, Button, Chip, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import DownloadIcon      from '@mui/icons-material/FileDownloadOutlined';
import GroupIcon         from '@mui/icons-material/PeopleAltOutlined';
import HistoryIcon       from '@mui/icons-material/HistoryOutlined';
import LogoutIcon        from '@mui/icons-material/LogoutOutlined';
import PersonIcon        from '@mui/icons-material/PersonOutlined';
import DashboardIcon     from '@mui/icons-material/DashboardOutlined';
import StarOutlinedIcon  from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import type { ReviewEntry, LeaderPerson } from '../types/ReviewEntry';
import { generateReviewsPdf }            from '../utils/pdfGenerator';

const ROLE_COLOURS = {
  leader: { bg: 'rgba(234,179,8,0.12)', color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.12)', color: '#0f766e' },
};

interface HeaderProps {
  entries:         ReviewEntry[];
  currentLeader:   LeaderPerson;
  auditCount:      number;
  memberCount:     number;
  onEditLeaders:   () => void;
  onManageMembers: () => void;
  onShowLog:       () => void;
  onShowStatus:     () => void;
  onProfile:       () => void;
  onLogout:        () => void;
}

export default function Header({
  entries, currentLeader, auditCount, memberCount,
  onEditLeaders, onManageMembers, onShowLog, onShowStatus, onProfile, onLogout,
}: HeaderProps) {
  const displayName = currentLeader.displayName || currentLeader.name;
  const initials    = displayName.slice(0, 2).toUpperCase();
  const rc          = ROLE_COLOURS[currentLeader.role];

  return (
    <Box component="header" sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>

        {/* Logo + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box component="img" src="/favicon_io/android-chrome-192x192.png" alt="logo"
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, borderRadius: 2.5,
              flexShrink: 0, boxShadow: '0 2px 8px rgba(124,58,237,0.18)' }} />
          <Box>
            <Typography variant="h4" component="h1"
              sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', mb: 0.25, lineHeight: 1.2 }}>
              PrayTogether
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Prayer, Review &amp; Action Tracker
            </Typography>
          </Box>
        </Box>

        {/* Right side: current user + actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>

          {/* Current user pill — clickable → profile */}
          <Tooltip title="View profile">
            <Box onClick={onProfile} sx={{ display: 'flex', alignItems: 'center', gap: 1,
              px: 1.25, py: 0.5, borderRadius: 10, cursor: 'pointer',
              bgcolor: alpha('#7c3aed', 0.05),
              border: '1px solid', borderColor: alpha('#7c3aed', 0.15),
              transition: 'all 0.12s',
              '&:hover': { bgcolor: alpha('#7c3aed', 0.09), borderColor: alpha('#7c3aed', 0.3) } }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: rc.bg, color: rc.color,
                fontSize: '0.72rem', fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', lineHeight: 1.2 }}>
                  {displayName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  {currentLeader.role === 'leader'
                    ? <StarOutlinedIcon sx={{ fontSize: 10, color: '#eab308' }} />
                    : <GroupsOutlinedIcon sx={{ fontSize: 10, color: '#14b8a6' }} />}
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                    {currentLeader.role === 'leader' ? 'Leader' : 'Core'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Tooltip>

          {/* Profile (mobile icon only) */}
          <Tooltip title="Profile">
            <IconButton size="small" onClick={onProfile}
              sx={{ display: { xs: 'flex', sm: 'none' }, color: 'primary.main' }}>
              <PersonIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Team + Members — leaders only */}
          {currentLeader.role === 'leader' && (
            <>
              <Tooltip title="Manage team leaders">
                <Button variant="outlined" color="primary" size="small"
                  startIcon={<GroupIcon />} onClick={onEditLeaders}>
                  Team
                </Button>
              </Tooltip>

              <Tooltip title="Manage group members">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<PeopleOutlinedIcon />}
                  onClick={onManageMembers}
                  sx={{ position: 'relative' }}
                >
                  Members
                  {memberCount > 0 && (
                    <Chip
                      label={memberCount}
                      size="small"
                      sx={{
                        position: 'absolute', top: -8, right: -8,
                        height: 18, minWidth: 18, fontSize: '0.6rem', fontWeight: 700,
                        bgcolor: alpha('#7c3aed', 0.15), color: 'primary.dark',
                        border: '2px solid', borderColor: 'background.default',
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  )}
                </Button>
              </Tooltip>
            </>
          )}

          {/* Review status dashboard */}
          <Tooltip title="Review status overview">
            <Button variant="outlined" color="primary" size="small" startIcon={<DashboardIcon />}
              onClick={onShowStatus}>
              Status
            </Button>
          </Tooltip>

          {/* Activity log */}
          <Tooltip title="Activity log">
            <Button variant="outlined" color="primary" size="small" startIcon={<HistoryIcon />}
              onClick={onShowLog} sx={{ position: 'relative' }}>
              Log
              {auditCount > 0 && (
                <Chip label={auditCount > 99 ? '99+' : auditCount} size="small" sx={{
                  position: 'absolute', top: -8, right: -8,
                  height: 18, minWidth: 18, fontSize: '0.6rem', fontWeight: 700,
                  bgcolor: 'primary.main', color: '#fff',
                  border: '2px solid', borderColor: 'background.default',
                  '& .MuiChip-label': { px: 0.5 },
                }} />
              )}
            </Button>
          </Tooltip>

          {/* PDF download */}
          <Tooltip title={entries.length === 0 ? 'Add entries first' : 'Download PDF'}>
            <span>
              <Button variant="contained" color="primary" size="small" startIcon={<DownloadIcon />}
                onClick={() => generateReviewsPdf(entries)} disabled={entries.length === 0}>
                PDF
              </Button>
            </span>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Lock app">
            <Button variant="outlined" color="inherit" size="small" startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary',
                '&:hover': { borderColor: 'error.main', color: 'error.main', bgcolor: alpha('#dc2626', 0.04) } }}>
              Lock
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Gradient divider */}
      <Box sx={{ mt: 3, height: 2, borderRadius: 1,
        background: 'linear-gradient(90deg, #7c3aed22 0%, #db277722 100%)' }} />
    </Box>
  );
}
