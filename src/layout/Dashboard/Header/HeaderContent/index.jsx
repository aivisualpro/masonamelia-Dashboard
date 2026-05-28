'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useRouter, usePathname } from 'next/navigation';
import { useContext } from 'react';
import Link from 'next/link';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import { ThemeModeContext } from '@/themes/index';

const BTN_SX = {
  borderRadius: 1,
  px: 2,
  height: 34,
  textTransform: 'none',
  fontSize: '0.8125rem',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': { boxShadow: 'none' },
};

export default function HeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { mode, toggleMode } = useContext(ThemeModeContext);
  const isDark = mode === 'dark';

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  // Route-specific action buttons
  const showAddAircraft = pathname === '/aircraft';
  const showAddCategory = pathname === '/make';
  const showBack = pathname.startsWith('/aircraft/edit') || pathname.startsWith('/aircraft/add');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

      {/* Back button on detail pages */}
      {showBack && (
        <IconButton
          onClick={() => router.push('/aircraft')}
          size="small"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            width: 34,
            height: 34,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      {/* Route-specific: Add Aircraft only on /aircrafts */}
      {showAddAircraft && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={BTN_SX}
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-aircraft'))}
        >
          Add Aircraft
        </Button>
      )}

      {/* Route-specific: Add Category only on /make */}
      {showAddCategory && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={BTN_SX}
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-category'))}
        >
          Add Category
        </Button>
      )}

      {/* Route-specific: Add Brand only on /logo-ticker */}
      {pathname === '/logo-ticker' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={BTN_SX}
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-brand'))}
        >
          Add Brand
        </Button>
      )}

      {/* Route-specific: Add Member only on /team */}
      {pathname === '/team' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={BTN_SX}
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-member'))}
        >
          Add Member
        </Button>
      )}

      {/* Route-specific: Add Testimonial only on /testimonials */}
      {pathname === '/testimonials' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={BTN_SX}
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-testimonial'))}
        >
          Add Testimonial
        </Button>
      )}

      {/* Route-specific: Save Changes only on /contact-info */}
      {pathname === '/contact-info' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          sx={BTN_SX}
          onClick={() => window.dispatchEvent(new CustomEvent('save-contact'))}
        >
          Save Changes
        </Button>
      )}

      {/* Theme toggle — always visible */}
      <IconButton
        onClick={toggleMode}
        size="small"
        aria-label="toggle theme"
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: isDark ? '#facc15' : '#6b7280',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          },
        }}
      >
        {isDark
          ? <LightModeIcon sx={{ fontSize: 18, color: '#facc15' }} />
          : <DarkModeIcon sx={{ fontSize: 18, color: '#374151' }} />
        }
      </IconButton>

      {/* Logout */}
      <Button
        variant="contained"
        color="error"
        onClick={handleLogout}
        startIcon={<LogoutOutlinedIcon />}
        sx={BTN_SX}
      >
        Logout
      </Button>
    </Box>
  );
}
