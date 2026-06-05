'use client';

import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';

export default function HomeTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ flex: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
          }}
        >
          <HomeIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
        </Box>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: theme.palette.text.primary }}>
          Home Page Content
        </Typography>
        <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, textAlign: 'center', maxWidth: 400 }}>
          Manage hero sections, featured content, and landing page elements that appear on the homepage of your website.
        </Typography>
      </Paper>
    </Box>
  );
}
