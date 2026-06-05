'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useContact } from '@/api/hooks';

interface ContactInfo {
  _id?: string;
  email: string;
  address: string;
  phone?: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  cta_title: string;
  cta_text_white: string;
  cta_text_blue: string;
  cta_bg_image: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`;

const initialFormState: ContactInfo = {
  email: '',
  address: '',
  phone: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  cta_title: 'Get Started Today',
  cta_text_white: 'Ready to connect and acquire the',
  cta_text_blue: 'aircraft of your dreams?',
  cta_bg_image: '',
};

const fieldSx = (theme: any) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.text.disabled },
  },
});

export default function ContactTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { contact: rawContact, isLoading: loading, mutate: mutateContact } = useContact();
  const contact = rawContact as ContactInfo | null;
  const [formData, setFormData] = React.useState<ContactInfo>(initialFormState);
  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync SWR data into local form state when it arrives
  // Merge with defaults so undefined fields (like new cta_* fields) don't become uncontrolled
  React.useEffect(() => {
    if (contact) {
      setFormData({ ...initialFormState, ...contact });
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE}`, formData);
      if (res.data?.success) {
        setFormData(res.data.data);
        mutateContact();
        setNotification({ message: 'Contact information updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      setNotification({ message: 'Failed to update information', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Listen for header "Save Changes" button
  React.useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('save-contact', handler);
    return () => window.removeEventListener('save-contact', handler);
  });

  const handleCloseNotification = () => { setNotification(null); };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: '16px',
      }}>
        {/* Left: General Information */}
        <Paper elevation={0} sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: theme.palette.text.primary, mb: 2.5 }}>
            General Information
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              name="email"
              label="Public Email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{
                sx: { color: theme.palette.text.primary },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(theme)}
            />
            <TextField
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{
                sx: { color: theme.palette.text.primary },
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(theme)}
            />
            <TextField
              name="address"
              label="Headquarters Address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{
                sx: { color: theme.palette.text.primary },
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <BusinessIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(theme)}
            />
          </Stack>
        </Paper>

        {/* Right: Social Media Links */}
        <Paper elevation={0} sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: theme.palette.text.primary, mb: 2.5 }}>
            Social Media Links
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              name="facebook"
              label="Facebook URL"
              value={formData.facebook}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{
                sx: { color: theme.palette.text.primary },
                startAdornment: (
                  <InputAdornment position="start">
                    <FacebookIcon sx={{ fontSize: 18, color: '#1877F2' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(theme)}
            />
            <TextField
              name="instagram"
              label="Instagram URL"
              value={formData.instagram}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{
                sx: { color: theme.palette.text.primary },
                startAdornment: (
                  <InputAdornment position="start">
                    <InstagramIcon sx={{ fontSize: 18, color: '#E1306C' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(theme)}
            />
            <TextField
              name="linkedin"
              label="LinkedIn URL"
              value={formData.linkedin}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{
                sx: { color: theme.palette.text.primary },
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkedInIcon sx={{ fontSize: 18, color: '#0A66C2' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(theme)}
            />
            <TextField
              name="youtube"
              label="YouTube URL"
              value={formData.youtube}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{
                sx: { color: theme.palette.text.primary },
                startAdornment: (
                  <InputAdornment position="start">
                    <YouTubeIcon sx={{ fontSize: 18, color: '#FF0000' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(theme)}
            />
          </Stack>
        </Paper>
      </Box>

      {/* ── CTA Banner Editor — Inline Editable Preview ── */}
      <Paper elevation={0} sx={{
        p: 0,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        mt: 2,
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CampaignIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: theme.palette.text.primary }}>
              CTA Banner
            </Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>
              Click text to edit · Appears on every page
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <label htmlFor="cta-bg-upload-inline">
              <input
                id="cta-bg-upload-inline"
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  try {
                    const res = await axios.post('/api/upload', fd);
                    if (res.data?.url) {
                      setFormData(prev => ({ ...prev, cta_bg_image: res.data.url }));
                      setNotification({ message: 'Background image updated', type: 'success' });
                    }
                  } catch {
                    setNotification({ message: 'Upload failed', type: 'error' });
                  }
                }}
              />
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: theme.palette.text.secondary,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.15s',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 14 }} /> Change Background
              </Box>
            </label>
          </Box>
        </Box>

        {/* ── Website-exact layout: <section bg-[#111218] py-10> > <div container px-5> > card ── */}
        <Box sx={{
          backgroundColor: '#111218',
          py: '40px',
        }}>
          <Box sx={{
            maxWidth: '1280px',
            mx: 'auto',
            px: '20px',
          }}>
            {/* The actual CTA card — matches website rounded-[30px] */}
            <Box sx={{
              backgroundColor: '#111218',
              borderRadius: '30px',
              py: '40px',
              px: { xs: '16px', md: '24px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: 220,
              position: 'relative',
              ...(formData.cta_bg_image ? {
                backgroundImage: `url(${formData.cta_bg_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}),
            }}>
          {/* Editable Title */}
          <Box
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => { const t = (e.target as HTMLElement)?.textContent ?? ''; setFormData(prev => ({ ...prev, cta_title: t })); }}
            sx={{
              fontSize: 14,
              textTransform: 'uppercase',
              color: '#9ca3af',
              letterSpacing: '0.05em',
              mb: 1.5,
              outline: 'none',
              cursor: 'text',
              px: 1,
              py: 0.3,
              borderRadius: 0.5,
              transition: 'all 0.15s',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
              '&:focus': {
                backgroundColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.5)',
              },
            }}
          >
            {formData.cta_title || 'Get Started Today'}
          </Box>

          {/* Editable White Text */}
          <Box
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => { const t = (e.target as HTMLElement)?.textContent ?? ''; setFormData(prev => ({ ...prev, cta_text_white: t })); }}
            sx={{
              fontSize: { xs: '1.6rem', md: '2.25rem' },
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.4,
              outline: 'none',
              cursor: 'text',
              px: 1.5,
              py: 0.3,
              borderRadius: 0.5,
              transition: 'all 0.15s',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
              '&:focus': {
                backgroundColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.5)',
              },
            }}
          >
            {formData.cta_text_white || 'Ready to connect and acquire the'}
          </Box>

          {/* Editable Blue Text */}
          <Box
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => { const t = (e.target as HTMLElement)?.textContent ?? ''; setFormData(prev => ({ ...prev, cta_text_blue: t })); }}
            sx={{
              fontSize: { xs: '1.6rem', md: '2.25rem' },
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1777cb, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.4,
              outline: 'none',
              cursor: 'text',
              px: 1.5,
              py: 0.3,
              borderRadius: 0.5,
              transition: 'all 0.15s',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.06)',
                WebkitTextFillColor: 'transparent',
              },
              '&:focus': {
                backgroundColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.5)',
                WebkitTextFillColor: 'transparent',
              },
            }}
          >
            {formData.cta_text_blue || 'aircraft of your dreams?'}
          </Box>

          {/* Contact Us button (visual only) */}
          <Box sx={{
            mt: 3,
            px: 2.5,
            py: 1,
            borderRadius: 5,
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            pointerEvents: 'none',
          }}>
          Contact Us ↗
          </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification?.type || 'info'} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
