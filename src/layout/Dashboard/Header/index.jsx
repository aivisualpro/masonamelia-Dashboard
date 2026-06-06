'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// project imports
import HeaderContent from './HeaderContent';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const navLinks = [
    { title: 'Aircraft', path: '/aircraft' },
    { title: 'Make', path: '/make' },
    { title: 'Content', path: '/content' },
    { title: 'Logo Ticker', path: '/logo-ticker' },
  ];

  const mainHeader = (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, px: 2 }}>

      {/* Left: Burger (mobile) + Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 1, gap: 1 }}>
        {/* Burger menu — visible only on mobile/tablet */}
        {downLG && (
          <IconButton
            onClick={toggleMobile}
            size="small"
            aria-label="open navigation menu"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}

        {/* Logo with hover swap */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              position: 'relative',
              width: 120,
              height: 36,
              '&:hover .logo-default': { opacity: 0 },
              '&:hover .logo-hover': { opacity: 1 },
            }}
          >
            {/* Default: White logo */}
            <Image
              className="logo-default"
              src="/logowhite.svg"
              alt="Mason Amelia"
              width={120}
              height={36}
              priority
              style={{
                height: 36,
                width: 120,
                position: 'absolute',
                top: 0,
                left: 0,
                transition: 'opacity 0.2s ease-in-out',
                opacity: 1,
              }}
            />
            {/* Hover: Colored logo */}
            <Image
              className="logo-hover"
              src="/logo.svg"
              alt="Mason Amelia"
              width={120}
              height={36}
              priority
              style={{
                height: 36,
                width: 120,
                position: 'absolute',
                top: 0,
                left: 0,
                transition: 'opacity 0.2s ease-in-out',
                opacity: 0,
              }}
            />
          </Box>
        </Link>
      </Box>

      {/* Center: Nav — absolutely centered (desktop only) */}
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
    <>
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

      {/* ── Mobile Navigation Drawer ── */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Link href="/dashboard" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src={isDark ? '/logowhite.svg' : '/logo.svg'}
              alt="Mason Amelia"
              width={100}
              height={30}
              style={{ height: 30, width: 'auto' }}
            />
          </Link>
          <IconButton onClick={closeMobile} size="small" aria-label="close menu">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Navigation Links */}
        <List sx={{ pt: 1, px: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <ListItemButton
                key={link.title}
                component={Link}
                href={link.path}
                onClick={closeMobile}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  py: 1,
                  px: 2,
                  transition: 'all 0.15s ease',
                  '&.Mui-selected': {
                    backgroundColor: isDark
                      ? 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)'
                      : 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                    '&:hover': {
                      backgroundColor: isDark
                        ? 'rgba(var(--mui-palette-primary-mainChannel) / 0.18)'
                        : 'rgba(var(--mui-palette-primary-mainChannel) / 0.14)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemText
                  primary={link.title}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      ml: 1,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
