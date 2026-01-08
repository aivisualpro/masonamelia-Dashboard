'use client';

import React, { useMemo, useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Box,
  Grid,
  Paper,
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
  AlertColor
} from '@mui/material';
import { Delete as DeleteIcon, Upload as UploadIcon, Send as SendIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { getAircraftCategories } from '@/api/aircraftCategory.api';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const STATUS = ['for-sale', 'sold', 'wanted', 'coming-soon', 'sale-pending', 'off-market', 'acquired'];
const SECTION_KEYS = ['airframe', 'engine', 'propeller', 'avionics', 'equipment', 'interior', 'exterior', 'inspection'] as const;
type SectionKey = typeof SECTION_KEYS[number];

const SECTION_LABELS: Record<SectionKey, string> = {
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

interface EditJetProps {
  id: string;
}

export default function EditJet({ id }: EditJetProps) {
  const [activeTab, setActiveTab] = useState<SectionKey>('airframe');

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

  // gallery file selection
  const onImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImagesLocal((prev) => [...prev, ...files]);
  };
  const removeLocalImage = (idx: number) => setImagesLocal((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx: number) => setImagesExisting((prev) => prev.filter((_, i) => i !== idx));

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
      // Redirect after success
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/jets';
        }, 700);
      }
    } catch (e) {
      setSnack({ open: true, severity: 'error', msg: (e as Error).message });
    } finally {
      setUploading(false);
    }
  };

  // label overlap fix
  const tf = { variant: 'outlined' as const, InputLabelProps: { shrink: true } };

  return (
    <Box className="min-h-screen text-[#111218]">
      {uploading && <LinearProgress className="mb-4" />}

      <div className="border rounded-2xl p-6 mx-auto">
        <Typography variant="h5" className="mb-6 font-bold">
          Edit Aircraft
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Title"
                fullWidth
                required
                {...tf}
                {...register('title', { required: true })}
                error={!!errors.title}
                helperText={errors.title ? 'Required' : ''}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              {/* STATUS (controlled) */}
              <Controller
                name="status"
                control={control}
                defaultValue="for-sale"
                render={({ field }) => (
                  <TextField select label="Status" fullWidth {...tf} {...field}>
                    {STATUS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField label="Year" type="number" fullWidth {...tf} {...register('year')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Price" type="number" fullWidth required {...tf} {...register('price', { required: true })} />
            </Grid>

            <Grid item xs={12} md={4}>
              {/* CATEGORY (controlled) */}
              <Controller
                name="category"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField select label="Categories" fullWidth {...tf} {...field}>
                    {categories?.map((s) => (
                      <MenuItem key={s?._id} value={String(s?._id)}>
                        {s?.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField label="Location" fullWidth required {...tf} {...register('location', { required: true })} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Latitude" fullWidth {...tf} {...register('latitude')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Longitude" fullWidth {...tf} {...register('longitude')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Airframe" type="number" fullWidth {...tf} {...register('airframe')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Engine" type="number" fullWidth {...tf} {...register('engine')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Engine Two" type="number" fullWidth {...tf} {...register('engineTwo')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Propeller" type="number" fullWidth {...tf} {...register('propeller')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Propeller Two" type="number" fullWidth {...tf} {...register('propellerTwo')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="List Index" type="number" fullWidth {...tf} {...register('index')} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="mb-3 font-semibold">
                Jet Overview
              </Typography>
              <Controller
                control={control}
                name="overview"
                render={({ field }) => (
                  <ReactQuill theme="snow" value={field.value || ''} onChange={field.onChange} placeholder="Write Overview here..." />
                )}
              />
            </Grid>
          </Grid>

          {/* Contact Agent */}
          <div className="rounded-xl">
            <Typography variant="subtitle1" className="mb-3 font-semibold">
              Contact Agent
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="Name" fullWidth {...tf} {...register('agentName')} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Email" type="email" fullWidth {...tf} {...register('agentEmail')} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Phone" fullWidth {...tf} {...register('agentPhone')} />
              </Grid>
            </Grid>
          </div>

          {/* Description */}
          <div>
            <Typography variant="subtitle1" className="mb-2 font-semibold">
              Description
            </Typography>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
              {SECTION_KEYS.map((k) => (
                <Tab key={k} value={k} label={SECTION_LABELS[k]} />
              ))}
            </Tabs>

            <Box className="mt-4">
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
            </Box>
          </div>

          <Grid item xs={12}>
            <Typography variant="subtitle1" className="mb-4 font-semibold">
              Video URL
            </Typography>
            <TextField label="Video URL" type="text" fullWidth {...tf} {...register('videoUrl')} />
          </Grid>

          {/* Featured Image */}
          <div>
            <Typography variant="subtitle1" className="mb-2 font-semibold">
              Featured Image
            </Typography>

            <div className="flex items-center gap-3">
              <Button variant="contained" component="label" startIcon={<UploadIcon />}>
                {featuredLocal ? 'Change Featured' : 'Select Featured'}
                <input ref={featuredInputRef} hidden accept="image/*" type="file" onChange={onFeaturedChange} />
              </Button>
              <Chip label={featuredLocal ? '1 new selected' : featuredExisting ? 'Using existing' : 'None'} />
              {featuredLocal && (
                <Button size="small" variant="text" color="error" onClick={clearFeaturedLocal} startIcon={<DeleteIcon />}>
                  Remove New
                </Button>
              )}
            </div>

            {/* Preview: new takes precedence, else show existing */}
            <Grid container spacing={2} className="mt-2">
              {featuredLocal ? (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Paper className="relative border rounded-xl overflow-hidden">
                    <img src={URL.createObjectURL(featuredLocal)} alt={featuredLocal.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    <Typography variant="caption" className="block p-2 truncate">
                      {featuredLocal.name}
                    </Typography>
                  </Paper>
                </Grid>
              ) : featuredExisting ? (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Paper className="relative border rounded-xl overflow-hidden">
                    <img src={featuredExisting} alt="featured" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    <Typography variant="caption" className="block p-2 truncate">
                      Existing featured
                    </Typography>
                  </Paper>
                </Grid>
              ) : null}
            </Grid>
          </div>

          {/* Gallery Images */}
          <div>
            <Typography variant="subtitle1" className="mb-2 font-semibold">
              Images
            </Typography>

            {imagesExisting.length > 0 && (
              <>
                <Typography variant="body2" className="mb-1">
                  Existing (kept unless removed):
                </Typography>
                <Grid container spacing={2} className="mb-2">
                  {imagesExisting.map((url, idx) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={url + idx}>
                      <Paper className="relative border rounded-xl overflow-hidden">
                        <img src={url} alt={`img-${idx}`} style={{ maxWidth: '100%' }} />
                        <Box className="absolute top-1 right-1 bg-black/60 rounded-md">
                          <IconButton size="small" onClick={() => removeExistingImage(idx)}>
                            <DeleteIcon fontSize="small" className="text-red-500" />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            <div className="flex items-center gap-3">
              <Button variant="contained" component="label" startIcon={<UploadIcon />}>
                Add Images
                <input hidden accept="image/*" type="file" multiple onChange={onImagesChange} />
              </Button>
              <Chip label={`${imagesLocal.length} new selected`} />
            </div>

            {imagesLocal.length > 0 && (
              <Grid container spacing={2} className="mt-2">
                {imagesLocal.map((f, idx) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={idx}>
                    <Paper className="relative border rounded-xl overflow-hidden">
                      <img src={URL.createObjectURL(f)} alt={f.name} style={{ maxWidth: '100%' }} />
                      <Box className="absolute top-1 right-1 bg-black/60 rounded-md">
                        <IconButton size="small" onClick={() => removeLocalImage(idx)}>
                          <DeleteIcon fontSize="small" className="text-red-600" />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" className="block p-2 truncate">
                        {f.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3" style={{ marginTop: '1rem' }}>
            <Button variant="contained" type="submit" endIcon={<SendIcon />} disabled={uploading}>
              Update Aircraft
            </Button>
            <Button type="button" variant="outlined" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
