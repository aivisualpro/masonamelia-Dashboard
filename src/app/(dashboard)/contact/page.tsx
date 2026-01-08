'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import axios from 'axios';

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

export default function ContactPage() {
  const [formData, setFormData] = React.useState<ContactInfo>(initialFormState);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchContact = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}`);
      if (res.data?.success && res.data?.data) {
        setFormData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE}`, formData);
      if (res.data?.success) {
        setFormData(res.data.data);
        setNotification({ message: 'Contact information updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      setNotification({ message: 'Failed to update information', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Company Contact Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              General Information
            </Typography>
            <Stack spacing={3}>
              <TextField
                name="email"
                label="Public Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="address"
                label="Headquarters Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Social Media Links
            </Typography>
            <Stack spacing={3}>
              <TextField
                name="facebook"
                label="Facebook URL"
                value={formData.facebook}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="instagram"
                label="Instagram URL"
                value={formData.instagram}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon sx={{ color: '#E1306C' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="linkedin"
                label="LinkedIn URL"
                value={formData.linkedin}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="youtube"
                label="YouTube URL"
                value={formData.youtube}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <YouTubeIcon color="error" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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
