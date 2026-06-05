'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';

// Tabs
import HomeTab from './tabs/HomeTab';
import ShowroomTab from './tabs/ShowroomTab';
import ServicesTab from './tabs/ServicesTab';
import SkynetTab from './tabs/SkynetTab';
import AboutMATab from './tabs/AboutMATab';
import ContactTab from './tabs/ContactTab';

const TABS = [
  { key: 'home',      label: 'Home',      icon: <HomeIcon sx={{ fontSize: 18 }} /> },
  { key: 'showroom',  label: 'Showroom',  icon: <StorefrontIcon sx={{ fontSize: 18 }} /> },
  { key: 'services',  label: 'Services',  icon: <MiscellaneousServicesIcon sx={{ fontSize: 18 }} /> },
  { key: 'skynet',    label: 'Skynet',    icon: <RocketLaunchIcon sx={{ fontSize: 18 }} /> },
  { key: 'about-ma',  label: 'About MA',  icon: <InfoIcon sx={{ fontSize: 18 }} /> },
  { key: 'contact',   label: 'Contact',   icon: <ContactMailIcon sx={{ fontSize: 18 }} /> },
];

export default function ContentPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('tab') || 'home';
  // For sub-tabs (about-ma/testimonials, services/acquisition, etc.), match the parent
  const parentTab = currentTab.startsWith('about-ma') ? 'about-ma' : currentTab.startsWith('services') ? 'services' : currentTab;
  const tabIndex = Math.max(0, TABS.findIndex((t) => t.key === parentTab));

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    const tab = TABS[newIndex];
    router.push(`/content?tab=${tab.key}`, { scroll: false });
  };

  const renderTabContent = () => {
    switch (TABS[tabIndex]?.key) {
      case 'home':      return <HomeTab />;
      case 'showroom':  return <ShowroomTab />;
      case 'services':  return <ServicesTab currentTab={currentTab} />;
      case 'skynet':    return <SkynetTab />;
      case 'about-ma':  return <AboutMATab currentTab={currentTab} />;
      case 'contact':   return <ContactTab />;
      default:          return <HomeTab />;
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab Bar */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          borderRadius: '12px 12px 0 0',
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: 2.5,
              borderRadius: '2px 2px 0 0',
              backgroundColor: theme.palette.primary.main,
            },
            '& .MuiTabs-scrollButtons': {
              width: 32,
              color: theme.palette.text.secondary,
              '&.Mui-disabled': { opacity: 0.3 },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{
                minHeight: 44,
                textTransform: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
                px: 2,
                gap: 0.75,
                color: theme.palette.text.secondary,
                transition: 'color 0.15s ease',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
                '&:hover': {
                  color: theme.palette.text.primary,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
}
