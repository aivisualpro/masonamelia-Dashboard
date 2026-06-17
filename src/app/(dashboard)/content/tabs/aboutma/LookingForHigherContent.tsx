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

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useContact } from '@/api/hooks';

// ── Default values (match model schema) ──
const DEFAULTS = {
  hero_title_white: "We're More Than Brokers —",
  hero_title_blue: "We're Storytellers",
  hero_desc: "If Your Broker Isn't Crafting a Marketing Plan as Compelling as the Aircraft Itself, They're Not Truly Selling It",
  vision_title: 'Looking for Higher on YouTube',
  vision_subtitle: "When you partner with Mason Amelia, you're not just getting a brokerage—you're getting a full-service, marketing-driven strategy to maximize visibility and find the right buyer.",
  vision_body1: "At Mason Amelia, we're more than brokers; we're storytellers. While there are many brokers out there, few live truer to the aviation lifestyle than our founder, Jesse Adams, who started the YouTube channel, Looking for Higher, which now serves as Mason Amelia's video marketing platform. On the channel, you will find insights on the true experience of aircraft ownership from transitioning into a turbine to the freedom of flying family across the country.",
  vision_body2: "Every video we create tells the unique story of each aircraft we represent, bringing its personality and capabilities to life in ways that resonate with prospective buyers. This storytelling approach is powerful and essential in today's market, where a listing alone doesn't cut it. If Your Broker Isn't Crafting a Marketing Plan as Compelling as the Aircraft Itself, They're Not Truly Selling It",
};

