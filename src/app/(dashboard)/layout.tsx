'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Drawer from '@/layout/Dashboard/Drawer';
import Header from '@/layout/Dashboard/Header';
import Footer from '@/layout/Dashboard/Footer';
import Loader from '@/components/Loader';
import Breadcrumbs from '@/components/@extended/Breadcrumbs';

import { handlerDrawerOpen, useGetMenuMaster } from '@/api/menu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // set media wise responsive drawer
  useEffect(() => {
    if (mounted) {
      handlerDrawerOpen(!downXL);
    }
  }, [downXL, mounted]);

  if (!mounted) return <Loader />;
  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Drawer />

      <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar sx={{ mt: 'inherit' }} />
        <Box
          sx={{
            ...{ px: { xs: 0, sm: 2 } },
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Breadcrumbs might need refactoring for Next.js */}
          <Breadcrumbs />
          {children}
          <footer id="footer" style={{ marginTop: 40 }}>
            <Footer />
          </footer>
        </Box>
      </Box>
    </Box>
  );
}
