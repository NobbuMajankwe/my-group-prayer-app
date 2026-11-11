import { useState } from 'react';
import {
  Avatar, Box, Button, Divider, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Tooltip, Typography, alpha,
} from '@mui/material';
import DownloadIcon        from '@mui/icons-material/FileDownloadOutlined';
import GroupIcon           from '@mui/icons-material/PeopleAltOutlined';
import HistoryIcon         from '@mui/icons-material/HistoryOutlined';
import LogoutIcon          from '@mui/icons-material/LogoutOutlined';
import PersonIcon          from '@mui/icons-material/PersonOutlined';
import DashboardIcon       from '@mui/icons-material/DashboardOutlined';
import StarOutlinedIcon    from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon  from '@mui/icons-material/GroupsOutlined';
import PeopleOutlinedIcon  from '@mui/icons-material/PeopleOutlined';
import MenuIcon            from '@mui/icons-material/MenuOutlined';
import CloseIcon           from '@mui/icons-material/CloseOutlined';
import LockOutlinedIcon    from '@mui/icons-material/LockOutlined';
import type { ReviewEntry, LeaderPerson } from '../types/ReviewEntry';
import { generateReviewsPdf }             from '../utils/pdfGenerator';

const ROLE_COLOURS = {
  leader: { bg: 'rgba(234,179,8,0.14)', color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.14)', color: '#0f766e' },
};

