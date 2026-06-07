'use client';

import * as React from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import GroupsIcon from '@mui/icons-material/Groups';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Sub-tab content components
import MeetTheTeamContent from './aboutma/MeetTheTeamContent';
import TestimonialsContent from './aboutma/TestimonialsContent';
import LookingForHigherContent from './aboutma/LookingForHigherContent';
import AboutContent from './aboutma/AboutContent';

const SUB_TABS = [
  { key: 'about-ma/about',          label: 'About',               icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} /> },
  { key: 'about-ma/meet-the-team',  label: 'Meet the Team',       icon: <GroupsIcon sx={{ fontSize: 18 }} /> },
  { key: 'about-ma/higher',         label: 'Looking For Higher',  icon: <FlightTakeoffIcon sx={{ fontSize: 18 }} /> },
  { key: 'about-ma/testimonials',   label: 'Testimonials',        icon: <FormatQuoteIcon sx={{ fontSize: 18 }} /> },
];

interface AboutMATabProps {
  currentTab: string;
}

export default function AboutMATab({ currentTab }: AboutMATabProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  // Default "about-ma" to "about-ma/meet-the-team"
  const activeKey = currentTab === 'about-ma' ? 'about-ma/about' : currentTab;

  // Redirect if bare about-ma
  React.useEffect(() => {
    if (currentTab === 'about-ma') {
      router.replace('/content?tab=about-ma/about', { scroll: false });
    }
  }, [currentTab, router]);

  const handleSubTabClick = (key: string) => {
    router.push(`/content?tab=${key}`, { scroll: false });
  };

  const renderSubContent = () => {
    switch (activeKey) {
      case 'about-ma/about':
        return <AboutContent />;
      case 'about-ma/meet-the-team':
        return <MeetTheTeamContent />;
      case 'about-ma/higher':
        return <LookingForHigherContent />;
      case 'about-ma/testimonials':
        return <TestimonialsContent />;
      default:
        return <AboutContent />;
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
      {/* Sub-sidebar */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            About MA
          </Typography>
        </Box>
        <List disablePadding sx={{ py: 0.5 }}>
          {SUB_TABS.map((sub) => {
            const isActive = activeKey === sub.key;
            return (
              <ListItemButton
                key={sub.key}
                selected={isActive}
                onClick={() => handleSubTabClick(sub.key)}
                sx={{
                  py: 0.85,
                  px: 2,
                  mx: 0.5,
                  borderRadius: 1,
                  mb: 0.25,
                  transition: 'all 0.12s ease',
                  ...(isActive && {
                    backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                  }),
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }}>
                  {sub.icon}
                </ListItemIcon>
                <ListItemText
                  primary={sub.label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Sub-content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {renderSubContent()}
      </Box>
    </Box>
  );
}
