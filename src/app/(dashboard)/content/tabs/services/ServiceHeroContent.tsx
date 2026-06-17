'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useContact } from '@/api/hooks';

interface ServiceHeroContentProps {
  /** Field prefix in Contact model, e.g. 'acquisition', 'brokerage', 'insurance' */
  prefix: string;
  /** Section label shown in the toolbar */
  label: string;
  /** Default values matching the Contact schema */
  defaults: {
    titleWhite: string;
    titleBlue: string;
    description: string;
  };
}

export default function ServiceHeroContent({ prefix, label, defaults }: ServiceHeroContentProps) {
  const theme = useTheme();
  const { contact, mutate: mutateContact } = useContact();

  const [titleWhite, setTitleWhite] = React.useState(defaults.titleWhite);
  const [titleBlue, setTitleBlue] = React.useState(defaults.titleBlue);
  const [description, setDescription] = React.useState(defaults.description);
  const [bgImage, setBgImage] = React.useState('');

  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (contact) {
      setTitleWhite(contact[`${prefix}_hero_title_white`] || defaults.titleWhite);
      setTitleBlue(contact[`${prefix}_hero_title_blue`] || defaults.titleBlue);
      setDescription(contact[`${prefix}_hero_description`] || defaults.description);
      setBgImage(contact[`${prefix}_hero_bg_image`] || '');
    }
  }, [contact, prefix]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        [`${prefix}_hero_title_white`]: titleWhite,
        [`${prefix}_hero_title_blue`]: titleBlue,
        [`${prefix}_hero_description`]: description,
        [`${prefix}_hero_bg_image`]: bgImage,
      });
      mutateContact();
      setNotification({ message: `${label} hero saved`, type: 'success' });
    } catch {
      setNotification({ message: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd);
      if (res.data?.url) {
        setBgImage(res.data.url);
        setNotification({ message: 'Background image updated', type: 'success' });
      }
    } catch {
      setNotification({ message: 'Upload failed', type: 'error' });
    }
  };

  const EditableBox = ({ value, onUpdate, sx: sxOverride = {} }: { value: string; onUpdate: (v: string) => void; sx?: Record<string, any> }) => (
    <Box
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onUpdate((e.target as HTMLElement)?.innerText ?? '')}
      sx={{
        outline: 'none', cursor: 'text', px: 1, py: 0.3, borderRadius: 0.5,
        transition: 'background-color 0.15s', whiteSpace: 'pre-line',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        '&:focus': { backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(38,138,224,0.4)' },
        ...sxOverride,
      }}
    >
      {value}
    </Box>
  );

  const toolbarSx = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}`,
  };

  return (
    <>
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>Hero Section · {label} Page</Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>Click text to edit · Background image controllable</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <label htmlFor={`${prefix}-hero-bg-upload`}>
              <input id={`${prefix}-hero-bg-upload`} type="file" accept="image/*" hidden onChange={handleUpload} />
              <Box component="span" sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', color: theme.palette.text.secondary, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s',
                '&:hover': { color: theme.palette.primary.main, borderColor: theme.palette.primary.main },
              }}>
                <CloudUploadIcon sx={{ fontSize: 14 }} /> Change Background
              </Box>
            </label>
            <Button variant="contained" size="small" startIcon={<SaveIcon sx={{ fontSize: 14 }} />} onClick={handleSave} disabled={saving}
              sx={{ textTransform: 'none', fontSize: 12, fontWeight: 500, borderRadius: 1.5, py: 0.5 }}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>

        {/* Hero Preview */}
        <Box sx={{ position: 'relative', width: '100%', minHeight: '45vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {/* Background */}
          <Box sx={{
            position: 'absolute', inset: 0, zIndex: 0,
            ...(bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: '60% 50%' } : { backgroundColor: '#15161c' }),
          }} />
          {/* Gradient overlay */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(to right, rgba(21,22,28,0.85) 25%, rgba(21,22,28,0.4) 60%, rgba(21,22,28,0.25))' }} />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1280px', mx: 'auto', px: '32px', py: '50px' }}>
            <EditableBox value={titleWhite} onUpdate={setTitleWhite} sx={{
              fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, maxWidth: '700px', display: 'inline',
            }} />
            <EditableBox value={titleBlue} onUpdate={setTitleBlue} sx={{
              fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, maxWidth: '700px',
              background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }} />
            <EditableBox value={description} onUpdate={setDescription} sx={{
              fontSize: '1.25rem', color: 'rgba(181,181,181,0.64)', mt: '16px', maxWidth: '570px', lineHeight: 1.6,
            }} />
          </Box>
        </Box>
      </Paper>

      <Snackbar open={!!notification} autoHideDuration={3000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification?.type || 'success'} variant="filled" onClose={() => setNotification(null)}>{notification?.message}</Alert>
      </Snackbar>
    </>
  );
}
