'use client';

import React, { useMemo, useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
  AlertColor,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Delete as DeleteIcon, DeleteForever as DeleteForeverIcon, Upload as UploadIcon, Send as SendIcon, ArrowBack as ArrowBackIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import 'react-quill/dist/quill.snow.css';
import { getAircraftCategories } from '@/api/aircraftCategory.api';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const STATUS = ['for-sale', 'sold', 'wanted', 'coming-soon', 'sale-pending', 'off-market', 'acquired'];
const SECTION_KEYS = ['general', 'airframe', 'engine', 'propeller', 'avionics', 'equipment', 'interior', 'exterior', 'inspection'] as const;
type SectionKey = typeof SECTION_KEYS[number];

const SECTION_LABELS: Record<SectionKey, string> = {
  general: 'General',
  airframe: 'Airframe',
  engine: 'Engine',
  propeller: 'Propeller',
  avionics: 'Avionics',
  equipment: 'Equipments',
  interior: 'Interior',
  exterior: 'Exterior',
  inspection: 'Inspection'
};

interface Category {
  _id: string;
  name: string;
}

interface ContactAgent {
  name?: string;
  email?: string;
  phone?: string;
}

interface AircraftDoc {
  title?: string;
  year?: number | string;
  price?: number | string;
  status?: string;
  category?: string | { _id: string };
  location?: string;
  latitude?: string;
  longitude?: string;
  airframe?: string;
  engine?: string;
  engineTwo?: string;
  propeller?: string;
  propellerTwo?: string;
  contactAgent?: ContactAgent;
  videoUrl?: string;
  overview?: string;
  index?: number | string;
  images?: string[];
  featuredImage?: string;
  description?: {
    sections?: Record<string, { html?: string }>;
  };
}

interface FormValues {
  title: string;
  year: string;
  price: string;
  status: string;
  category: string;
  location: string;
  latitude: string;
  longitude: string;
  airframe: string;
  engine: string;
  engineTwo: string;
  propeller: string;
  propellerTwo: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  videoUrl: string;
  overview: string;
  index: string;
  sections: Record<SectionKey, string>;
}

interface SnackState {
  open: boolean;
  msg: string;
  severity: AlertColor;
}

// helpers
const safeSecHtml = (doc: AircraftDoc | undefined, key: SectionKey): string =>
  String(doc?.description?.sections?.[key]?.html ?? '');

const docToFormDefaults = (doc: AircraftDoc = {}): FormValues => ({
  title: doc.title ?? '',
  year: String(doc.year ?? ''),
  price: String(doc.price ?? ''),
  status: doc.status ?? 'for-sale',
  category: (() => {
    const c = typeof doc.category === 'object' && doc.category?._id ? doc.category._id : doc.category;
    return c ? String(c) : '';
  })(),
  location: doc.location ?? '',
  latitude: doc.latitude ?? '',
  longitude: doc.longitude ?? '',
  airframe: doc.airframe ?? '',
  engine: doc.engine ?? '',
  engineTwo: doc.engineTwo ?? '',
  propeller: doc.propeller ?? '',
  propellerTwo: doc.propellerTwo ?? '',
  agentName: doc.contactAgent?.name ?? '',
  agentEmail: doc.contactAgent?.email ?? '',
  agentPhone: doc.contactAgent?.phone ?? '',
  videoUrl: doc.videoUrl ?? '',
  overview: doc.overview ?? '',
  index: String(doc.index ?? ''),
  sections: SECTION_KEYS.reduce((m, k) => {
    m[k] = safeSecHtml(doc, k);
    return m;
  }, {} as Record<SectionKey, string>)
});

// safe parse of server response
async function parseBody(resp: Response): Promise<unknown> {
  const ct = resp.headers.get('content-type') || '';
  if (ct.includes('application/json')) return await resp.json();
  return await resp.text();
}

// Quill dark-mode overrides
const quillDarkSx = {
  '& .ql-toolbar': {
    borderColor: 'rgba(255,255,255,0.12) !important',
    '& .ql-stroke': { stroke: 'rgba(255,255,255,0.7) !important' },
    '& .ql-fill': { fill: 'rgba(255,255,255,0.7) !important' },
    '& .ql-picker-label': { color: 'rgba(255,255,255,0.7) !important' },
    '& .ql-picker-options': { backgroundColor: '#112220 !important', border: '1px solid rgba(255,255,255,0.12) !important' },
    '& .ql-picker-item': { color: 'rgba(255,255,255,0.7) !important' },
  },
  '& .ql-container': {
    borderColor: 'rgba(255,255,255,0.12) !important',
    color: 'rgba(255,255,255,0.87)',
    fontSize: 14,
  },
  '& .ql-editor.ql-blank::before': {
    color: 'rgba(255,255,255,0.4) !important',
  },
};

// ── Section Card ────────────────────────────────────────────────
function SectionCard({ title, children, sx }: { title?: string; children: React.ReactNode; sx?: object }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      p: 3,
      ...(isDark ? quillDarkSx : {}),
      ...sx,
    }}>
      {title && (
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: theme.palette.text.primary, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}

// ── Field Row ───────────────────────────────────────────────────
function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${React.Children.count(children)}, 1fr)` }, gap: 2 }}>
      {children}
    </Box>
  );
}

interface EditJetProps {
  id: string;
}

export default function EditJet({ id }: EditJetProps) {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SectionKey>('general');

  // gallery images
  const [imagesLocal, setImagesLocal] = useState<File[]>([]);
  const [imagesExisting, setImagesExisting] = useState<string[]>([]);

  // featured image
  const [featuredExisting, setFeaturedExisting] = useState<string | null>(null);
  const [featuredLocal, setFeaturedLocal] = useState<File | null>(null);
  const featuredInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [snack, setSnack] = useState<SnackState>({ open: false, msg: '', severity: 'success' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const defaultSectionState = useMemo(() => {
    const m: Record<SectionKey, string> = {} as Record<SectionKey, string>;
    SECTION_KEYS.forEach((k) => (m[k] = ''));
    return m;
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      ...docToFormDefaults(),
      sections: defaultSectionState
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAircraftCategories();
        if (response?.success) {
          setCategories(response?.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch detail + prefill
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/aircrafts/lists/${id}`);
        const json = await resp.json();
        if (!resp.ok || json?.success === false) throw new Error(json?.message || 'Failed to fetch aircraft');
        const doc: AircraftDoc = json.data || {};
        if (!alive) return;
        reset(docToFormDefaults(doc));
        setImagesExisting(Array.isArray(doc.images) ? doc.images : []);
        setFeaturedExisting(doc?.featuredImage || null);
      } catch (e) {
        if (alive) setSnack({ open: true, severity: 'error', msg: (e as Error).message });
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, reset]);

  // ensure a safe default if API ever returns blank status
  useEffect(() => {
    setValue('status', 'for-sale');
  }, [setValue]);

  // Soft delete — confirmation via dialog
  const handleSoftDelete = async () => {
    setDeleting(true);
    try {
      const resp = await fetch(`${API_BASE}/api/aircrafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: true }),
      });
      const json = await resp.json();
      if (!resp.ok || json?.success === false) throw new Error(json?.message || 'Failed to delete');
      setDeleteDialogOpen(false);
      setSnack({ open: true, severity: 'success', msg: '✅ Aircraft removed from the showroom.' });
      setTimeout(() => router.push('/aircraft'), 1500);
    } catch (e) {
      setSnack({ open: true, severity: 'error', msg: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  };

  // gallery file selection
  const onImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImagesLocal((prev) => [...prev, ...files]);
  };
  const removeLocalImage = (idx: number) => setImagesLocal((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx: number) => setImagesExisting((prev) => prev.filter((_, i) => i !== idx));

  // drag & drop reordering for existing images
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const onDragStart = (idx: number) => {
    dragIdx.current = idx;
  };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current !== null && dragIdx.current !== idx) {
      setDragOverIdx(idx);
    }
  };
  const onDragLeave = () => setDragOverIdx(null);
  const onDrop = (idx: number) => {
    const from = dragIdx.current;
    if (from === null || from === idx) { dragIdx.current = null; setDragOverIdx(null); return; }
    setImagesExisting((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    dragIdx.current = null;
    setDragOverIdx(null);
  };
  const onDragEnd = () => { dragIdx.current = null; setDragOverIdx(null); };

  // featured handlers
  const onFeaturedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files && e.target.files[0]) || null;
    setFeaturedLocal(file || null);
  };
  const clearFeaturedLocal = () => {
    setFeaturedLocal(null);
    if (featuredInputRef.current) featuredInputRef.current.value = '';
  };

  // Submit → UPDATE
  const onSubmit = async (values: FormValues) => {
    try {
      setUploading(true);

      const description = {
        version: 1,
        sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, { html: values.sections[k] || '' }]))
      };
      const contactAgent = {
        name: values.agentName || '',
        email: values.agentEmail || '',
        phone: values.agentPhone || ''
      };

      const fd = new FormData();
      fd.append('title', values.title);
      fd.append('year', String(values.year || ''));
      fd.append('price', String(values.price || ''));
      fd.append('status', values.status);
      fd.append('category', values.category);
      fd.append('location', values.location);
      fd.append('latitude', String(values.latitude || ''));
      fd.append('longitude', String(values.longitude || ''));
      fd.append('overview', values.overview);
      fd.append('videoUrl', values.videoUrl);
      if (values.airframe) fd.append('airframe', String(values.airframe));
      if (values.engine) fd.append('engine', String(values.engine));
      if (values.engineTwo) fd.append('engineTwo', String(values.engineTwo));
      if (values.propeller) fd.append('propeller', String(values.propeller));
      if (values.propellerTwo) fd.append('propellerTwo', String(values.propellerTwo));
      fd.append('contactAgent', JSON.stringify(contactAgent));
      fd.append('description', JSON.stringify(description));
      fd.append('index', String(values.index));

      // gallery images
      fd.append('keepImages', JSON.stringify(imagesExisting));
      imagesLocal.forEach((f) => fd.append('images', f));

      // featured image (replace only if a new one is chosen)
      if (featuredLocal) {
        fd.append('featuredImage', featuredLocal);
      }

      const resp = await fetch(`${API_BASE}/api/aircrafts/update/${id}`, {
        method: 'PUT',
        headers: { Accept: 'application/json' },
        body: fd
      });

      const body = await parseBody(resp);
      if (!resp.ok) {
        const msg = typeof body === 'string' ? body.slice(0, 300) : (body as { message?: string })?.message || JSON.stringify(body);
        throw new Error(msg || `Request failed (${resp.status})`);
      }

      setSnack({ open: true, severity: 'success', msg: 'Aircraft updated successfully' });
      setImagesLocal([]);
      clearFeaturedLocal();
    } catch (e) {
      setSnack({ open: true, severity: 'error', msg: (e as Error).message });
    } finally {
      setUploading(false);
    }
  };

  // label overlap fix
  const tf = {
    variant: 'outlined' as const,
    InputLabelProps: { shrink: true, sx: { fontSize: 15 } },
    size: 'medium' as const,
  };

  const imgThumbStyle: React.CSSProperties = {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    display: 'block',
    borderRadius: 6,
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      {uploading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}


      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 700px' }, gap: 2, alignItems: 'start' }}>

          {/* ════════════════ LEFT COLUMN ════════════════ */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Row 1: Title */}
            <SectionCard title="Basic Information">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Title"
                  id="title"
                  fullWidth
                  required
                  {...tf}
                  {...register('title', { required: true })}
                  error={!!errors.title}
                  helperText={errors.title ? 'Required' : ''}
                />
                {/* Row 2: Year, Price, Make */}
                <FieldRow>
                  <TextField label="Year" id="year" type="number" fullWidth {...tf} {...register('year')} />
                  <TextField label="Price" id="price" type="number" fullWidth required {...tf} {...register('price', { required: true })} />
                  <Controller
                    name="category"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField select label="Make" id="category" fullWidth {...tf} {...field}>
                        {categories?.map((s) => (
                          <MenuItem key={s?._id} value={String(s?._id)}>{s?.name}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </FieldRow>
              </Box>
            </SectionCard>

            {/* Row 3: Location */}
            <SectionCard title="Location">
              <FieldRow>
                <TextField label="Location" id="location" fullWidth required {...tf} {...register('location', { required: true })} />
                <TextField label="Latitude" id="latitude" fullWidth {...tf} {...register('latitude')} />
                <TextField label="Longitude" id="longitude" fullWidth {...tf} {...register('longitude')} />
              </FieldRow>
            </SectionCard>

            {/* Row 4: Airframe & Engines */}
            <SectionCard title="Mechanical">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <FieldRow>
                  <TextField label="Airframe" id="airframe" type="number" fullWidth {...tf} {...register('airframe')} />
                  <TextField label="Engine One" id="engine" type="number" fullWidth {...tf} {...register('engine')} />
                  <TextField label="Engine Two" id="engineTwo" type="number" fullWidth {...tf} {...register('engineTwo')} />
                </FieldRow>
                {/* Row 5: Propellers & Status */}
                <FieldRow>
                  <TextField label="Propeller One" id="propeller" type="number" fullWidth {...tf} {...register('propeller')} />
                  <TextField label="Propeller Two" id="propellerTwo" type="number" fullWidth {...tf} {...register('propellerTwo')} />
                  <Controller
                    name="status"
                    control={control}
                    defaultValue="for-sale"
                    render={({ field }) => (
                      <TextField select label="Status" id="status" fullWidth {...tf} {...field}>
                        {STATUS.map((s) => (
                          <MenuItem key={s} value={s}>{s.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </FieldRow>
              </Box>
            </SectionCard>

            {/* Row 6: Contact Agent */}
            <SectionCard title="Contact Agent">
              <FieldRow>
                <TextField label="Current Agent" id="agentName" fullWidth {...tf} {...register('agentName')} />
                <TextField label="Email" type="email" id="agentEmail" fullWidth {...tf} {...register('agentEmail')} />
                <TextField label="Phone" id="agentPhone" fullWidth {...tf} {...register('agentPhone')} />
              </FieldRow>
            </SectionCard>

            {/* Row 7: Overview */}
            <SectionCard title="Jet Overview">
              <Controller
                control={control}
                name="overview"
                render={({ field }) => (
                  <ReactQuill theme="snow" value={field.value || ''} onChange={field.onChange} placeholder="Write overview here..." />
                )}
              />
            </SectionCard>

            {/* Row 8: Description with tabs */}
            <SectionCard title="Description">
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
                sx={{
                  mb: 2,
                  minHeight: 36,
                  '& .MuiTab-root': { minHeight: 36, fontSize: 13, textTransform: 'capitalize', px: 2 },
                }}
              >
                {SECTION_KEYS.map((k) => (
                  <Tab key={k} value={k} label={SECTION_LABELS[k]} />
                ))}
              </Tabs>
              {SECTION_KEYS.map((k) => (
                <div key={k} hidden={activeTab !== k}>
                  <Controller
                    control={control}
                    name={`sections.${k}`}
                    render={({ field }) => (
                      <ReactQuill
                        theme="snow"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder={`Write ${SECTION_LABELS[k]} details here...`}
                      />
                    )}
                  />
                </div>
              ))}
            </SectionCard>

            {/* Index */}
            <SectionCard title="Listing Settings">
              <TextField label="List Index" id="index" type="number" fullWidth {...tf} {...register('index')} />
            </SectionCard>
          </Box>

          {/* ════════════════ RIGHT COLUMN ════════════════ */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: { lg: 'sticky' }, top: { lg: 16 } }}>

            {/* Video URL */}
            <SectionCard title="Video">
              <TextField label="Video URL" id="videoUrl" type="text" fullWidth {...tf} {...register('videoUrl')} />
            </SectionCard>

            {/* Featured Image */}
            <SectionCard title="Featured Image">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Button variant="contained" component="label" size="small" startIcon={<UploadIcon />} sx={{ textTransform: 'none', fontSize: 13 }}>
                  {featuredLocal ? 'Change' : 'Upload'}
                  <input id="featured-image-upload" ref={featuredInputRef} hidden accept="image/*" type="file" onChange={onFeaturedChange} />
                </Button>
                <Chip size="small" label={featuredLocal ? '1 new' : featuredExisting ? 'Existing' : 'None'} />
                {featuredLocal && (
                  <IconButton size="small" color="error" onClick={clearFeaturedLocal}><DeleteIcon fontSize="small" /></IconButton>
                )}
              </Box>
              {(featuredLocal || featuredExisting) && (
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                  <img
                    src={featuredLocal ? URL.createObjectURL(featuredLocal) : (featuredExisting || '')}
                    alt="Featured"
                    style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              )}
            </SectionCard>

            {/* Gallery Images */}
            <SectionCard title="Gallery Images">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Button variant="contained" component="label" size="small" startIcon={<UploadIcon />} sx={{ textTransform: 'none', fontSize: 13 }}>
                  Add Images
                  <input id="gallery-images-upload" hidden accept="image/*" type="file" multiple onChange={onImagesChange} />
                </Button>
                <Chip size="small" label={`${imagesExisting.length + imagesLocal.length} total`} />
              </Box>

              {/* Existing images — draggable */}
              {imagesExisting.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5, mb: imagesLocal.length > 0 ? 2 : 0 }}>
                  {imagesExisting.map((url, idx) => (
                    <Box
                      key={url + idx}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e: React.DragEvent) => onDragOver(e, idx)}
                      onDragLeave={onDragLeave}
                      onDrop={() => onDrop(idx)}
                      onDragEnd={onDragEnd}
                      sx={{
                        position: 'relative', borderRadius: 2, overflow: 'hidden',
                        border: dragOverIdx === idx ? '2px solid #1777cb' : `1px solid ${theme.palette.divider}`,
                        opacity: dragIdx.current === idx ? 0.5 : 1,
                        cursor: 'grab',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        boxShadow: dragOverIdx === idx ? '0 0 12px rgba(23,119,203,0.4)' : 'none',
                        '&:active': { cursor: 'grabbing' },
                      }}
                    >
                      <img src={url} alt={`img-${idx}`} style={imgThumbStyle} />
                      {/* Serial number chip */}
                      <Chip
                        size="small"
                        label={`#${idx + 1}`}
                        sx={{
                          position: 'absolute', top: 6, left: 6,
                          backgroundColor: 'rgba(23,119,203,0.9)', color: '#fff',
                          fontWeight: 700, fontSize: 11, height: 22, minWidth: 28,
                          '& .MuiChip-label': { px: 0.8 },
                        }}
                      />
                      {/* Drag handle */}
                      <Box sx={{
                        position: 'absolute', bottom: 6, left: 6,
                        backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 1,
                        display: 'flex', alignItems: 'center', p: 0.25,
                      }}>
                        <DragIndicatorIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeExistingImage(idx)}
                        sx={{
                          position: 'absolute', top: 6, right: 6,
                          backgroundColor: 'rgba(0,0,0,0.6)', color: '#ef4444',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                          width: 28, height: 28,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* New images */}
              {imagesLocal.length > 0 && (
                <>
                  <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mb: 1 }}>New uploads:</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                    {imagesLocal.map((f, idx) => (
                      <Box key={idx} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                        <img src={URL.createObjectURL(f)} alt={f.name} style={imgThumbStyle} />
                        <IconButton
                          size="small"
                          onClick={() => removeLocalImage(idx)}
                          sx={{
                            position: 'absolute', top: 6, right: 6,
                            backgroundColor: 'rgba(0,0,0,0.6)', color: '#ef4444',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                            width: 28, height: 28,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, px: 1, py: 0.5, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                          <Typography sx={{ fontSize: 11, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </SectionCard>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                type="submit"
                endIcon={<SendIcon />}
                disabled={uploading}
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 14, py: 1.25, borderRadius: 2 }}
              >
                {uploading ? 'Saving…' : 'Update Aircraft'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => reset()}
                sx={{ textTransform: 'none', fontWeight: 500, fontSize: 14, py: 1.25, borderRadius: 2, minWidth: 90 }}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                startIcon={<DeleteIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  py: 1.25,
                  borderRadius: 2,
                  minWidth: 110,
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>

        </Box>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={deleting ? undefined : () => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Aircraft</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this aircraft? It will be removed from the showroom and the aircraft list.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting} variant="outlined" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSoftDelete}
            disabled={deleting}
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