/** Thin icon-button with optional badge for the toolbar icon cluster */
function ToolbarIcon({
  tip, icon, onClick, badge, disabled = false,
}: {
  tip: string; icon: React.ReactNode; onClick: () => void;
  badge?: number | string; disabled?: boolean;
}) {
  return (
    <Tooltip title={tip}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            position: 'relative',
            width: 36, height: 36,
            borderRadius: 2,
            color: 'text.secondary',
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: alpha('#7c3aed', 0.08),
              color: 'primary.main',
            },
            '&.Mui-disabled': { opacity: 0.35 },
          }}
        >
          {icon}
          {badge !== undefined && (
            <Box
              sx={{
                position: 'absolute', top: 2, right: 2,
                minWidth: 16, height: 16, borderRadius: '99px',
                bgcolor: 'primary.main', color: '#fff',
                fontSize: '0.6rem', fontWeight: 800, lineHeight: '16px',
                px: 0.4, textAlign: 'center',
                border: '1.5px solid', borderColor: 'background.default',
              }}
            >
              {badge}
            </Box>
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}

interface HeaderProps {
  entries:         ReviewEntry[];
  currentLeader:   LeaderPerson;
  auditCount:      number;
  memberCount:     number;
  onEditLeaders:   () => void;
  onManageMembers: () => void;
  onShowLog:       () => void;
  onShowStatus:    () => void;
  onProfile:       () => void;
  onLogout:        () => void;
}

export default function Header({
  entries, currentLeader, auditCount, memberCount,
  onEditLeaders, onManageMembers, onShowLog, onShowStatus, onProfile, onLogout,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = currentLeader.displayName || currentLeader.name;
  const initials    = displayName.slice(0, 2).toUpperCase();
  const rc          = ROLE_COLOURS[currentLeader.role];

  const closeMenu = (fn: () => void) => () => { setMenuOpen(false); fn(); };

  return (
    <Box component="header" sx={{ mb: { xs: 3, sm: 4 } }}>

      {/* ═══════════════════════════════════════════════════════
          Top bar — logo left, actions right
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

        {/* Logo + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '0 0 auto' }}>
          <Box
            component="img"
            src="/favicon_io/android-chrome-192x192.png"
            alt="logo"
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              borderRadius: 2.5,
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(124,58,237,0.25)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.06)' },
            }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
                background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.15,
                mb: 0,
              }}
            >
              PrayTogether
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.68rem', sm: '0.78rem' },
                lineHeight: 1.3,
              }}
            >
              Prayer, Review &amp; Action Tracker
            </Typography>
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* ── DESKTOP nav (sm+) ──────────────────────────────── */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.75,
            bgcolor: alpha('#7c3aed', 0.03),
            border: '1px solid',
            borderColor: alpha('#7c3aed', 0.1),
            borderRadius: 3,
            px: 1.5,
            py: 0.75,
          }}
        >
          {/* User pill */}
          <Tooltip title="View / edit profile">
            <Box
              onClick={onProfile}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                pl: 0.5, pr: 1.25, py: 0.4,
                borderRadius: 8, cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: alpha('#7c3aed', 0.08) },
              }}
            >
              <Avatar
                sx={{
                  width: 30, height: 30,
                  bgcolor: rc.bg, color: rc.color,
                  fontSize: '0.73rem', fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ lineHeight: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'text.primary', display: 'block', lineHeight: 1.25 }}
                >
                  {displayName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                  {currentLeader.role === 'leader'
                    ? <StarOutlinedIcon   sx={{ fontSize: 10, color: '#eab308' }} />
                    : <GroupsOutlinedIcon sx={{ fontSize: 10, color: '#14b8a6' }} />}
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem' }}>
                    {currentLeader.role === 'leader' ? 'Leader' : 'Core'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Tooltip>

          {/* Divider between user and actions */}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha('#7c3aed', 0.12) }} />

          {/* Primary labeled buttons — manage actions */}
          {currentLeader.role === 'leader' && (
            <>
              <Tooltip title="Manage team leaders">
                <Button
                  variant="text"
                  size="small"
                  startIcon={<GroupIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={onEditLeaders}
                  sx={{
                    color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem',
                    px: 1, minWidth: 0,
                    '&:hover': { bgcolor: alpha('#7c3aed', 0.08), color: 'primary.main' },
                  }}
                >
                  Team
                </Button>
              </Tooltip>

              <Tooltip title="Manage group members">
                <Button
                  variant="text"
                  size="small"
                  startIcon={<PeopleOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={onManageMembers}
                  sx={{
                    position: 'relative',
                    color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem',
                    px: 1, minWidth: 0,
                    '&:hover': { bgcolor: alpha('#7c3aed', 0.08), color: 'primary.main' },
                  }}
                >
                  Members
                  {memberCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute', top: 0, right: -2,
                        minWidth: 15, height: 15, borderRadius: '99px',
                        bgcolor: alpha('#7c3aed', 0.15), color: 'primary.dark',
                        fontSize: '0.58rem', fontWeight: 800, lineHeight: '15px',
                        px: 0.4, textAlign: 'center',
                      }}
                    >
                      {memberCount}
                    </Box>
                  )}
                </Button>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha('#7c3aed', 0.12) }} />
            </>
          )}

          {/* Icon-only tool buttons */}
          <ToolbarIcon tip="Review status" icon={<DashboardIcon sx={{ fontSize: 18 }} />} onClick={onShowStatus} />
          <ToolbarIcon
            tip="Activity log"
            icon={<HistoryIcon sx={{ fontSize: 18 }} />}
            onClick={onShowLog}
            badge={auditCount > 0 ? (auditCount > 99 ? '99+' : auditCount) : undefined}
          />
          <ToolbarIcon
            tip={entries.length === 0 ? 'Add entries to export PDF' : 'Download PDF report'}
            icon={<DownloadIcon sx={{ fontSize: 18 }} />}
            onClick={() => generateReviewsPdf(entries)}
            disabled={entries.length === 0}
          />

          {/* Divider before lock */}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha('#7c3aed', 0.12) }} />

          <Tooltip title="Lock app">
            <IconButton
              size="small"
              onClick={onLogout}
              sx={{
                width: 36, height: 36, borderRadius: 2,
                color: 'text.disabled',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: alpha('#dc2626', 0.08), color: 'error.main' },
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── MOBILE: avatar + hamburger ─────────────────────── */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 0.75, alignItems: 'center' }}>
          <Tooltip title="View profile">
            <Avatar
              onClick={onProfile}
              sx={{
                width: 34, height: 34, bgcolor: rc.bg, color: rc.color,
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                border: `2px solid ${alpha('#7c3aed', 0.2)}`,
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.08)' },
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => setMenuOpen(true)}
            sx={{
              color: 'primary.main',
              bgcolor: alpha('#7c3aed', 0.07),
              borderRadius: 2,
              '&:hover': { bgcolor: alpha('#7c3aed', 0.14) },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              borderRadius: '20px 0 0 20px',
              p: 0,
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            px: 2.5, pt: 3, pb: 2,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(219,39,119,0.05) 100%)',
            borderBottom: '1px solid', borderColor: alpha('#7c3aed', 0.1),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>MENU</Typography>
            <IconButton size="small" onClick={() => setMenuOpen(false)} sx={{ color: 'text.disabled' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '1rem' }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {displayName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {currentLeader.role === 'leader'
                  ? <StarOutlinedIcon   sx={{ fontSize: 12, color: '#eab308' }} />
                  : <GroupsOutlinedIcon sx={{ fontSize: 12, color: '#14b8a6' }} />}
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {currentLeader.role === 'leader' ? 'Leader' : 'Core / Intern'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <List sx={{ py: 1.5, px: 1 }}>
          <ListItemButton onClick={closeMenu(onProfile)} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><PersonIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600 }}>Profile</Typography>} />
          </ListItemButton>

          {currentLeader.role === 'leader' && (
            <>
              <ListItemButton onClick={closeMenu(onEditLeaders)} sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}><GroupIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontWeight: 600 }}>Team</Typography>} />
              </ListItemButton>
              <ListItemButton onClick={closeMenu(onManageMembers)} sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}><PeopleOutlinedIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600 }}>Members</Typography>}
                  secondary={memberCount > 0 ? `${memberCount} in roster` : undefined}
                />
              </ListItemButton>
            </>
          )}

          <ListItemButton onClick={closeMenu(onShowStatus)} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><DashboardIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600 }}>Review Status</Typography>} />
          </ListItemButton>

          <ListItemButton onClick={closeMenu(onShowLog)} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><HistoryIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600 }}>Activity Log</Typography>}
              secondary={auditCount > 0 ? `${auditCount} event${auditCount === 1 ? '' : 's'}` : undefined}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => { setMenuOpen(false); generateReviewsPdf(entries); }}
            disabled={entries.length === 0}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DownloadIcon sx={{ color: entries.length > 0 ? 'primary.main' : 'text.disabled' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600 }}>Download PDF</Typography>} />
          </ListItemButton>

          <Divider sx={{ my: 1, borderColor: alpha('#7c3aed', 0.08) }} />

          <ListItemButton onClick={closeMenu(onLogout)} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon sx={{ color: 'error.main' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600, color: 'error.main' }}>Lock App</Typography>} />
          </ListItemButton>
        </List>
      </Drawer>

      {/* Gradient divider */}
      <Box
        sx={{
          mt: { xs: 2.5, sm: 3 },
          height: 2,
          borderRadius: 1,
          background: 'linear-gradient(90deg, #7c3aed44 0%, #db277744 50%, #7c3aed22 100%)',
        }}
      />
    </Box>
  );
}
