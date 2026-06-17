'use client';

import * as React from 'react';
import {
  Box, Paper, Typography, Snackbar, Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useContact } from '@/api/hooks';

const DEFAULTS = {
  hero_title_white: 'Where Precision',
  hero_title_blue: 'Meets Passion',
  hero_description: 'We curate an exclusive collection of high-performance piston and owner-flown turbine aircraft, each one selected to satisfy the most discerning aviators.',
};

export default function ShowroomTab() {
  const theme = useTheme();
  const { contact, mutate: mutateContact } = useContact();

  // ── Hero ──
  const [heroTitleWhite, setHeroTitleWhite] = React.useState(DEFAULTS.hero_title_white);
  const [heroTitleBlue, setHeroTitleBlue] = React.useState(DEFAULTS.hero_title_blue);
  const [heroDesc, setHeroDesc] = React.useState(DEFAULTS.hero_description);
  const [heroBg, setHeroBg] = React.useState('');

  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Load from DB ──
  React.useEffect(() => {
    if (!contact) return;
    setHeroTitleWhite(contact.showroom_hero_title_white || DEFAULTS.hero_title_white);
    setHeroTitleBlue(contact.showroom_hero_title_blue || DEFAULTS.hero_title_blue);
    setHeroDesc(contact.showroom_hero_description || DEFAULTS.hero_description);
    setHeroBg(contact.showroom_hero_bg_image || '');
  }, [contact]);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        showroom_hero_title_white: heroTitleWhite,
        showroom_hero_title_blue: heroTitleBlue,
        showroom_hero_description: heroDesc,
        showroom_hero_bg_image: heroBg,
      });
      mutateContact();
      setNotification({ message: 'Showroom page saved', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd);
      if (res.data?.url) { setHeroBg(res.data.url); setNotification({ message: 'Background updated', type: 'success' }); }
    } catch { setNotification({ message: 'Upload failed', type: 'error' }); }
  };

  // ── Editable Box ──
  const EditableBox = ({ value, onUpdate, sx: sxOverride = {} }: { value: string; onUpdate: (v: string) => void; sx?: Record<string, any> }) => (
    <Box contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate((e.target as HTMLElement)?.innerText ?? '')}
      sx={{ outline: 'none', cursor: 'text', px: 1, py: 0.3, borderRadius: 0.5, transition: 'background-color 0.15s', whiteSpace: 'pre-line',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        '&:focus': { backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(38,138,224,0.4)' },
        ...sxOverride,
      }}>{value}</Box>
  );

  const toolbarSx = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}`,
  };

  const sectionLabel = (text: string, hint?: string) => (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>{text}</Typography>
      {hint && <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>{hint}</Typography>}
    </Box>
  );

  // Listen for header "Save Changes" button
  React.useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('save-contact', handler);
    return () => window.removeEventListener('save-contact', handler);
  });

  return (
    <>
      {/* ─── HERO SECTION ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Hero Section · Showroom Page', 'Click text to edit · Background image controllable')}
          <label htmlFor="showroom-hero-bg-upload">
            <input id="showroom-hero-bg-upload" type="file" accept="image/*" hidden onChange={handleBgUpload} />
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 500, cursor: 'pointer', color: theme.palette.text.secondary, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s', '&:hover': { color: theme.palette.primary.main, borderColor: theme.palette.primary.main } }}>
              <CloudUploadIcon sx={{ fontSize: 14 }} /> Change Background
            </Box>
          </label>
        </Box>
        <Box sx={{ position: 'relative', width: '100%', minHeight: '45vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${heroBg || '/images/showroom/bannerTwo.webp'})`, backgroundSize: 'cover', backgroundPosition: '60% 50%' }} />
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(to right, rgba(21,22,28,0.85) 25%, rgba(21,22,28,0.4) 60%, rgba(21,22,28,0.25))' }} />
          {!heroBg && (
            <label htmlFor="showroom-hero-bg-upload" style={{ position: 'absolute', top: 16, right: 16, zIndex: 3, cursor: 'pointer' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, px: 3, py: 2, borderRadius: 2, border: '2px dashed rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.04)', transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(38,138,224,0.6)', backgroundColor: 'rgba(38,138,224,0.08)' } }}>
                <CloudUploadIcon sx={{ fontSize: 24, color: 'rgba(255,255,255,0.3)' }} />
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Upload Background Image</Typography>
              </Box>
            </label>
          )}
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, mx: 'auto', px: '32px', py: '40px' }}>
            <EditableBox value={heroTitleWhite} onUpdate={setHeroTitleWhite} sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, display: 'inline' }} />
            <EditableBox value={heroTitleBlue} onUpdate={setHeroTitleBlue} sx={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1, background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
            <EditableBox value={heroDesc} onUpdate={setHeroDesc} sx={{ fontSize: '1.1rem', color: 'rgba(181,181,181,0.64)', mt: '12px', maxWidth: '500px', lineHeight: 1.6 }} />
          </Box>
        </Box>
      </Paper>

      <Snackbar open={!!notification} autoHideDuration={3000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification?.type || 'success'} variant="filled" onClose={() => setNotification(null)}>{notification?.message}</Alert>
      </Snackbar>
    </>
  );
}