export default function LookingForHigherContent() {
  const theme = useTheme();
  const { contact, mutate: mutateContact } = useContact();

  // ── State ──
  const [heroTitleWhite, setHeroTitleWhite] = React.useState(DEFAULTS.hero_title_white);
  const [heroTitleBlue, setHeroTitleBlue] = React.useState(DEFAULTS.hero_title_blue);
  const [heroDesc, setHeroDesc] = React.useState(DEFAULTS.hero_desc);
  const [heroBgImage, setHeroBgImage] = React.useState('');
  const [visionTitle, setVisionTitle] = React.useState(DEFAULTS.vision_title);
  const [visionSubtitle, setVisionSubtitle] = React.useState(DEFAULTS.vision_subtitle);
  const [visionBody1, setVisionBody1] = React.useState(DEFAULTS.vision_body1);
  const [visionBody2, setVisionBody2] = React.useState(DEFAULTS.vision_body2);

  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Sync from API ──
  React.useEffect(() => {
    if (contact) {
      setHeroTitleWhite(contact.higher_hero_title_white || DEFAULTS.hero_title_white);
      setHeroTitleBlue(contact.higher_hero_title_blue || DEFAULTS.hero_title_blue);
      setHeroDesc(contact.higher_hero_description || DEFAULTS.hero_desc);
      setHeroBgImage(contact.higher_hero_bg_image || '');
      setVisionTitle(contact.higher_vision_title || DEFAULTS.vision_title);
      setVisionSubtitle(contact.higher_vision_subtitle || DEFAULTS.vision_subtitle);
      setVisionBody1(contact.higher_vision_body1 || DEFAULTS.vision_body1);
      setVisionBody2(contact.higher_vision_body2 || DEFAULTS.vision_body2);
    }
  }, [contact]);

  // Listen for header "Save Changes" button
  React.useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('save-contact', handler);
    return () => window.removeEventListener('save-contact', handler);
  });

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        higher_hero_title_white: heroTitleWhite,
        higher_hero_title_blue: heroTitleBlue,
        higher_hero_description: heroDesc,
        higher_hero_bg_image: heroBgImage,
        higher_vision_title: visionTitle,
        higher_vision_subtitle: visionSubtitle,
        higher_vision_body1: visionBody1,
        higher_vision_body2: visionBody2,
      });
      mutateContact();
      setNotification({ message: 'All changes saved', type: 'success' });
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

  // ── Editable box helper ──
  const EditableBox = ({
    value,
    onUpdate,
    sx: sxOverride = {},
  }: {
    value: string;
    onUpdate: (v: string) => void;
    sx?: Record<string, any>;
  }) => (
    <Box
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onUpdate((e.target as HTMLElement)?.innerText ?? '')}
      sx={{
        outline: 'none',
        cursor: 'text',
        px: 1,
        py: 0.3,
        borderRadius: 0.5,
        transition: 'background-color 0.15s', whiteSpace: 'pre-line',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        '&:focus': {
          backgroundColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 0 0 1px rgba(38,138,224,0.4)',
        },
        ...sxOverride,
      }}
    >
      {value}
    </Box>
  );

  return (
    <>
      {/* ── HERO SECTION ── */}
      <Paper elevation={0} sx={{
        p: 0, borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        mb: 2, overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>
              Hero Section · Higher Page
            </Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>
              Click text to edit · Background image controllable
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <label htmlFor="higher-hero-bg-upload">
              <input id="higher-hero-bg-upload" type="file" accept="image/*" hidden onChange={handleUpload} />
              <Box component="span" sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s',
                '&:hover': { color: theme.palette.primary.main, borderColor: theme.palette.primary.main },
              }}>
                <CloudUploadIcon sx={{ fontSize: 14 }} /> Change Background
              </Box>
            </label>
          </Box>
        </Box>

        {/* Hero Preview — matches website HigherPage hero exactly */}
        {/* Website: <section class="sticky top-0 w-full bg-cover h-screen relative overflow-hidden"> */}
        <Box sx={{
          position: 'relative', width: '100%', minHeight: '45vh',
          display: 'flex', alignItems: 'center', overflow: 'hidden',
        }}>
          {/* Background image — website uses linear-gradient overlay + bgPlaneTwo */}
          <Box sx={{
            position: 'absolute', inset: 0, zIndex: 0,
            ...(heroBgImage ? {
              backgroundImage: `linear-gradient(to right, rgba(21,22,28,1) 30%, rgba(0,0,0,0.05)), url(${heroBgImage})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            } : {
              backgroundColor: '#15161c',
            }),
          }} />

          {/* Website: <div class="absolute inset-0 bg-black opacity-50 z-[-1]"> */}
          <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 0 }} />

          {/* Website: <div class="container"> <Higher /> → <div class="pt-[132px] pb-0 px-2 text-white text-start"> */}
          <Box sx={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: '1280px', mx: 'auto',
            px: '20px',
            pt: '60px', pb: '40px', // scaled from pt-[132px]
          }}>
            {/* Title — Website: text-[3rem] xl:text-[3.5rem] max-w-2xl, lineHeight 1.1 */}
            <EditableBox
              value={heroTitleWhite}
              onUpdate={setHeroTitleWhite}
              sx={{
                fontSize: '3rem', fontWeight: 400, color: '#fff',
                lineHeight: 1.1, maxWidth: '700px',
                fontFamily: "'Inter Tight', sans-serif",
                display: 'inline',
              }}
            />
            <br />
            {/* Blue gradient text */}
            <EditableBox
              value={heroTitleBlue}
              onUpdate={setHeroTitleBlue}
              sx={{
                fontSize: '3rem', fontWeight: 400,
                lineHeight: 1.1, maxWidth: '700px',
                fontFamily: "'Inter Tight', sans-serif",
                background: 'linear-gradient(to right, #1777cb, #278AE0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
                mt: 0,
              }}
            />

            {/* Description — Website: max-w-xl, text-xl, text-[#b5b5b5a4] */}
            <EditableBox
              value={heroDesc}
              onUpdate={setHeroDesc}
              sx={{
                fontSize: '1.25rem', color: 'rgba(181,181,181,0.64)',
                mt: '16px', maxWidth: '570px', lineHeight: 1.6,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* ── VISION SECTION ── */}
      <Paper elevation={0} sx={{
        p: 0, borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        mb: 2, overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>
              Vision Section · Higher Page
            </Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>
              Click text to edit
            </Typography>
          </Box>
        </Box>

        {/* Vision Preview — matches website Vision/GlowingCardSection */}
        {/* Website: <section class="py-24 relative min-h-screen flex items-center justify-center"> */}
        <Box sx={{
          position: 'relative', backgroundColor: '#000',
          py: '60px', px: '20px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', minHeight: '40vh',
        }}>
          {/* Gradient overlays */}
          <Box sx={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: 'linear-gradient(to top, #000, transparent, #000)',
          }} />

          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1100px', mx: 'auto' }}>
            {/* Website: <h2 class="text-[56px] font-bold mb-4"> Looking for <i>Higher</i> on <span class="text-[#FF0000]">YouTube</span> */}
            <EditableBox
              value={visionTitle}
              onUpdate={setVisionTitle}
              sx={{
                fontSize: { xs: '2rem', md: '3.5rem' },
                fontWeight: 700, color: '#fff',
                mb: '16px', lineHeight: 1.15,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            {/* Website: <p class="text-tertiary_color text-[20px] font-medium mb-12 max-w-4xl"> */}
            <EditableBox
              value={visionSubtitle}
              onUpdate={setVisionSubtitle}
              sx={{
                fontSize: '1.25rem', fontWeight: 500,
                color: '#278AE0', mb: '48px',
                maxWidth: '900px', mx: 'auto', lineHeight: 1.6,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            {/* Website: <p class="text-gray-300 text-[20px] font-light leading-relaxed mb-6"> */}
            <EditableBox
              value={visionBody1}
              onUpdate={setVisionBody1}
              sx={{
                fontSize: '1.25rem', fontWeight: 300,
                color: 'rgb(209,213,219)', mb: '24px',
                lineHeight: 1.625, textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            {/* Website: <p class="text-gray-300 text-[20px] font-light leading-relaxed"> */}
            <EditableBox
              value={visionBody2}
              onUpdate={setVisionBody2}
              sx={{
                fontSize: '1.25rem', fontWeight: 300,
                color: 'rgb(209,213,219)', lineHeight: 1.625,
                textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* ── Notification ── */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification?.type || 'success'} variant="filled" onClose={() => setNotification(null)}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
