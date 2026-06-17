'use client';
import * as React from 'react';
import {
  Box, Button, Paper, Typography, TextField, Snackbar, Alert, IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useContact } from '@/api/hooks';

const P = 'brokerage'; // prefix

const DEFAULTS = {
  hero_title_white: 'A Strategic Hands-On Approach ',
  hero_title_blue: 'to Selling Your Aircraft',
  hero_description: 'Your aircraft deserves to stand out. We highlight its strengths and handle every phase with intent, precision, and the relentless pursuit of perfection.',
  preflight_title: 'Preflight Planning',
  preflight_subtitle: 'Consultation',
  preflight_description: "Every brokerage is a unique opportunity with its own challenges. By understanding your goals, timing, and long-term vision, we design a clear path forward through brokerage, trade-in, or wholesale that helps you transition smoothly and maximize your results.",
  taxi_tagline: 'Taxi & Systems Check',
  taxi_title: 'Bringing to Market',
  taxi_description: 'Four disciplines. One objective: sell your aircraft efficiently and correctly.',
  taxi_cards: [
    { title: 'Advertising', point: 'This is where we go full throttle. From pro photography and high-impact video to disruptive social campaigns, we turn your aircraft into a must-see listing.' },
    { title: 'Pricing Accuracy', point: 'Leveraging our decades of experience and backed by SkyNet, our proprietary market valuation platform, we analyze real-time data to set an accurate, competitive price from the very start.' },
    { title: 'Sales Network', point: 'Your aircraft joins an exclusive network of qualified buyers, elite brokers, and international partners — amplifying visibility and minimizing time on market.' },
    { title: 'Project Management', point: "We're process-driven and relentless about execution. Every detail is tracked, every timeline met, every update delivered." },
  ],
  cleared_title: 'Cleared for Takeoff',
  cleared_subtitle: 'Active Marketing, Negotiation & Closing',
  cleared_intro: 'With your mission set and systems in sync, we execute. Mason Amelia takes your aircraft to market with precision, discipline, and transparency, aggressively marketing, strategically negotiating, and closing efficiently to deliver maximum value in minimal time.',
  cleared_bullets: [
    'Analyze market data and position your aircraft for maximum impact.',
    'Launch targeted campaigns and direct outreach to qualified buyers.',
    'Present offers and deliver real-time market feedback.',
    'Negotiate terms and manage contract execution through closing.',
    'Coordinate logistics and support a seamless handoff at delivery.',
  ],
  cleared_outro: "From first call to final handshake, we don't just list aircraft. We own the process, executing with precision, creating demand, and closing with clean and solid results.",
  relationship_title: 'Relationships for Life',
  relationship_subtitle: "This isn't transactional. This is a life-long friendship.",
};

