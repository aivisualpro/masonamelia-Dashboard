'use client';

import * as React from 'react';
import {
  Dialog, DialogContent,
  Box, Grid, TextField, MenuItem, Button, Typography,
  Tabs, Tab, IconButton, LinearProgress, CircularProgress,
  Divider, Stepper, Step, StepLabel, Alert, Snackbar
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  FlightTakeoff as JetIcon,
  Person as PersonIcon,
  Description as DescIcon,
  PhotoLibrary as GalleryIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { compressImage, formatBytes } from '@/utils/compressImage';

// ── Constants ────────────────────────────────────────────────────
const STATUS = [
  { name: 'For Sale', slug: 'for-sale', color: '#22c55e' },
  { name: 'Sold', slug: 'sold', color: '#ef4444' },
  { name: 'Wanted', slug: 'wanted', color: '#3b82f6' },
  { name: 'Coming Soon', slug: 'coming-soon', color: '#f59e0b' },
  { name: 'Sale Pending', slug: 'sale-pending', color: '#a855f7' },
  { name: 'Off Market', slug: 'off-market', color: '#6b7280' },
  { name: 'Acquired', slug: 'acquired', color: '#06b6d4' },
];

const SECTION_KEYS = ['general', 'airframe', 'engine', 'propeller', 'avionics', 'equipment', 'interior', 'exterior', 'inspection'];
const SECTION_LABELS: Record<string, string> = {
  general: 'General', airframe: 'Airframe', engine: 'Engine',
  propeller: 'Propeller', avionics: 'Avionics', equipment: 'Equipment',
  interior: 'Interior', exterior: 'Exterior', inspection: 'Inspection'
};

const STEPS = ['Aircraft Info', 'Agent & Media', 'Description'];

interface Category { _id: string; name: string; }
interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// ── Styled field label ────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.palette.text.secondary, mb: 0.75 }}>
      {children}
    </Typography>
  );
}

// ── Section header ────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main,
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{title}</Typography>
    </Box>
  );
}

// ── HEIC helpers ──────────────────────────────────────────────────
const ACCEPTED_IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg|tiff?|heic|heif|avif)$/i;
const isImageFile = (f: File) => f.type.startsWith('image/') || ACCEPTED_IMAGE_EXTENSIONS.test(f.name);
const canPreview = (f: File) => !(/\.(heic|heif|tiff?)$/i.test(f.name));

