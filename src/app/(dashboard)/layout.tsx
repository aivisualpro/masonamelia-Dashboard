'use client';

import { useEffect, useState } from 'react';

import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Header from '@/layout/Dashboard/Header';
import Loader from '@/components/Loader';

import { useGetMenuMaster } from '@/api/menu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { menuMasterLoading } = useGetMenuMaster();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Loader />;
  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', height: '100vh', overflow: 'hidden', p: 2, bgcolor: 'background.default' }}>
      <Header />

      <Box component="main" sx={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