export default function BrokerageContent() {
  const theme = useTheme();
  const { contact, mutate: mutateContact } = useContact();

  // ── Hero ──
  const [heroTitleWhite, setHeroTitleWhite] = React.useState(DEFAULTS.hero_title_white);
  const [heroTitleBlue, setHeroTitleBlue] = React.useState(DEFAULTS.hero_title_blue);
  const [heroDesc, setHeroDesc] = React.useState(DEFAULTS.hero_description);
  const [heroBg, setHeroBg] = React.useState('');
  // ── Preflight ──
  const [preflightTitle, setPreflightTitle] = React.useState(DEFAULTS.preflight_title);
  const [preflightSubtitle, setPreflightSubtitle] = React.useState(DEFAULTS.preflight_subtitle);
  const [preflightDesc, setPreflightDesc] = React.useState(DEFAULTS.preflight_description);
  const [preflightBg, setPreflightBg] = React.useState('');
  // ── Taxi ──
  const [taxiTagline, setTaxiTagline] = React.useState(DEFAULTS.taxi_tagline);
  const [taxiTitle, setTaxiTitle] = React.useState(DEFAULTS.taxi_title);
  const [taxiDesc, setTaxiDesc] = React.useState(DEFAULTS.taxi_description);
  const [taxiCards, setTaxiCards] = React.useState(DEFAULTS.taxi_cards);
  // ── Cleared ──
  const [clearedTitle, setClearedTitle] = React.useState(DEFAULTS.cleared_title);
  const [clearedSubtitle, setClearedSubtitle] = React.useState(DEFAULTS.cleared_subtitle);
  const [clearedIntro, setClearedIntro] = React.useState(DEFAULTS.cleared_intro);
  const [clearedBullets, setClearedBullets] = React.useState(DEFAULTS.cleared_bullets);
  const [clearedOutro, setClearedOutro] = React.useState(DEFAULTS.cleared_outro);
  const [clearedImage, setClearedImage] = React.useState('');
  // ── Relationship ──
  const [relTitle, setRelTitle] = React.useState(DEFAULTS.relationship_title);
  const [relSubtitle, setRelSubtitle] = React.useState(DEFAULTS.relationship_subtitle);
  const [relImage, setRelImage] = React.useState('');

  // ── CTA Banner ──
  const [ctaLine1White, setCtaLine1White] = React.useState('Data informs');
  const [ctaLine1Blue, setCtaLine1Blue] = React.useState('decisions.');
  const [ctaLine2White, setCtaLine2White] = React.useState('Exposure creates');
  const [ctaLine2Blue, setCtaLine2Blue] = React.useState('opportunity.');
  const [ctaLine3White, setCtaLine3White] = React.useState('Execution delivers');
  const [ctaLine3Blue, setCtaLine3Blue] = React.useState('results.');

  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Load ──
  React.useEffect(() => {
    if (!contact) return;
    const c = contact;
    setHeroTitleWhite(c[`${P}_hero_title_white`] || DEFAULTS.hero_title_white);
    setHeroTitleBlue(c[`${P}_hero_title_blue`] || DEFAULTS.hero_title_blue);
    setHeroDesc(c[`${P}_hero_description`] || DEFAULTS.hero_description);
    setHeroBg(c[`${P}_hero_bg_image`] || '');
    setPreflightTitle(c[`${P}_preflight_title`] || DEFAULTS.preflight_title);
    setPreflightSubtitle(c[`${P}_preflight_subtitle`] || DEFAULTS.preflight_subtitle);
    setPreflightDesc(c[`${P}_preflight_description`] || DEFAULTS.preflight_description);
    setPreflightBg(c[`${P}_preflight_bg_image`] || '');
    setTaxiTagline(c[`${P}_taxi_tagline`] || DEFAULTS.taxi_tagline);
    setTaxiTitle(c[`${P}_taxi_title`] || DEFAULTS.taxi_title);
    setTaxiDesc(c[`${P}_taxi_description`] || DEFAULTS.taxi_description);
    if (c[`${P}_taxi_cards`]?.length) setTaxiCards(c[`${P}_taxi_cards`]);
    setClearedTitle(c[`${P}_cleared_title`] || DEFAULTS.cleared_title);
    setClearedSubtitle(c[`${P}_cleared_subtitle`] || DEFAULTS.cleared_subtitle);
    setClearedIntro(c[`${P}_cleared_intro`] || DEFAULTS.cleared_intro);
    if (c[`${P}_cleared_bullets`]?.length) setClearedBullets(c[`${P}_cleared_bullets`]);
    setClearedOutro(c[`${P}_cleared_outro`] || DEFAULTS.cleared_outro);
    setClearedImage(c[`${P}_cleared_image`] || '');
    setRelTitle(c[`${P}_relationship_title`] || DEFAULTS.relationship_title);
    setRelSubtitle(c[`${P}_relationship_subtitle`] || DEFAULTS.relationship_subtitle);
    setRelImage(c[`${P}_relationship_image`] || '');

    setCtaLine1White(c[`${P}_cta_line1_white`] || 'Data informs');
    setCtaLine1Blue(c[`${P}_cta_line1_blue`] || 'decisions.');
    setCtaLine2White(c[`${P}_cta_line2_white`] || 'Exposure creates');
    setCtaLine2Blue(c[`${P}_cta_line2_blue`] || 'opportunity.');
    setCtaLine3White(c[`${P}_cta_line3_white`] || 'Execution delivers');
    setCtaLine3Blue(c[`${P}_cta_line3_blue`] || 'results.');
  }, [contact]);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        [`${P}_hero_title_white`]: heroTitleWhite,
        [`${P}_hero_title_blue`]: heroTitleBlue,
        [`${P}_hero_description`]: heroDesc,
        [`${P}_hero_bg_image`]: heroBg,
        [`${P}_preflight_title`]: preflightTitle,
        [`${P}_preflight_subtitle`]: preflightSubtitle,
        [`${P}_preflight_description`]: preflightDesc,
        [`${P}_preflight_bg_image`]: preflightBg,
        [`${P}_taxi_tagline`]: taxiTagline,
        [`${P}_taxi_title`]: taxiTitle,
        [`${P}_taxi_description`]: taxiDesc,
        [`${P}_taxi_cards`]: taxiCards,
        [`${P}_cleared_title`]: clearedTitle,
        [`${P}_cleared_subtitle`]: clearedSubtitle,
        [`${P}_cleared_intro`]: clearedIntro,
        [`${P}_cleared_bullets`]: clearedBullets,
        [`${P}_cleared_outro`]: clearedOutro,
        [`${P}_cleared_image`]: clearedImage,
        [`${P}_relationship_title`]: relTitle,
        [`${P}_relationship_subtitle`]: relSubtitle,
        [`${P}_relationship_image`]: relImage,
        [`${P}_cta_line1_white`]: ctaLine1White,
        [`${P}_cta_line1_blue`]: ctaLine1Blue,
        [`${P}_cta_line2_white`]: ctaLine2White,
        [`${P}_cta_line2_blue`]: ctaLine2Blue,
        [`${P}_cta_line3_white`]: ctaLine3White,
        [`${P}_cta_line3_blue`]: ctaLine3Blue,
      });
      mutateContact();
      setNotification({ message: 'Brokerage page saved', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to save', type: 'error' });
    } finally { setSaving(false); }
  };

  // Listen for header "Save Changes" button
  React.useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('save-contact', handler);
    return () => window.removeEventListener('save-contact', handler);
  });

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try { const res = await axios.post('/api/upload', fd); if (res.data?.url) { setter(res.data.url); setNotification({ message: 'Image updated', type: 'success' }); } } catch { setNotification({ message: 'Upload failed', type: 'error' }); }
  };

  const EditableBox = ({ value, onUpdate, sx: sxOverride = {} }: { value: string; onUpdate: (v: string) => void; sx?: Record<string, any> }) => (
    <Box contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate((e.target as HTMLElement)?.innerText ?? '')}
      sx={{ outline: 'none', cursor: 'text', px: 1, py: 0.3, borderRadius: 0.5, transition: 'background-color 0.15s', whiteSpace: 'pre-line',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        '&:focus': { backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(38,138,224,0.4)' },
        ...sxOverride,
      }}>{value}</Box>
  );

  const toolbarSx = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` };
  const sectionLabel = (text: string, hint?: string) => (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>{text}</Typography>
      {hint && <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>{hint}</Typography>}
    </Box>
  );
  const uploadBtn = (id: string, handler: (e: React.ChangeEvent<HTMLInputElement>) => void, label = 'Change Background') => (
    <label htmlFor={id}>
      <input id={id} type="file" accept="image/*" hidden onChange={handler} />
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 500, cursor: 'pointer', color: theme.palette.text.secondary, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s', '&:hover': { color: theme.palette.primary.main, borderColor: theme.palette.primary.main } }}>
        <CloudUploadIcon sx={{ fontSize: 14 }} /> {label}
      </Box>
    </label>
  );

  return (
    <>
      {/* ─── 1. HERO ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Hero Section · Brokerage Page', 'Click text to edit · Background image controllable')}
          {uploadBtn('brk-hero-bg', (e) => upload(e, setHeroBg))}
        </Box>
        <Box sx={{ position: 'relative', width: '100%', minHeight: '40vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, ...(heroBg ? { backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: '60% 50%' } : { backgroundColor: '#15161c' }) }} />
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(to right, rgba(21,22,28,0.85) 25%, rgba(21,22,28,0.4) 60%, rgba(21,22,28,0.25))' }} />
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, mx: 'auto', px: '32px', py: '40px' }}>
            <EditableBox value={heroTitleWhite} onUpdate={setHeroTitleWhite} sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, display: 'inline' }} />
            <EditableBox value={heroTitleBlue} onUpdate={setHeroTitleBlue} sx={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1, background: 'linear-gradient(to right, #1777cb, #278AE0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
            <EditableBox value={heroDesc} onUpdate={setHeroDesc} sx={{ fontSize: '1.1rem', color: 'rgba(181,181,181,0.64)', mt: '12px', maxWidth: '500px', lineHeight: 1.6 }} />
          </Box>
        </Box>
      </Paper>

      {/* ─── 2. PREFLIGHT PLANNING ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Preflight Planning Section', 'Click text to edit · Background image controllable')}
          {uploadBtn('brk-preflight-bg', (e) => upload(e, setPreflightBg))}
        </Box>
        <Box sx={{ position: 'relative', width: '100%', minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, ...(preflightBg ? { backgroundImage: `url(${preflightBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#1777cb' }) }} />
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(23,119,203,0.9)' }} />
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: 4, py: 5, maxWidth: 900 }}>
            <EditableBox value={preflightTitle} onUpdate={setPreflightTitle} sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }} />
            <EditableBox value={preflightSubtitle} onUpdate={setPreflightSubtitle} sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#fff', mt: 3 }} />
            <EditableBox value={preflightDesc} onUpdate={setPreflightDesc} sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', mt: 2, lineHeight: 1.7 }} />
          </Box>
        </Box>
      </Paper>

      {/* ─── 3. TAXI & SYSTEMS CHECK ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>{sectionLabel('Taxi & Systems Check Section', 'Edit titles and card content')}</Box>
        <Box sx={{ backgroundColor: '#111218', px: 4, py: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <EditableBox value={taxiTagline} onUpdate={setTaxiTagline} sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }} />
            <EditableBox value={taxiTitle} onUpdate={setTaxiTitle} sx={{ fontSize: '1.3rem', fontWeight: 300, color: '#fff', mt: 3 }} />
            <EditableBox value={taxiDesc} onUpdate={setTaxiDesc} sx={{ fontSize: '0.95rem', color: 'rgb(203,213,225)', mt: 2, maxWidth: 800, mx: 'auto', lineHeight: 1.7 }} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            {taxiCards.map((card, idx) => (
              <Box key={idx} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.7)' }}>
                <TextField fullWidth variant="standard" value={card.title} onChange={(e) => { const c = [...taxiCards]; c[idx] = { ...c[idx], title: e.target.value }; setTaxiCards(c); }}
                  inputProps={{ style: { color: '#fff', fontWeight: 600, fontSize: 14 } }} sx={{ mb: 1, '& .MuiInput-underline:before': { borderColor: 'rgba(255,255,255,0.15)' } }} />
                <TextField fullWidth multiline variant="outlined" size="small" value={card.point} onChange={(e) => { const c = [...taxiCards]; c[idx] = { ...c[idx], point: e.target.value }; setTaxiCards(c); }}
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, color: 'rgb(203,213,225)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
                {taxiCards.length > 1 && (
                  <IconButton size="small" onClick={() => setTaxiCards(taxiCards.filter((_, i) => i !== idx))} sx={{ mt: 0.5, color: '#ef4444' }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
          <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => setTaxiCards([...taxiCards, { title: '', point: '' }])}
            sx={{ textTransform: 'none', fontSize: 12, mt: 2, color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.15)', '&:hover': { color: '#1777cb', borderColor: '#1777cb' } }} variant="outlined">
            Add Card
          </Button>
        </Box>
      </Paper>

      {/* ─── 4. CLEARED FOR TAKEOFF ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>{sectionLabel('Cleared for Takeoff Section', 'Edit text fields · Manage image')}</Box>
        <Box sx={{ backgroundColor: '#fff', px: 4, py: 5 }}>
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <EditableBox value={clearedTitle} onUpdate={setClearedTitle} sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#111218', lineHeight: 1.1 }} />
              <EditableBox value={clearedSubtitle} onUpdate={setClearedSubtitle} sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#222', mt: 2 }} />
              <EditableBox value={clearedIntro} onUpdate={setClearedIntro} sx={{ fontSize: '0.95rem', color: '#222', mt: 2, lineHeight: 1.7 }} />
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#888', mb: 1, textTransform: 'uppercase' }}>Bullet Points</Typography>
                {clearedBullets.map((b, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1777cb', mt: 1.5, flexShrink: 0 }} />
                    <TextField fullWidth variant="outlined" size="small" value={b} onChange={(e) => { const bArr = [...clearedBullets]; bArr[idx] = e.target.value; setClearedBullets(bArr); }}
                      inputProps={{ style: { color: '#222' } }}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '& fieldset': { borderColor: '#ddd' } } }} />
                    {clearedBullets.length > 1 && (
                      <IconButton size="small" onClick={() => setClearedBullets(clearedBullets.filter((_, i) => i !== idx))} sx={{ color: '#ef4444' }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => setClearedBullets([...clearedBullets, ''])}
                  sx={{ textTransform: 'none', fontSize: 12, mt: 0.5, color: '#1777cb' }}>Add Bullet</Button>
              </Box>
              <EditableBox value={clearedOutro} onUpdate={setClearedOutro} sx={{ fontSize: '0.95rem', color: '#222', mt: 3, lineHeight: 1.7 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: '#f0f4f8', minHeight: 280 }}>
                {clearedImage ? (
                  <img src={clearedImage} alt="Cleared for Takeoff" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: '#999', fontSize: 14 }}>No image set</Box>
                )}
              </Box>
              {uploadBtn('brk-cleared-img', (e) => upload(e, setClearedImage), 'Change Image')}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ─── 5. RELATIONSHIPS ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('Relationships Section', 'Click text to edit · Manage image')}
          {uploadBtn('brk-rel-img', (e) => upload(e, setRelImage), 'Change Image')}
        </Box>
        <Box sx={{ backgroundColor: '#fffaf7', px: 4, py: 5 }}>
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <EditableBox value={relTitle} onUpdate={setRelTitle} sx={{ fontSize: '2.5rem', fontWeight: 600, color: '#111827', lineHeight: 1.1 }} />
              <EditableBox value={relSubtitle} onUpdate={setRelSubtitle} sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#222', mt: 2 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: '#f0f4f8', minHeight: 200 }}>
                {relImage ? (
                  <img src={relImage} alt="Relationships" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#999', fontSize: 14 }}>No image set</Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ─── 6. CTA BANNER ─── */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, mb: 2, overflow: 'hidden' }}>
        <Box sx={toolbarSx}>
          {sectionLabel('CTA Banner · Brokerage Page', '3 lines — white text with blue highlight word')}
        </Box>
        <Box sx={{ backgroundColor: '#111218', px: 4, py: 5 }}>
          {/* Live Preview */}
          <Box sx={{ textAlign: 'center', mb: 4, py: 4, borderRadius: 3, background: 'linear-gradient(135deg, #16171d 0%, #1a1b22 50%, #16171d 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[{ w: ctaLine1White, b: ctaLine1Blue }, { w: ctaLine2White, b: ctaLine2Blue }, { w: ctaLine3White, b: ctaLine3Blue }].map((line, i) => (
              <Box key={i} sx={{ fontSize: { xs: '1.4rem', md: '2rem' }, fontWeight: 700, lineHeight: 1.4, fontStyle: 'italic', color: '#fff' }}>
                {line.w}{' '}<span style={{ color: '#268AE0' }}>{line.b}</span>
              </Box>
            ))}
            <Box sx={{ mt: 3 }}>
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 2.5, py: 1, borderRadius: 99, border: '1.5px solid rgba(255,255,255,0.7)', color: '#fff', fontSize: 14, fontWeight: 500 }}>
                Contact Us <span style={{ fontSize: 16 }}>↗</span>
              </Box>
            </Box>
          </Box>

          {/* Editor Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Line 1', white: ctaLine1White, setWhite: setCtaLine1White, blue: ctaLine1Blue, setBlue: setCtaLine1Blue },
              { label: 'Line 2', white: ctaLine2White, setWhite: setCtaLine2White, blue: ctaLine2Blue, setBlue: setCtaLine2Blue },
              { label: 'Line 3', white: ctaLine3White, setWhite: setCtaLine3White, blue: ctaLine3Blue, setBlue: setCtaLine3Blue },
            ].map((line) => (
              <Box key={line.label} sx={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 1.5, alignItems: 'center' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{line.label}</Typography>
                <TextField
                  fullWidth size="small" placeholder="White text" value={line.white}
                  onChange={(e) => line.setWhite(e.target.value)}
                  inputProps={{ style: { color: '#fff', fontSize: 14 } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' } } }}
                />
                <TextField
                  fullWidth size="small" placeholder="Blue text" value={line.blue}
                  onChange={(e) => line.setBlue(e.target.value)}
                  inputProps={{ style: { color: '#268AE0', fontSize: 14, fontWeight: 600 } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(38,138,224,0.25)' }, '&:hover fieldset': { borderColor: 'rgba(38,138,224,0.5)' } } }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      <Snackbar open={!!notification} autoHideDuration={3000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification?.type || 'success'} variant="filled" onClose={() => setNotification(null)}>{notification?.message}</Alert>
      </Snackbar>
    </>
  );
}
