'use client';
import * as React from 'react';
import {
  Box, Button, Paper, Typography, TextField, Snackbar, Alert, IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VideocamIcon from '@mui/icons-material/Videocam';
import axios from 'axios';
import { useContact } from '@/api/hooks';

/* ────────── defaults (match Contact.model.js) ────────── */
const DEFAULTS = {
  hero_title: 'Turbulence-Free Transactions',
  hero_description: 'Industry-leading marketing, data, and grit to help you buy or sell.',
  hero_video_url: '/assets/file.mp4',
  hero_mobile_title: 'Turbulence-Free Transactions',
  team_title_white: 'From San Antonio to Duluth…',
  team_title_blue: 'Meet the Team',
  team_description:
    'We are purveyors of high-end piston and owner-flown turbine aircraft. Our nationwide team brings decades of experience across every corner of aviation. From initial consultation to final aircraft delivery, we handle every transaction with efficiency and an unwavering focus on your satisfaction\'s bottom line. Putting clients first and building lasting relationships is the foundation of our success and yours.',
  stats_title: 'By the Numbers',
  stats_description:
    "The data doesn't lie. Mason Amelia is your expert wingman with a proven track record and reputation.",
  stats_cards: [
    { prefix: '$', count: 500, suffix: 'M', description: 'In completed aircraft transactions' },
    { prefix: '', count: 300, suffix: '+', description: 'Aircraft closings successfully managed worldwide' },
    { prefix: '', count: 75, suffix: '', description: 'Years of combined experience in aviation industry' },
    { prefix: '', count: 8, suffix: '', description: 'Dedicated professionals team serving our valued clients' },
    { prefix: '', count: 0, suffix: '', description: 'Excuses — delivering trusted results every single time' },
  ],
  hero_service_cards: [
    { title: 'Sell My Plane', tagline: 'Aircraft Brokerage Services', link: '/brokerage' },
    { title: 'Help Me Buy', tagline: 'Acquisition Services', link: '/acquisition' },
    { title: 'Valuation', tagline: 'Real-Time Insights by SkyNet', link: '/skynet' },
    { title: 'Ancillary', tagline: 'Legal • Sales Tax • Insurance', link: '/acquisition#acquisition' },
  ],
  gallery_title: 'A Bespoke Approach to Brokerage',
};

export default function HomeTab() {
  const theme = useTheme();
  const { contact, mutate: mutateContact } = useContact();

  // ── Hero ──
  const [heroTitle, setHeroTitle] = React.useState(DEFAULTS.hero_title);
  const [heroDesc, setHeroDesc] = React.useState(DEFAULTS.hero_description);
  const [heroVideoUrl, setHeroVideoUrl] = React.useState(DEFAULTS.hero_video_url);
  const [heroMobileTitle, setHeroMobileTitle] = React.useState(DEFAULTS.hero_mobile_title);

  // ── Meet the Team ──
  const [teamTitleWhite, setTeamTitleWhite] = React.useState(DEFAULTS.team_title_white);
  const [teamTitleBlue, setTeamTitleBlue] = React.useState(DEFAULTS.team_title_blue);
  const [teamDesc, setTeamDesc] = React.useState(DEFAULTS.team_description);
  const [teamImage, setTeamImage] = React.useState('');

  // ── By the Numbers ──
  const [statsTitle, setStatsTitle] = React.useState(DEFAULTS.stats_title);
  const [statsDesc, setStatsDesc] = React.useState(DEFAULTS.stats_description);
  const [statsCards, setStatsCards] = React.useState(DEFAULTS.stats_cards);

  // ── Hero Service Cards ──
  const [serviceCards, setServiceCards] = React.useState(DEFAULTS.hero_service_cards);

  // ── Gallery ──
  const [galleryTitle, setGalleryTitle] = React.useState(DEFAULTS.gallery_title);

  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Load from DB ──
  React.useEffect(() => {
    if (!contact) return;
    setHeroTitle(contact.home_hero_title || DEFAULTS.hero_title);
    setHeroDesc(contact.home_hero_description || DEFAULTS.hero_description);
    setHeroVideoUrl(contact.home_hero_video_url || DEFAULTS.hero_video_url);
    setHeroMobileTitle(contact.home_hero_mobile_title || DEFAULTS.hero_mobile_title);

    setTeamTitleWhite(contact.home_team_title_white || DEFAULTS.team_title_white);
    setTeamTitleBlue(contact.home_team_title_blue || DEFAULTS.team_title_blue);
    setTeamDesc(contact.home_team_description || DEFAULTS.team_description);
    setTeamImage(contact.home_team_image || '');

    setStatsTitle(contact.home_stats_title || DEFAULTS.stats_title);
    setStatsDesc(contact.home_stats_description || DEFAULTS.stats_description);
    if (contact.home_stats_cards?.length) setStatsCards(contact.home_stats_cards);

    if (contact.home_hero_service_cards?.length) setServiceCards(contact.home_hero_service_cards);

    setGalleryTitle(contact.home_gallery_title || DEFAULTS.gallery_title);
  }, [contact]);

  // ── Save All ──
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        home_hero_title: heroTitle,
        home_hero_description: heroDesc,
        home_hero_video_url: heroVideoUrl,
        home_hero_mobile_title: heroMobileTitle,
        home_team_title_white: teamTitleWhite,
        home_team_title_blue: teamTitleBlue,
        home_team_description: teamDesc,
        home_team_image: teamImage,
        home_stats_title: statsTitle,
        home_stats_description: statsDesc,
        home_stats_cards: statsCards,
        home_hero_service_cards: serviceCards,
        home_gallery_title: galleryTitle,
      });
      mutateContact();
      setNotification({ message: 'Home page saved', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Upload handler ──
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd);
      if (res.data?.url) {
        setter(res.data.url);
        setNotification({ message: 'Upload successful', type: 'success' });
      }
    } catch {
      setNotification({ message: 'Upload failed', type: 'error' });
    }
  };

  // ── Editable Box ──
  const EditableBox = ({ value, onUpdate, sx: sxOverride = {} }: { value: string; onUpdate: (v: string) => void; sx?: Record<string, any> }) => (
    <Box contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate((e.target as HTMLElement)?.textContent ?? '')}
      sx={{ outline: 'none', cursor: 'text', px: 1, py: 0.3, borderRadius: 0.5, transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        '&:focus': { backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(38,138,224,0.4)' },
        ...sxOverride,
      }}>
      {value}
    </Box>
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
      {/* ─── 1. HERO SECTION ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Hero Section · Home Page', 'Edit title, description, and hero video URL')}
        </Box>
        <Box sx={{ position: 'relative', width: '100%', minHeight: '40vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {/* Dark background simulating the hero */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: '#111218' }} />
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(to top, rgba(17,18,24,0.98) 30%, rgba(17,18,24,0.4) 80%)' }} />
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, mx: 'auto', px: '32px', py: '40px', textAlign: 'center' }}>
            <EditableBox value={heroTitle} onUpdate={setHeroTitle} sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, textTransform: 'capitalize' }} />
            <EditableBox value={heroDesc} onUpdate={setHeroDesc} sx={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', mt: '12px', maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }} />

            {/* Video URL */}
            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 600, mx: 'auto' }}>
              <VideocamIcon sx={{ color: '#1777cb', fontSize: 22 }} />
              <TextField
                fullWidth size="small" placeholder="Video URL (e.g. /assets/file.mp4 or https://...)"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                inputProps={{ style: { color: '#fff', fontSize: 13 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#1777cb' },
                  },
                }}
              />
            </Box>

            {/* Mobile title */}
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', mb: 0.5 }}>Mobile Hero Title</Typography>
              <EditableBox value={heroMobileTitle} onUpdate={setHeroMobileTitle} sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1777cb', mx: 'auto', maxWidth: 400 }} />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ─── 1b. HERO SERVICE CARDS ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Hero Service Cards', 'The 4 navigation cards below the hero (title, tagline, link)')}
        </Box>
        <Box sx={{ backgroundColor: '#111218', px: 4, py: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
            {serviceCards.map((card, idx) => (
              <Box key={idx} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.7)' }}>
                <TextField
                  fullWidth size="small" placeholder="Title" value={card.title}
                  onChange={(e) => { const c = [...serviceCards]; c[idx] = { ...c[idx], title: e.target.value }; setServiceCards(c); }}
                  inputProps={{ style: { color: '#fff', fontWeight: 600, fontSize: 14 } }}
                  sx={{ mb: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />
                <TextField
                  fullWidth size="small" placeholder="Tagline" value={card.tagline}
                  onChange={(e) => { const c = [...serviceCards]; c[idx] = { ...c[idx], tagline: e.target.value }; setServiceCards(c); }}
                  inputProps={{ style: { color: 'rgb(203,213,225)', fontSize: 12 } }}
                  sx={{ mb: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />
                <TextField
                  fullWidth size="small" placeholder="Link (e.g. /brokerage)" value={card.link}
                  onChange={(e) => { const c = [...serviceCards]; c[idx] = { ...c[idx], link: e.target.value }; setServiceCards(c); }}
                  inputProps={{ style: { color: '#1777cb', fontSize: 12 } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />
                {serviceCards.length > 1 && (
                  <IconButton size="small" onClick={() => setServiceCards(serviceCards.filter((_, i) => i !== idx))} sx={{ mt: 0.5, color: '#ef4444' }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
          <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => setServiceCards([...serviceCards, { title: '', tagline: '', link: '' }])}
            sx={{ textTransform: 'none', fontSize: 12, mt: 2, color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.15)', '&:hover': { color: '#1777cb', borderColor: '#1777cb' } }} variant="outlined">
            Add Card
          </Button>
        </Box>
      </Paper>

      {/* ─── 2. MEET THE TEAM ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Meet the Team Section', 'Click text to edit · Manage image')}
          <label htmlFor="home-team-img-upload">
            <input id="home-team-img-upload" type="file" accept="image/*" hidden onChange={(e) => handleUpload(e, setTeamImage)} />
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 500, cursor: 'pointer', color: theme.palette.text.secondary, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s', '&:hover': { color: theme.palette.primary.main, borderColor: theme.palette.primary.main } }}>
              <CloudUploadIcon sx={{ fontSize: 14 }} /> Change Image
            </Box>
          </label>
        </Box>
        <Box sx={{ backgroundColor: '#fff', px: 4, py: 5 }}>
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
            {/* Text side */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'baseline' }}>
                <EditableBox value={teamTitleWhite} onUpdate={setTeamTitleWhite} sx={{ fontSize: '2rem', fontWeight: 700, color: '#111218', lineHeight: 1.1 }} />
                <EditableBox value={teamTitleBlue} onUpdate={setTeamTitleBlue} sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
              </Box>
              <EditableBox value={teamDesc} onUpdate={setTeamDesc} sx={{ fontSize: '0.95rem', color: '#222', mt: 2, lineHeight: 1.7, textAlign: 'justify' }} />
            </Box>
            {/* Image side */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: '#f0f4f8', minHeight: 200 }}>
                {teamImage ? (
                  <img src={teamImage} alt="Meet the Team" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#999', fontSize: 14 }}>Default image (team.jpg)</Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ─── 3. BY THE NUMBERS ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('By the Numbers Section', 'Edit title, description, and stat cards')}
        </Box>
        <Box sx={{ backgroundColor: '#111218', px: 4, py: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <EditableBox value={statsTitle} onUpdate={setStatsTitle} sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }} />
            <EditableBox value={statsDesc} onUpdate={setStatsDesc} sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', mt: 2, maxWidth: 700, mx: 'auto', lineHeight: 1.7 }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            {statsCards.map((card, idx) => (
              <Box key={idx} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.7)', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, justifyContent: 'center' }}>
                  <TextField
                    size="small" placeholder="Prefix" value={card.prefix}
                    onChange={(e) => { const c = [...statsCards]; c[idx] = { ...c[idx], prefix: e.target.value }; setStatsCards(c); }}
                    inputProps={{ style: { color: '#fff', fontSize: 13, textAlign: 'center', width: 40 } }}
                    sx={{ flex: '0 0 60px', '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                  />
                  <TextField
                    size="small" placeholder="Count" type="number" value={card.count}
                    onChange={(e) => { const c = [...statsCards]; c[idx] = { ...c[idx], count: parseInt(e.target.value) || 0 }; setStatsCards(c); }}
                    inputProps={{ style: { color: '#fff', fontSize: 20, fontWeight: 700, textAlign: 'center' } }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                  />
                  <TextField
                    size="small" placeholder="Suffix" value={card.suffix}
                    onChange={(e) => { const c = [...statsCards]; c[idx] = { ...c[idx], suffix: e.target.value }; setStatsCards(c); }}
                    inputProps={{ style: { color: '#fff', fontSize: 13, textAlign: 'center', width: 40 } }}
                    sx={{ flex: '0 0 60px', '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                  />
                </Box>
                <TextField
                  fullWidth multiline size="small" placeholder="Description" value={card.description}
                  onChange={(e) => { const c = [...statsCards]; c[idx] = { ...c[idx], description: e.target.value }; setStatsCards(c); }}
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, color: 'rgb(203,213,225)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />
                {statsCards.length > 1 && (
                  <IconButton size="small" onClick={() => setStatsCards(statsCards.filter((_, i) => i !== idx))} sx={{ mt: 0.5, color: '#ef4444' }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
          <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => setStatsCards([...statsCards, { prefix: '', count: 0, suffix: '', description: '' }])}
            sx={{ textTransform: 'none', fontSize: 12, mt: 2, color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.15)', '&:hover': { color: '#1777cb', borderColor: '#1777cb' } }} variant="outlined">
            Add Stat Card
          </Button>
        </Box>
      </Paper>

      {/* ─── 4. GALLERY TITLE ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Gallery / Brokerage Section', 'Edit the gallery heading')}
        </Box>
        <Box sx={{ backgroundColor: '#111218', px: 4, py: 5, textAlign: 'center' }}>
          <EditableBox value={galleryTitle} onUpdate={setGalleryTitle} sx={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }} />
        </Box>
      </Paper>

      <Snackbar open={!!notification} autoHideDuration={3000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification?.type || 'success'} variant="filled" onClose={() => setNotification(null)}>{notification?.message}</Alert>
      </Snackbar>
    </>
  );
}
