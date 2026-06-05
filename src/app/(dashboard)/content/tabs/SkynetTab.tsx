'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useContact } from '@/api/hooks';

// ── Defaults matching model ──
const DEFAULTS = {
  hero_title_white: 'Mason Amelia Pricing Intelligence —',
  hero_title_blue: 'Powered by SkyNet',
  hero_desc: 'No guesswork. No lag. Real-time market intelligence that gives our clients the sharpest edge; Fast, factual, and unbeatable.',
  adv_title_white: 'Unlock',
  adv_title_blue: "SkyNet's Data Advantage",
  adv_desc: '\u201CHold on, John Connor!\u201D because Mason Amelia\u2019s proprietary aircraft pricing app, SkyNet, employs a proprietary means of collecting, analyzing, and presenting transaction data. With no MLS substitute, this private data is the lifeblood that empowers our buyers and sellers. Simply put, SkyNet ensures every decision is powered by data and backed by Mason Amelia\u2019s experience.',
  timeline_title_white: 'The Evolution of SkyNet:',
  timeline_title_blue: 'A Timeline of Innovation',
  timeline_items: [
    { year: '2023', description: 'Mason Amelia launches, relying on traditional, manual methods for aircraft data aggregation and analysis.', image: '' },
    { year: '2024', description: 'As the sales team grew, it became clear that shared spreadsheets and folders were insufficient to properly equip and align our brokers. We envisioned a purpose-built web and mobile platform and named it SkyNet.', image: '' },
    { year: '2025', description: 'SkyNet is deployed. Secure, fast, and built by aviation experts, it quickly becomes the backbone of our brokers\u2019 pricing, market insight, and decision-making.', image: '' },
    { year: '2026', description: 'SkyNet continues to evolve, integrating predictive analytics and early AI-driven learning to deliver even more accurate forecasting, smarter pricing strategy, and enhanced deal preparation.', image: '' },
  ],
};

interface TimelineItem {
  year: string;
  description: string;
  image: string;
}