// ── Dropzone ──────────────────────────────────────────────────────
function DropZone({ label, multiple, onFiles, files, onRemove }: {
  label: string; multiple?: boolean;
  onFiles: (fs: File[]) => void;
  files: File[];
  onRemove: (i: number) => void;
}) {
  const theme = useTheme();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const dropped = Array.from(e.dataTransfer.files).filter(isImageFile);
    if (dropped.length) onFiles(dropped);
  };

  return (
    <Box>
      <Box
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: `2px dashed ${drag ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer',
          bgcolor: drag ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
          transition: 'all 0.2s',
          '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04) }
        }}
      >
        <UploadIcon sx={{ fontSize: 32, color: theme.palette.text.secondary, mb: 1 }} />
        <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary }}>
          Drag & drop or <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>click to browse</span>
        </Typography>
        <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, mt: 0.5 }}>{label}</Typography>
        <input ref={inputRef} hidden type="file" accept="image/*,.heic,.heif" multiple={multiple}
          onChange={e => { if (e.target.files?.length) onFiles(Array.from(e.target.files)); }} />
      </Box>

      {files.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
          {files.map((f, i) => (
            <Box key={i} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
              {canPreview(f) ? (
                <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                  <GalleryIcon sx={{ fontSize: 24, color: theme.palette.primary.main, mb: 0.5 }} />
                  <Typography sx={{ fontSize: 9, color: theme.palette.text.secondary, px: 0.5, textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {f.name.split('.').pop()?.toUpperCase()}
                  </Typography>
                </Box>
              )}
              <IconButton size="small" onClick={e => { e.stopPropagation(); onRemove(i); }}
                sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', p: '2px', '&:hover': { bgcolor: '#ef4444' } }}>
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── Main Modal ────────────────────────────────────────────────────
export default function AddAircraftModal({ open, onClose, onCreated }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [step, setStep] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('general');
  const [images, setImages] = React.useState<File[]>([]);
  const [featuredImage, setFeaturedImage] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState({ current: 0, total: 0, label: '', compressionInfo: '' });
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
  const [categories, setCategories] = React.useState<Category[]>([]);

  const { control, register, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: '', slug: '', year: '', price: '', status: 'for-sale', category: '',
      location: '', latitude: '', longitude: '',
      airframe: '', engine: '', engineTwo: '', propeller: '', propellerTwo: '',
      agentName: '', agentEmail: '', agentPhone: '',
      overview: '', index: '', videoUrl: '',
      sections: Object.fromEntries(SECTION_KEYS.map(k => [k, '']))
    }
  });

  // Fetch categories when modal opens
  React.useEffect(() => {
    if (!open) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/aircraftCategories`)
      .then(async r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(d => setCategories(d.data || []))
      .catch(() => {});
  }, [open]);

  const handleReset = React.useCallback(() => {
    reset();
    setImages([]);
    setFeaturedImage([]);
    setStep(0);
    setActiveTab('general');
    setUploadProgress({ current: 0, total: 0, label: '', compressionInfo: '' });
    SECTION_KEYS.forEach(k => setValue(`sections.${k}` as any, ''));
  }, [reset, setValue]);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  /** Compress + upload a single image file and return the URL */
  const compressAndUpload = async (
    file: File,
    index: number,
    total: number,
    folder: string = 'aircrafts'
  ): Promise<string> => {
    // ── Phase 1: Compress ──
    setUploadProgress({
      current: index,
      total,
      label: `Compressing image ${index} of ${total}…`,
      compressionInfo: `${file.name} — ${formatBytes(file.size)}`,
    });

    const result = await compressImage(file, {
      targetSizeBytes: 900_000,  // 900 KB — safe for Cloudinary free tier
      onProgress: (_pct, stage) => {
        setUploadProgress(prev => ({
          ...prev,
          label: `Image ${index}/${total}: ${stage}`,
        }));
      },
    });

    // ── Phase 2: Upload ──
    const ratio = result.compressionRatio > 1
      ? `${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${result.compressionRatio}x smaller)`
      : 'Already optimized';

    setUploadProgress(prev => ({
      ...prev,
      label: `Uploading image ${index} of ${total}…`,
      compressionInfo: ratio,
    }));

    const fd = new FormData();
    fd.append('file', result.file);
    fd.append('folder', folder);
    const resp = await fetch('/api/upload-image', { method: 'POST', body: fd });
    const data = await resp.json();
    if (!resp.ok || !data.success) throw new Error(data?.message || 'Image upload failed');
    return data.url;
  };

  const onSubmit = async (values: any) => {
    try {
      setUploading(true);

      if (!values.index || Number(values.index) < 1) {
        setSnack({ open: true, severity: 'error', msg: 'List Index must be greater than 0' });
        setUploading(false);
        return;
      }

      const totalUploads = images.length + (featuredImage[0] ? 1 : 0);
      let uploadedCount = 0;

      // ── Compress & Upload featured image first ──
      let featuredUrl = '';
      if (featuredImage[0]) {
        featuredUrl = await compressAndUpload(featuredImage[0], 1, totalUploads);
        uploadedCount++;
      }

      // ── Compress & Upload gallery images one-by-one ──
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const url = await compressAndUpload(images[i], uploadedCount + 1, totalUploads);
        imageUrls.push(url);
        uploadedCount++;
      }

      setUploadProgress({ current: totalUploads, total: totalUploads, label: 'Saving aircraft…', compressionInfo: '' });

      // ── Build the final payload with URLs only (no files) ──
      const description = {
        version: 1,
        sections: Object.fromEntries(SECTION_KEYS.map(k => [k, { html: values.sections[k] || '' }]))
      };

      const payload: any = {
        title: values.title,
        slug: values.slug || '',
        status: values.status,
        location: values.location,
        contactAgent: { name: values.agentName, email: values.agentEmail, phone: values.agentPhone },
        description,
        overview: values.overview,
      };
      // Only include numeric fields when they have a real value (Mongoose rejects empty strings for Number fields)
      if (values.year && !isNaN(Number(values.year))) payload.year = Number(values.year);
      if (values.price && !isNaN(Number(values.price))) payload.price = Number(values.price);
      if (values.index && !isNaN(Number(values.index))) payload.index = Number(values.index);
      if (values.latitude && values.latitude.trim()) payload.latitude = values.latitude;
      if (values.longitude && values.longitude.trim()) payload.longitude = values.longitude;
      if (values.category) payload.category = values.category;
      if (values.airframe) payload.airframe = Number(values.airframe);
      if (values.engine) payload.engine = Number(values.engine);
      if (values.engineTwo) payload.engineTwo = Number(values.engineTwo);
      if (values.propeller) payload.propeller = Number(values.propeller);
      if (values.propellerTwo) payload.propellerTwo = Number(values.propellerTwo);
      if (values.videoUrl) payload.videoUrl = values.videoUrl;
      if (imageUrls.length) payload.images = imageUrls;
      if (featuredUrl) payload.featuredImage = featuredUrl;

      const resp = await fetch('/api/aircrafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok || data?.success === false) throw new Error(data?.message || 'Upload failed');

      setSnack({ open: true, severity: 'success', msg: 'Aircraft created successfully!' });
      handleReset();
      setTimeout(() => { onCreated(); onClose(); }, 1200);
    } catch (e: any) {
      setSnack({ open: true, severity: 'error', msg: e.message });
    } finally {
      setUploading(false);
    }
  };

  // ── Step content ───────────────────────────────────────────────
  const stepContent = [
    // Step 0: Aircraft Info
    <Box key="info" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SectionHeader icon={<JetIcon sx={{ fontSize: 18 }} />} title="Aircraft Details" />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <FieldLabel>Title *</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. 2022 Cessna Citation M2 Gen 2"
            {...register('title', { required: true })}
            error={!!errors.title} helperText={errors.title ? 'Required' : ''}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FieldLabel>Status</FieldLabel>
          <TextField select fullWidth size="small" defaultValue="for-sale" {...register('status')}>
            {STATUS.map(s => (
              <MenuItem key={s.slug} value={s.slug}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                  {s.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Slug *</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. n363db"
            {...register('slug', { required: true })}
            error={!!errors.slug} helperText={errors.slug ? 'Required' : ''}
            InputProps={{
              endAdornment: (
                <Box
                  component="button"
                  type="button"
                  onClick={() => {
                    const title = (document.querySelector('input[name="title"]') as HTMLInputElement)?.value || '';
                    const firstWord = title.trim().split(/\s+/)[0] || '';
                    setValue('slug', firstWord.toLowerCase());
                  }}
                  sx={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 11, color: 'primary.main', whiteSpace: 'nowrap',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Auto
                </Box>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Year</FieldLabel>
          <TextField fullWidth size="small" placeholder="2024" type="number" {...register('year')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Price *</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. 1500000 or Call" {...register('price', { required: true })}
            error={!!errors.price} helperText={errors.price ? 'Required' : ''} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Make</FieldLabel>
          <TextField select fullWidth size="small" defaultValue="" {...register('category')}>
            <MenuItem value=""><em>None</em></MenuItem>
            {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Location *</FieldLabel>
          <TextField fullWidth size="small" placeholder="City, State" {...register('location', { required: true })} error={!!errors.location} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Latitude</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. 33.4484" {...register('latitude')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Longitude</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. -112.0740" {...register('longitude')} />
        </Grid>
      </Grid>

      <Divider />

      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 2, color: theme.palette.text.secondary }}>FLIGHT HOURS</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Airframe (hrs)</FieldLabel>
            <TextField fullWidth size="small" type="number" {...register('airframe')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Engine 1 (hrs)</FieldLabel>
            <TextField fullWidth size="small" type="number" {...register('engine')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Engine 2 (hrs)</FieldLabel>
            <TextField fullWidth size="small" type="number" {...register('engineTwo')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Propeller (hrs)</FieldLabel>
            <TextField fullWidth size="small" type="number" {...register('propeller')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Propeller 2 (hrs)</FieldLabel>
            <TextField fullWidth size="small" type="number" {...register('propellerTwo')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>List Index *</FieldLabel>
            <TextField fullWidth size="small" type="number" {...register('index', { required: true })}
              error={!!errors.index} helperText={errors.index ? 'Required' : ''} />
          </Grid>
        </Grid>
      </Box>

      <Divider />

      <Box>
        <FieldLabel>Video URL</FieldLabel>
        <TextField fullWidth size="small" placeholder="https://youtube.com/..." {...register('videoUrl')} />
      </Box>
    </Box>,

    // Step 1: Agent & Media
    <Box key="media" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SectionHeader icon={<PersonIcon sx={{ fontSize: 18 }} />} title="Contact Agent" />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Agent Name</FieldLabel>
          <TextField fullWidth size="small" {...register('agentName')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Agent Email</FieldLabel>
          <TextField fullWidth size="small" type="email" {...register('agentEmail')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FieldLabel>Agent Phone</FieldLabel>
          <TextField fullWidth size="small" {...register('agentPhone')} />
        </Grid>
      </Grid>

      <Divider />

      <SectionHeader icon={<GalleryIcon sx={{ fontSize: 18 }} />} title="Images" />
      <Box>
        <FieldLabel>Featured Image</FieldLabel>
        <DropZone label="JPG, PNG, WEBP — 1 file max" multiple={false}
          onFiles={fs => setFeaturedImage([fs[0]])}
          files={featuredImage}
          onRemove={() => setFeaturedImage([])} />
      </Box>
      <Box>
        <FieldLabel>Gallery Images</FieldLabel>
        <DropZone label="JPG, PNG, WEBP — multiple allowed" multiple
          onFiles={fs => setImages(prev => [...prev, ...fs])}
          files={images}
          onRemove={i => setImages(prev => prev.filter((_, idx) => idx !== i))} />
      </Box>
    </Box>,

    // Step 2: Description
    <Box key="desc" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SectionHeader icon={<DescIcon sx={{ fontSize: 18 }} />} title="Overview & Sections" />

      <Box>
        <FieldLabel>Description</FieldLabel>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Write an overview of the aircraft..."
          {...register('overview')}
          sx={{ '& .MuiInputBase-root': { fontFamily: 'inherit' } }}
        />
      </Box>

      <Divider />

      <Box>
        <FieldLabel>Detailed Sections</FieldLabel>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          sx={{ mb: 2, '& .MuiTab-root': { fontSize: 12, minHeight: 36, textTransform: 'none' } }}
        >
          {SECTION_KEYS.map(k => <Tab key={k} value={k} label={SECTION_LABELS[k]} />)}
        </Tabs>
        {SECTION_KEYS.map(k => (
          <Box key={k} hidden={activeTab !== k}>
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder={`Write ${SECTION_LABELS[k]} details...`}
              {...register(`sections.${k}` as any)}
              sx={{ '& .MuiInputBase-root': { fontFamily: 'inherit' } }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={uploading ? undefined : handleClose}
        fullWidth
        maxWidth="md"
        disableEnforceFocus
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, py: 2.5, flexShrink: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.15)}, transparent)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.12)}, transparent)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: theme.palette.primary.main, color: '#fff',
            }}>
              <JetIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Add New Aircraft</Typography>
              <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>Fill in the details to list a new aircraft</Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={uploading} size="small"
            sx={{ bgcolor: alpha(theme.palette.text.primary, 0.06), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 3, py: 2, flexShrink: 0, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stepper activeStep={step} alternativeLabel>
            {STEPS.map((label, i) => (
              <Step key={label} completed={i < step}>
                <StepLabel
                  onClick={() => { if (i < step) setStep(i); }}
                  sx={{ cursor: i < step ? 'pointer' : 'default', '& .MuiStepLabel-label': { fontSize: 12 } }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Upload progress — Smart Compression Engine UI */}
        {uploading && (
          <Box sx={{
            flexShrink: 0, mx: 2, mt: 1, borderRadius: 2, overflow: 'hidden',
            background: isDark
              ? 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.10))'
              : 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            backdropFilter: 'blur(8px)',
          }}>
            <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                    },
                  }}>
                    <CircularProgress size={14} thickness={5} sx={{ color: theme.palette.primary.main }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                      {uploadProgress.label || 'Initializing compression engine…'}
                    </Typography>
                    {uploadProgress.compressionInfo && (
                      <Typography sx={{
                        fontSize: 10, color: theme.palette.success.main, fontWeight: 500,
                        fontFamily: 'monospace', mt: 0.25,
                      }}>
                        ⚡ {uploadProgress.compressionInfo}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {uploadProgress.total > 0 && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: theme.palette.primary.main, lineHeight: 1 }}>
                      {uploadProgress.current}/{uploadProgress.total}
                    </Typography>
                    <Typography sx={{ fontSize: 9, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      images
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <LinearProgress
              variant={uploadProgress.total > 0 ? 'determinate' : 'indeterminate'}
              value={uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : undefined}
              sx={{
                height: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main || '#a855f7'})`,
                },
              }}
            />
          </Box>
        )}

        {/* Content */}
        <DialogContent sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
          <form id="add-aircraft-form" onSubmit={handleSubmit(onSubmit)}>
            {stepContent[step]}
          </form>
        </DialogContent>

        {/* Footer */}
        <Box sx={{
          px: 3, py: 2, flexShrink: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={handleClose} disabled={uploading}>Cancel</Button>
            {step > 0 && (
              <Button variant="outlined" size="small" onClick={() => setStep(s => s - 1)} disabled={uploading}>Back</Button>
            )}
          </Box>

          {step < STEPS.length - 1 ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !isValid}
              sx={{ minWidth: 100 }}
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              type="submit"
              form="add-aircraft-form"
              disabled={uploading}
              startIcon={uploading ? undefined : <CheckIcon />}
              sx={{ minWidth: 140, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
            >
              {uploading ? 'Creating…' : 'Create Aircraft'}
            </Button>
          )}
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
