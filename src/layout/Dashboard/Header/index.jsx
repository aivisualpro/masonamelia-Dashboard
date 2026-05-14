'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// project imports
import HeaderContent from './HeaderContent';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  // Show back button on detail/edit pages
  const showBack = pathname.startsWith('/jets/edit') || pathname.startsWith('/jets/add');

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const navLinks = [
    { title: 'Jets', path: '/jets' },
    { title: 'Categories', path: '/jets-categories' },
    { title: 'Brands', path: '/brands' },
    { title: 'Teams', path: '/teams' },
    { title: 'Testimonials', path: '/testimonials' },
    { title: 'Contacts', path: '/contact' }
  ];

  const mainHeader = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, px: 2 }}>
      {/* Left: Logo + Nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Mason Amelia" style={{ height: 36, width: 'auto' }} />
        </Link>
        
        {!downLG && (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link key={link.title} href={link.path} style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2" 
                  color="text.primary" 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    transition: 'color 0.15s ease',
                    '&:hover': { 
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.title}
                </Typography>
              </Link>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Right: Add Aircraft + Theme + Logout */}
      {headerContent}
    </Box>
  );

  return (
    <AppBar 
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        flexShrink: 0,
        mb: 2,
      }}
    >
      {mainHeader}
    </AppBar>
  );
}