export default function SkynetTab() {
  const theme = useTheme();
  const { contact, mutate: mutateContact } = useContact();

  // ── Hero ──
  const [heroTitleWhite, setHeroTitleWhite] = React.useState(DEFAULTS.hero_title_white);
  const [heroTitleBlue, setHeroTitleBlue] = React.useState(DEFAULTS.hero_title_blue);
  const [heroDesc, setHeroDesc] = React.useState(DEFAULTS.hero_desc);
  const [heroBgImage, setHeroBgImage] = React.useState('');

  // ── Advantage ──
  const [advTitleWhite, setAdvTitleWhite] = React.useState(DEFAULTS.adv_title_white);
  const [advTitleBlue, setAdvTitleBlue] = React.useState(DEFAULTS.adv_title_blue);
  const [advDesc, setAdvDesc] = React.useState(DEFAULTS.adv_desc);

  // ── Timeline ──
  const [timelineTitleWhite, setTimelineTitleWhite] = React.useState(DEFAULTS.timeline_title_white);
  const [timelineTitleBlue, setTimelineTitleBlue] = React.useState(DEFAULTS.timeline_title_blue);
  const [timelineItems, setTimelineItems] = React.useState<TimelineItem[]>(DEFAULTS.timeline_items);

  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Sync from API ──
  React.useEffect(() => {
    if (contact) {
      setHeroTitleWhite(contact.skynet_hero_title_white || DEFAULTS.hero_title_white);
      setHeroTitleBlue(contact.skynet_hero_title_blue || DEFAULTS.hero_title_blue);
      setHeroDesc(contact.skynet_hero_description || DEFAULTS.hero_desc);
      setHeroBgImage(contact.skynet_hero_bg_image || '');
      setAdvTitleWhite(contact.skynet_advantage_title_white || DEFAULTS.adv_title_white);
      setAdvTitleBlue(contact.skynet_advantage_title_blue || DEFAULTS.adv_title_blue);
      setAdvDesc(contact.skynet_advantage_description || DEFAULTS.adv_desc);
      setTimelineTitleWhite(contact.skynet_timeline_title_white || DEFAULTS.timeline_title_white);
      setTimelineTitleBlue(contact.skynet_timeline_title_blue || DEFAULTS.timeline_title_blue);
      if (contact.skynet_timeline_items?.length) setTimelineItems(contact.skynet_timeline_items);
    }
  }, [contact]);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        skynet_hero_title_white: heroTitleWhite,
        skynet_hero_title_blue: heroTitleBlue,
        skynet_hero_description: heroDesc,
        skynet_hero_bg_image: heroBgImage,
        skynet_advantage_title_white: advTitleWhite,
        skynet_advantage_title_blue: advTitleBlue,
        skynet_advantage_description: advDesc,
        skynet_timeline_title_white: timelineTitleWhite,
        skynet_timeline_title_blue: timelineTitleBlue,
        skynet_timeline_items: timelineItems,
      });
      mutateContact();
      setNotification({ message: 'All Skynet content saved', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Upload handler ──
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd);
      if (res.data?.url) {
        setHeroBgImage(res.data.url);
        setNotification({ message: 'Background image updated', type: 'success' });
      }
    } catch {
      setNotification({ message: 'Upload failed', type: 'error' });
    }
  };

  // ── Timeline helpers ──
  const updateTimelineItem = (idx: number, field: 'year' | 'description' | 'image', value: string) => {
    setTimelineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };
  const addTimelineItem = () => setTimelineItems((prev) => [...prev, { year: '', description: '', image: '' }]);
  const removeTimelineItem = (idx: number) => setTimelineItems((prev) => prev.filter((_, i) => i !== idx));

  // ── Timeline image upload ──
  const handleTimelineImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd);
      if (res.data?.url) {
        updateTimelineItem(idx, 'image', res.data.url);
        setNotification({ message: `Image updated for ${timelineItems[idx]?.year || 'entry'}`, type: 'success' });
      }
    } catch {
      setNotification({ message: 'Image upload failed', type: 'error' });
    }
  };

  // ── Editable box helper ──
  const EditableBox = ({ value, onUpdate, sx: sxOverride = {} }: { value: string; onUpdate: (v: string) => void; sx?: Record<string, any> }) => (
    <Box
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onUpdate((e.target as HTMLElement)?.textContent ?? '')}
      sx={{
        outline: 'none', cursor: 'text', px: 1, py: 0.3, borderRadius: 0.5,
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        '&:focus': { backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(38,138,224,0.4)' },
        ...sxOverride,
      }}
    >
      {value}
    </Box>
  );

  // Shared toolbar style
  const toolbarSx = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}`,
  };

  return (
    <>
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>Hero Section · Skynet Page</Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>Click text to edit · Background image controllable</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <label htmlFor="skynet-hero-bg-upload">
              <input id="skynet-hero-bg-upload" type="file" accept="image/*" hidden onChange={handleUpload} />
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
              {saving ? 'Saving...' : 'Save All'}
            </Button>
          </Box>
        </Box>

        {/* Hero Preview — matches website SkynetPage hero */}
        <Box sx={{ position: 'relative', width: '100%', minHeight: '45vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {/* Background */}
          <Box sx={{
            position: 'absolute', inset: 0, zIndex: 0,
            ...(heroBgImage ? { backgroundImage: `url(${heroBgImage})`, backgroundSize: 'cover', backgroundPosition: '60% 50%' } : { backgroundColor: '#15161c' }),
          }} />
          {/* Gradient overlay — lighter than website so bg image is visible in dashboard preview */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(to right, rgba(21,22,28,0.85) 25%, rgba(21,22,28,0.4) 60%, rgba(21,22,28,0.25))' }} />

          {/* Content — website: <div class="container px-8 pt-[50px] h-screen flex flex-col justify-center"> */}
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1280px', mx: 'auto', px: '32px', py: '50px' }}>
            {/* Title white — website: text-[3rem] font-bold max-w-2xl */}
            <EditableBox value={heroTitleWhite} onUpdate={setHeroTitleWhite} sx={{
              fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, maxWidth: '700px',
            }} />
            {/* Title blue gradient */}
            <EditableBox value={heroTitleBlue} onUpdate={setHeroTitleBlue} sx={{
              fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, maxWidth: '700px',
              background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }} />
            {/* Description — website: max-w-xl text-xl text-[#b5b5b5a4] */}
            <EditableBox value={heroDesc} onUpdate={setHeroDesc} sx={{
              fontSize: '1.25rem', color: 'rgba(181,181,181,0.64)', mt: '16px', maxWidth: '570px', lineHeight: 1.6,
            }} />
          </Box>
        </Box>
      </Paper>

      {/* ═══════════════════ ADVANTAGE SECTION ═══════════════════ */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>Data Advantage Section · Skynet Page</Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>Click text to edit</Typography>
          </Box>
        </Box>

        {/* Advantage Preview — website: bg-[#15161c] py-20 text-center */}
        <Box sx={{ backgroundColor: '#15161c', py: '60px', px: '80px', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <EditableBox value={advTitleWhite} onUpdate={setAdvTitleWhite} sx={{
              fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, display: 'inline',
            }} />
            <EditableBox value={advTitleBlue} onUpdate={setAdvTitleBlue} sx={{
              fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, display: 'inline',
              background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }} />
          </Box>
          <EditableBox value={advDesc} onUpdate={setAdvDesc} sx={{
            fontSize: '1.125rem', color: 'rgb(156,163,175)', mt: '40px', lineHeight: 1.7, textAlign: 'center',
          }} />
        </Box>
      </Paper>

      {/* ═══════════════════ TIMELINE SECTION ═══════════════════ */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>Timeline Section · Skynet Page</Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>Edit year and description for each timeline entry</Typography>
          </Box>
          <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addTimelineItem}
            sx={{ textTransform: 'none', fontSize: 12, fontWeight: 500 }}>
            Add Entry
          </Button>
        </Box>

        {/* Timeline Preview — website: bg-white, centered title, vertical timeline */}
        <Box sx={{ backgroundColor: '#fff', pt: '40px', pb: '30px', px: '20px' }}>
          {/* Title */}
          <Box sx={{ textAlign: 'center', mb: '40px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#111', lineHeight: 1.1 }}>
                {timelineTitleWhite}{' '}
              </Typography>
              <Typography
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setTimelineTitleBlue((e.target as HTMLElement)?.textContent ?? '')}
                sx={{
                  fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1,
                  background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  outline: 'none', cursor: 'text',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.03)' },
                  '&:focus': { backgroundColor: 'rgba(0,0,0,0.05)', boxShadow: '0 0 0 1px rgba(38,138,224,0.4)' },
                }}
              >
                {timelineTitleBlue}
              </Typography>
            </Box>
          </Box>

          {/* Timeline items */}
          <Box sx={{ maxWidth: '900px', mx: 'auto', position: 'relative' }}>
            {/* Vertical line */}
            <Box sx={{ position: 'absolute', left: '30px', top: 0, bottom: 0, width: '2px', backgroundColor: '#e5e7eb' }} />

            {timelineItems.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 3, position: 'relative' }}>
                {/* Year pill */}
                <Box sx={{
                  width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#fff', border: '2px solid #1777cb', zIndex: 1,
                }}>
                  <TextField
                    variant="standard"
                    value={item.year}
                    onChange={(e) => updateTimelineItem(idx, 'year', e.target.value)}
                    inputProps={{ style: { textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#1777cb' } }}
                    sx={{ width: '50px', '& .MuiInput-underline:before': { display: 'none' }, '& .MuiInput-underline:after': { display: 'none' } }}
                  />
                </Box>
                {/* Description + Image */}
                <Box sx={{ flex: 1, py: 1 }}>
                  <TextField
                    fullWidth multiline variant="outlined" size="small"
                    value={item.description}
                    onChange={(e) => updateTimelineItem(idx, 'description', e.target.value)}
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.7,
                        '& fieldset': { borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#1777cb' },
                      },
                    }}
                  />
                  {/* Image thumbnail + upload */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {item.image ? (
                      <Box
                        component="img"
                        src={item.image}
                        alt={`Timeline ${item.year}`}
                        sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid #e5e7eb' }}
                      />
                    ) : (
                      <Box sx={{
                        width: 120, height: 80, borderRadius: 1, border: '1px dashed #ccc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#f9fafb', fontSize: 11, color: '#999',
                      }}>
                        No image
                      </Box>
                    )}
                    <label htmlFor={`timeline-img-${idx}`}>
                      <input id={`timeline-img-${idx}`} type="file" accept="image/*" hidden onChange={(e) => handleTimelineImageUpload(idx, e)} />
                      <Box component="span" sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                        px: 1.5, py: 0.5, borderRadius: 1, fontSize: 11, fontWeight: 500,
                        cursor: 'pointer', color: '#666', border: '1px solid #e5e7eb', transition: 'all 0.15s',
                        '&:hover': { color: '#1777cb', borderColor: '#1777cb' },
                      }}>
                        <CloudUploadIcon sx={{ fontSize: 13 }} /> {item.image ? 'Change' : 'Upload'}
                      </Box>
                    </label>
                  </Box>
                </Box>
                {/* Delete */}
                {timelineItems.length > 1 && (
                  <IconButton size="small" onClick={() => removeTimelineItem(idx)} sx={{ alignSelf: 'flex-start', mt: 1, color: theme.palette.error.main }}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* ── Notification ── */}
      <Snackbar open={!!notification} autoHideDuration={3000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification?.type || 'success'} variant="filled" onClose={() => setNotification(null)}>{notification?.message}</Alert>
      </Snackbar>
    </>
  );
}
