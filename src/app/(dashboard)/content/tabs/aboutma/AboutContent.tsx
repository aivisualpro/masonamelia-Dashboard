'use client';
import * as React from 'react';
import {
  Box, Button, Paper, Typography, TextField, Snackbar, Alert, IconButton, Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useContact } from '@/api/hooks';

// ── Defaults (mirrors Contact.model.js) ──
const DEFAULTS = {
  hero_title_white: 'Redefining ',
  hero_title_blue: 'Aircraft Brokerage',
  hero_description: 'Built on Trust, Performance, and Relationships That Endure.',
  wsa_title_white: 'Who is ',
  wsa_title_blue: 'Mason Amelia?',
  wsa_subtitle: "An aircraft brokerage named after our founder Jesse Adams' children, focused on high-performance piston and owner-flown turbine aircraft, built on:",
  wsa_cards: [
    { title: 'Integrity', description: 'When you name a company after your children, you hold yourself to a higher standard. Mason Amelia was built on the belief that every transaction should be a win for both Buyer and Seller. Our greatest sense of accomplishment comes from the repeat clients, referrals, and reputation that follow doing business the right way.' },
    { title: 'Relationships', description: 'We value relationships over transactions. Loyalty runs deep here : to our clients, our partners, and our friends. Matching the right buyer with the right seller is how we take care of our circle.' },
    { title: 'Expertise', description: "Confidence isn't a claim, it's a credential. With experience spanning flight instruction, airline, and corporate aviation, we've flown the mission from every seat. That's what makes our methodology an industry benchmark." },
  ],
  timeline_items: [
    { year: '2004', heading: 'Aviation Begins', description: 'After honorable enlisted military service, Jesse began flight training and quickly progressed through CFI, CFII, and MEI ratings.' },
    { year: '2007–2012', heading: 'Airlines and Entrepreneurship', description: 'Jesse flew regional jets for Republic Airways while simultaneously pursuing entrepreneurial ventures, building discipline as a pro pilot, alongside business acumen.' },
    { year: '2012–2015', heading: 'Business Foundation', description: 'Jesse joined his brothers at Sagacious Consultants, helping scale the firm to a successful acquisition by Accenture – but never stopped flying.' },
    { year: '2018', heading: 'Founded', description: "Initially a spin-off of the Adams brothers' entrepreneurial success, Mason Amelia was created as a professional services firm and business consultancy. As the company began recruiting for aviation sales organizations, a clear opportunity emerged..." },
    { year: '2019–2023', heading: 'Brokerage Mastery', description: "Nearly five years at the world's largest Cirrus focused brokerage gave Jesse exposure to high volume global transactions across piston and owner-flown turbine aircraft, completing more than 200 deals." },
    { year: '2023', heading: 'Strategic Refocus', description: 'Jesse founded Mason Amelia as a modern aircraft brokerage, combining data, elevated marketing, and grit. Within six months, the first team members were hired and remain core to the firm today.' },
    { year: '2024', heading: 'Rapid Growth', description: 'Mason Amelia became one of the fastest growing aircraft brokerages in the country, reshaping how owner-flown aircraft are marketed and sold.' },
    { year: '2025', heading: 'SkyNet Launch', description: "The launch of SkyNet formalized Mason Amelia's data driven valuation approach, bringing greater clarity and precision to the market." },
    { year: '2026', heading: 'Looking Forward', description: 'Executing at scale. Growing with intent.' },
  ],
};

interface WsaCard { title: string; description: string; }
interface TimelineItem { year: string; heading: string; description: string; }

