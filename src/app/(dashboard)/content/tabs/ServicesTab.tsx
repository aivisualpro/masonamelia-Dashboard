'use client';

import * as React from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import FlightIcon from '@mui/icons-material/Flight';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShieldIcon from '@mui/icons-material/Shield';

import AcquisitionContent from './services/AcquisitionContent';
import BrokerageContent from './services/BrokerageContent';
import InsuranceContent from './services/InsuranceContent';

const SUB_TABS = [
  { key: 'services/acquisition', label: 'Acquisition',  icon: <FlightIcon sx={{ fontSize: 18 }} /> },
  { key: 'services/brokerage',   label: 'Brokerage',    icon: <StorefrontIcon sx={{ fontSize: 18 }} /> },
  { key: 'services/insurance',   label: 'Insurance',    icon: <ShieldIcon sx={{ fontSize: 18 }} /> },
];

interface ServicesTabProps {
  currentTab: string;
}

export default function ServicesTab({ currentTab }: ServicesTabProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const activeKey = currentTab === 'services' ? 'services/acquisition' : currentTab;

  React.useEffect(() => {
    if (currentTab === 'services') {
      router.replace('/content?tab=services/acquisition', { scroll: false });
    }
  }, [currentTab, router]);

  const handleSubTabClick = (key: string) => {
    router.push(`/content?tab=${key}`, { scroll: false });
  };

  const renderSubContent = () => {
    switch (activeKey) {
      case 'services/acquisition': return <AcquisitionContent />;
      case 'services/brokerage':   return <BrokerageContent />;
      case 'services/insurance':   return <InsuranceContent />;
      default:                     return <AcquisitionContent />;
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
          position: 'sticky',
          top: 16,
          alignSelf: 'flex-start',
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Services
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
