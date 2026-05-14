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
  InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
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
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`;

const initialFormState: ContactInfo = {
  email: '',
  address: '',
  phone: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  youtube: ''
};

const fieldSx = (theme: any) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.text.disabled },
  },
});

export default function ContactPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { contact: rawContact, isLoading: loading, mutate: mutateContact } = useContact();
  const contact = rawContact as ContactInfo | null;
  const [formData, setFormData] = React.useState<ContactInfo>(initialFormState);
  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync SWR data into local form state when it arrives
  React.useEffect(() => {
    if (contact) {
      setFormData(contact);
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
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