export default function AboutContent() {
  const theme = useTheme();
  const { contact, mutate: mutateContact } = useContact();

  // ── Hero ──
  const [heroTitleWhite, setHeroTitleWhite] = React.useState(DEFAULTS.hero_title_white);
  const [heroTitleBlue, setHeroTitleBlue] = React.useState(DEFAULTS.hero_title_blue);
  const [heroDesc, setHeroDesc] = React.useState(DEFAULTS.hero_description);
  const [heroBg, setHeroBg] = React.useState('');

  // ── What Sets Us Apart ──
  const [wsaTitleWhite, setWsaTitleWhite] = React.useState(DEFAULTS.wsa_title_white);
  const [wsaTitleBlue, setWsaTitleBlue] = React.useState(DEFAULTS.wsa_title_blue);
  const [wsaSubtitle, setWsaSubtitle] = React.useState(DEFAULTS.wsa_subtitle);
  const [wsaCards, setWsaCards] = React.useState<WsaCard[]>(DEFAULTS.wsa_cards);

  // ── Timeline ──
  const [timelineBg, setTimelineBg] = React.useState('');
  const [timelineItems, setTimelineItems] = React.useState<TimelineItem[]>(DEFAULTS.timeline_items);

  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  // ── Populate from DB ──
  React.useEffect(() => {
    if (!contact) return;
    // Hero
    setHeroTitleWhite(contact.about_hero_title_white ?? DEFAULTS.hero_title_white);
    setHeroTitleBlue(contact.about_hero_title_blue ?? DEFAULTS.hero_title_blue);
    setHeroDesc(contact.about_hero_description ?? DEFAULTS.hero_description);
    setHeroBg(contact.about_hero_bg_image ?? '');
    // WSA
    setWsaTitleWhite(contact.about_wsa_title_white ?? DEFAULTS.wsa_title_white);
    setWsaTitleBlue(contact.about_wsa_title_blue ?? DEFAULTS.wsa_title_blue);
    setWsaSubtitle(contact.about_wsa_subtitle ?? DEFAULTS.wsa_subtitle);
    if (contact.about_wsa_cards?.length) setWsaCards(contact.about_wsa_cards);
    // Timeline
    setTimelineBg(contact.about_timeline_bg_image ?? '');
    if (contact.about_timeline_items?.length) setTimelineItems(contact.about_timeline_items);
  }, [contact]);

  // ── Image upload helper ──
  const uploadImage = async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await axios.post('/api/upload', form);
      return data.url;
    } catch {
      setToast({ open: true, msg: 'Upload failed', severity: 'error' });
      return null;
    }
  };

  // ── WSA card helpers ──
  const updateWsaCard = (idx: number, field: keyof WsaCard, value: string) => {
    setWsaCards((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };
  const removeWsaCard = (idx: number) => setWsaCards((prev) => prev.filter((_, i) => i !== idx));
  const addWsaCard = () => setWsaCards((prev) => [...prev, { title: '', description: '' }]);

  // ── Timeline helpers ──
  const updateTimelineItem = (idx: number, field: keyof TimelineItem, value: string) => {
    setTimelineItems((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };
  const removeTimelineItem = (idx: number) => setTimelineItems((prev) => prev.filter((_, i) => i !== idx));
  const addTimelineItem = () => setTimelineItems((prev) => [...prev, { year: '', heading: '', description: '' }]);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        about_hero_title_white: heroTitleWhite,
        about_hero_title_blue: heroTitleBlue,
        about_hero_description: heroDesc,
        about_hero_bg_image: heroBg,
        about_wsa_title_white: wsaTitleWhite,
        about_wsa_title_blue: wsaTitleBlue,
        about_wsa_subtitle: wsaSubtitle,
        about_wsa_cards: wsaCards,
        about_timeline_bg_image: timelineBg,
        about_timeline_items: timelineItems,
      });
      mutateContact();
      setToast({ open: true, msg: 'About page saved!', severity: 'success' });
    } catch {
      setToast({ open: true, msg: 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Hero image upload ──
  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) { setHeroBg(url); setToast({ open: true, msg: 'Background updated', severity: 'success' }); }
  };

  // ── Editable Box (inline content-editable, matches Acquisition pattern) ──
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

  // Default hero bg — copied from website public/images/team.jpg into dashboard public/images/
  const DEFAULT_HERO_BG = '/images/team.jpg';
  const heroBackground = heroBg || DEFAULT_HERO_BG;

  const sectionPaper = {
    p: 3,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ═══════════════ HERO (visual preview) ═══════════════ */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Hero Section · About Page', 'Click text to edit · Background image controllable')}
          <label htmlFor="about-hero-bg-upload">
            <input id="about-hero-bg-upload" type="file" accept="image/*" hidden onChange={handleHeroBgUpload} />
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 500, cursor: 'pointer', color: theme.palette.text.secondary, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s', '&:hover': { color: theme.palette.primary.main, borderColor: theme.palette.primary.main } }}>
              <CloudUploadIcon sx={{ fontSize: 14 }} /> Change Background
            </Box>
          </label>
        </Box>
        <Box sx={{ position: 'relative', width: '100%', minHeight: '40vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {/* Background image */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: '60% 50%' }} />
          {/* Gradient overlay (matches website) */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(to right, rgba(21,22,28,0.95) 25%, rgba(21,22,28,0.6) 55%, rgba(21,22,28,0.35))' }} />
          {/* Text content */}
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, mx: 'auto', px: '32px', py: '40px' }}>
            <EditableBox value={heroTitleWhite} onUpdate={setHeroTitleWhite} sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, display: 'inline' }} />
            <EditableBox value={heroTitleBlue} onUpdate={setHeroTitleBlue} sx={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1, background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
            <EditableBox value={heroDesc} onUpdate={setHeroDesc} sx={{ fontSize: '1.1rem', color: 'rgba(181,181,181,0.64)', mt: '12px', maxWidth: '500px', lineHeight: 1.6 }} />
          </Box>
        </Box>
      </Paper>

      {/* ═══════════════ WHAT SETS US APART ═══════════════ */}
      <Paper elevation={0} sx={sectionPaper}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          What Sets Us Apart
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Heading (White)" size="small" fullWidth value={wsaTitleWhite} onChange={(e) => setWsaTitleWhite(e.target.value)} />
          <TextField label="Heading (Blue / Accent)" size="small" fullWidth value={wsaTitleBlue} onChange={(e) => setWsaTitleBlue(e.target.value)} />
          <TextField label="Subtitle" size="small" fullWidth multiline rows={2} value={wsaSubtitle} onChange={(e) => setWsaSubtitle(e.target.value)} />

          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" fontWeight={600} color="text.secondary">Feature Cards</Typography>

          {wsaCards.map((card, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" fontWeight={600}>Card {idx + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => removeWsaCard(idx)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
              <TextField label="Title" size="small" fullWidth sx={{ mb: 1.5 }} value={card.title} onChange={(e) => updateWsaCard(idx, 'title', e.target.value)} />
              <TextField label="Description" size="small" fullWidth multiline rows={3} value={card.description} onChange={(e) => updateWsaCard(idx, 'description', e.target.value)} />
            </Paper>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addWsaCard}>Add Card</Button>
        </Box>
      </Paper>

      {/* ═══════════════ TIMELINE ═══════════════ */}
      <Paper elevation={0} sx={sectionPaper}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Timeline
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Timeline BG */}
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Timeline Background Image</Typography>
            {timelineBg && (
              <Box component="img" src={timelineBg} alt="Timeline bg" sx={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 1, mb: 1, border: `1px solid ${theme.palette.divider}` }} />
            )}
            <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
              {timelineBg ? 'Replace Image' : 'Upload Image'}
              <input type="file" hidden accept="image/*" onChange={async (e) => {
                const url = e.target.files?.[0] ? await uploadImage(e.target.files[0]) : null;
                if (url) { setTimelineBg(url); setToast({ open: true, msg: 'Image uploaded', severity: 'success' }); }
              }} />
            </Button>
          </Box>

          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" fontWeight={600} color="text.secondary">Timeline Entries</Typography>

          {timelineItems.map((item, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" fontWeight={600}>Entry {idx + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => removeTimelineItem(idx)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <TextField label="Year" size="small" sx={{ width: 140 }} value={item.year} onChange={(e) => updateTimelineItem(idx, 'year', e.target.value)} />
                <TextField label="Heading" size="small" fullWidth value={item.heading} onChange={(e) => updateTimelineItem(idx, 'heading', e.target.value)} />
              </Box>
              <TextField label="Description" size="small" fullWidth multiline rows={2} value={item.description} onChange={(e) => updateTimelineItem(idx, 'description', e.target.value)} />
            </Paper>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addTimelineItem}>Add Timeline Entry</Button>
        </Box>
      </Paper>

      {/* ═══════════════ SAVE ═══════════════ */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 4 }}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
