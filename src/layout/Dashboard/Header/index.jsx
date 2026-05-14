'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, px: 2 }}>

      {/* Left: Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 1 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="Mason Amelia" width={120} height={36} priority style={{ height: 36, width: 'auto' }} />
        </Link>
      </Box>

      {/* Center: Nav — absolutely centered */}
      {!downLG && (
        <Box sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link key={link.title} href={link.path} style={{ textDecoration: 'none' }}>
                <Box sx={{
                  position: 'relative',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  // animated underline
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: isActive ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                    transformOrigin: 'center',
                    width: '70%',
                    height: '2px',
                    borderRadius: '2px 2px 0 0',
                    bgcolor: 'primary.main',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  '&:hover::after': {
                    transform: 'translateX(-50%) scaleX(1)',
                    opacity: isActive ? 1 : 0.4,
                  },
                }}>
                  <Typography sx={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    color: isActive ? 'primary.main' : 'text.primary',
                    transition: 'color 0.15s, font-weight 0.15s',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>
                    {link.title}
                  </Typography>
                </Box>
              </Link>
            );
          })}
        </Box>
      )}

      {/* Right: Actions */}
      <Box sx={{ flexShrink: 0, zIndex: 1 }}>
        {headerContent}
      </Box>
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

