'use client';

import * as React from 'react';
import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/utils/cloudinary';
import {
  Box,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRouter } from 'next/navigation';
import { purple } from '@mui/material/colors';
import AddAircraftModal from './AddAircraftModal';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/aircrafts`;
const BULK_DELETE_URL = `${API_BASE}/bulkDelete`;

const STATUS_OPTIONS = ['for-sale', 'sold', 'wanted', 'coming-soon', 'sale-pending', 'off-market', 'acquired'] as const;

const numberFmt = new Intl.NumberFormat('en-US');

interface AircraftDoc {
  _id?: string;
  id?: string;
  title?: string;
  year?: number | string;
  price?: number | string;
  status?: string;
  category?: { name?: string };
  airframe?: string;
  engine?: string;
  engineTwo?: string;
  propeller?: string;
  propellerTwo?: string;
  location?: string;
  featuredImage?: string;
  images?: string[];
  contactAgent?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface AircraftRow {
  id: string;
  image: string;
  images: string[];
  title: string;
  year: number | null;
  price: number | string | null;
  status: string;
  category: string | undefined;
  airframe: string | undefined;
  engine: string;
  propeller: string;
  location: string;
  agent: string;
  _agent: {
    name: string;
    phone: string;
    email: string;
  };
  _raw: AircraftDoc;
}

interface ConfirmState {
  open: boolean;
  mode: 'single' | 'bulk' | null;
  ids: (string | number)[];
  title: string;
}

interface CarouselState {
  open: boolean;
  images: string[];
  currentIndex: number;
  title: string;
}

/* ------------ Status Pill ------------ */
function StatusPill({ value }: { value?: string }) {
  const theme = useTheme();
  const slug = String(value || '').toLowerCase();
  const label = slug
    ? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '—';

  const pal = theme.palette;
  const tone = (key: 'success' | 'error' | 'info' | 'warning' | 'primary' | 'secondary') => ({
    bg: alpha(pal[key].main, 0.12),
    fg: pal[key].dark,
    bd: alpha(pal[key].main, 0.24)
  });

  const colors = (() => {
    switch (slug) {
      case 'for-sale': return tone('success');
      case 'sold': return tone('error');
      case 'wanted': return tone('info');
      case 'coming-soon': return tone('warning');
      case 'sale-pending': return { bg: alpha(purple[500], 0.14), fg: purple[700], bd: alpha(purple[500], 0.28) };
      case 'off-market': return { bg: alpha(pal.grey[500], 0.18), fg: pal.grey[800], bd: alpha(pal.grey[600], 0.26) };
      case 'acquired': return tone('primary');
      default: return { bg: alpha(pal.grey[400], 0.18), fg: pal.text.primary, bd: alpha(pal.grey[500], 0.26) };
    }
  })();

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        bgcolor: colors.bg,
        color: colors.fg,
        border: '1px solid',
        borderColor: colors.bd,
        borderRadius: '999px',
        fontWeight: 600,
        px: 1.25,
        height: 24
      }}
    />
  );
}

/* ------------ Per-row Status Menu ------------ */
function RowStatusMenu({ rowId, currentStatus, onUpdated }: { rowId: string; currentStatus: string; onUpdated?: (id: string, newStatus: string) => void }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [saving, setSaving] = React.useState(false);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const updateStatus = async (newStatus: string) => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('status', newStatus);
      const res = await fetch(`${API_BASE}/update/${rowId}`, { method: 'PUT', body: fd });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      onUpdated?.(rowId, newStatus);
    } finally {
      setSaving(false);
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title="Change status">
        <span style={{ display: 'inline-flex' }}>
          <IconButton size="small" onClick={handleOpen} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : <ChangeCircleIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {STATUS_OPTIONS.map((s) => (
          <MenuItem key={s} selected={s === currentStatus} onClick={() => updateStatus(s)}>
            <StatusPill value={s} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* ------------ Image Carousel Dialog ------------ */
function ImageCarouselDialog({ carousel, onClose }: { carousel: CarouselState; onClose: () => void }) {
  const [idx, setIdx] = React.useState(carousel.currentIndex);

  React.useEffect(() => {
    setIdx(carousel.currentIndex);
  }, [carousel.currentIndex]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!carousel.open) return;
      if (e.key === 'ArrowLeft') setIdx((i) => (i > 0 ? i - 1 : carousel.images.length - 1));
      if (e.key === 'ArrowRight') setIdx((i) => (i < carousel.images.length - 1 ? i + 1 : 0));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [carousel.open, carousel.images.length, onClose]);

  if (!carousel.open || !carousel.images.length) return null;

  return (
    <Dialog
      open={carousel.open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0,0,0,0.95)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 'auto',
          borderRadius: 2,
          overflow: 'hidden',
        }
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', px: 2, py: 1.5 }}>
          <Box sx={{ color: 'white', fontSize: 14, fontWeight: 500, opacity: 0.8 }}>
            {carousel.title} — {idx + 1} of {carousel.images.length}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Image */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, px: 6, pb: 3 }}>
          {carousel.images.length > 1 && (
            <IconButton
              onClick={() => setIdx((i) => (i > 0 ? i - 1 : carousel.images.length - 1))}
              sx={{ position: 'absolute', left: 8, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
          )}
          <Image
            src={optimizeCloudinaryUrl(carousel.images[idx])}
            alt={`${carousel.title} - ${idx + 1}`}
            width={1200}
            height={800}
            sizes="80vw"
            style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
          />
          {carousel.images.length > 1 && (
            <IconButton
              onClick={() => setIdx((i) => (i < carousel.images.length - 1 ? i + 1 : 0))}
              sx={{ position: 'absolute', right: 8, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          )}
        </Box>

        {/* Thumbnails */}
        {carousel.images.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 2, overflowX: 'auto', maxWidth: '80vw' }}>
            {carousel.images.map((img, i) => (
              <Box
                key={i}
                onClick={() => setIdx(i)}
                sx={{
                  width: 56,
                  height: 40,
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                  border: i === idx ? '2px solid #fff' : '2px solid transparent',
                  opacity: i === idx ? 1 : 0.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Image src={optimizeCloudinaryUrl(img)} alt="" width={56} height={40} sizes="56px" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

/* ============== MAIN TABLE ============== */
export default function AircraftTable({ initialData }: { initialData?: AircraftDoc[] }) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(!initialData?.length);
  const [aircrafts, setAircrafts] = React.useState<AircraftDoc[]>(initialData || []);
  const [confirm, setConfirm] = React.useState<ConfirmState>({ open: false, mode: null, ids: [], title: '' });
  const [deleting, setDeleting] = React.useState(false);
  const [carousel, setCarousel] = React.useState<CarouselState>({ open: false, images: [], currentIndex: 0, title: '' });
  const [visibleCount, setVisibleCount] = React.useState(20);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);

  // Listen for header button event
  React.useEffect(() => {
    const handler = () => setAddOpen(true);
    window.addEventListener('open-add-aircraft', handler);
    return () => window.removeEventListener('open-add-aircraft', handler);
  }, []);

  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/lists/admin?page=1&pageSize=1000`);
      const json = await res.json();
      setAircrafts(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Skip initial fetch if server-side data was provided
    if (initialData?.length) return;
    fetchRows();
  }, [fetchRows, initialData]);

  const handleStatusUpdated = React.useCallback((id: string, newStatus: string) => {
    setAircrafts((prev) =>
      (prev || []).map((d) => {
        const docId = d._id || d.id;
        return String(docId) === String(id) ? { ...d, status: newStatus } : d;
      })
    );
  }, []);

  const rows: AircraftRow[] = React.useMemo(() => {
    return (aircrafts || []).map((d) => {
      const toNum = (v: unknown): number | null => (v === undefined || v === null || v === '' ? null : Number(v));
      const allImages: string[] = [];
      if (d.featuredImage) allImages.push(d.featuredImage);
      if (Array.isArray(d.images)) allImages.push(...d.images.filter((img) => img && img !== d.featuredImage));

      return {
        id: d._id || d.id || '',
        image: d.featuredImage || '',
        images: allImages,
        title: d.title ?? '',
        year: toNum(d.year),
        price: d.price ? toNum(d.price) : 'Call',
        status: d.status ?? '',
        category: d.category?.name,
        airframe: d.airframe,
        engine: `${d.engineTwo ? `${d.engine} / ${d.engineTwo}` : `${d.engine}`}`,
        propeller: `${d.propellerTwo ? `${d.propeller} / ${d.propellerTwo}` : `${d.propeller}`}`,
        location: d.location ? d.location : 'Not Defined',
        agent: d.contactAgent?.name || d.contactAgent?.email || '',
        _agent: {
          name: d.contactAgent?.name || '',
          phone: d.contactAgent?.phone || '',
          email: d.contactAgent?.email || ''
        },
        _raw: d
      };
    });
  }, [aircrafts]);

  const visibleRows = React.useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = visibleCount < rows.length;

  // Infinite scroll via IntersectionObserver
  React.useEffect(() => {
    if (!sentinelRef.current || !scrollContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setVisibleCount((prev) => Math.min(prev + 20, rows.length));
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, rows.length]);

  const openConfirmSingle = React.useCallback((row: AircraftRow) => setConfirm({ open: true, mode: 'single', ids: [row.id], title: row.title || '' }), []);
  const closeConfirm = React.useCallback(() => setConfirm((c) => ({ ...c, open: false })), []);

  const handleConfirmDelete = async () => {
    if (!confirm.ids.length) return;
    setDeleting(true);
    try {
      if (confirm.mode === 'single') {
        await fetch(`${API_BASE}/delete/${confirm.ids[0]}`, { method: 'DELETE' });
      } else {
        await fetch(BULK_DELETE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: confirm.ids })
        });
      }
      await fetchRows();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
      closeConfirm();
    }
  };

  const openCarousel = React.useCallback((row: AircraftRow) => {
    const imgs = row.images.length > 0 ? row.images : (row.image ? [row.image] : []);
    if (imgs.length === 0) return;
    setCarousel({ open: true, images: imgs, currentIndex: 0, title: row.title });
  }, []);

  const closeCarousel = React.useCallback(() => setCarousel((c) => ({ ...c, open: false })), []);

  const isDark = theme.palette.mode === 'dark';

  const thStyle: React.CSSProperties = {
    height: 40,
    padding: '0 16px',
    textAlign: 'left',
    verticalAlign: 'middle',
    fontWeight: 500,
    fontSize: 12,
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 16px',
    verticalAlign: 'middle',
    fontSize: 13,
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <Box sx={{
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}>
        {/* Table scroll area */}
        <Box ref={scrollContainerRef} sx={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10 }}>Title</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 88 }}>Image</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 70 }}>Year</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 110 }}>Price</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 120 }}>Status</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 110 }}>Category</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 110 }}>Airframe</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 110 }}>Engine</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 160 }}>Location</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, zIndex: 10, width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ ...tdStyle, textAlign: 'center', height: 200, borderBottom: 'none' }}>
                    <CircularProgress size={28} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ ...tdStyle, textAlign: 'center', height: 200, borderBottom: 'none', color: theme.palette.text.secondary }}>
                    No aircraft found.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    style={{ transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <td
                      style={{ ...tdStyle, fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => router.push(`/jets/edit/${row.id}`)}
                    >{row.title}</td>
                    <td style={{ ...tdStyle, padding: '6px 16px', width: 88 }}>
                      {row.image ? (
                        <Image
                          src={optimizeCloudinaryUrl(row.image)}
                          alt={row.title}
                          width={64}
                          height={40}
                          sizes="64px"
                          onClick={() => openCarousel(row)}
                          style={{
                            height: 40,
                            width: 64,
                            objectFit: 'cover',
                            borderRadius: 4,
                            cursor: 'pointer',
                            transition: 'opacity 0.15s ease',
                          }}
                        />
                      ) : (
                        <span style={{ color: theme.palette.text.disabled, fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, width: 70 }}>{row.year || '—'}</td>
                    <td style={{ ...tdStyle, width: 110 }}>{row.price && row.price !== 'Call' ? `$${numberFmt.format(Number(row.price))}` : 'Call'}</td>
                    <td style={{ ...tdStyle, width: 120 }}><StatusPill value={row.status} /></td>
                    <td style={{ ...tdStyle, width: 110 }}>{row.category || '—'}</td>
                    <td style={{ ...tdStyle, width: 110 }}>{row.airframe || '—'}</td>
                    <td style={{ ...tdStyle, width: 110 }}>{row.engine || '—'}</td>
                    <td style={{ ...tdStyle, width: 160 }}>{row.location || '—'}</td>
                    <td style={{ ...tdStyle, width: 100 }}>
                      <Stack direction="row" spacing={0.25}>
                        <Tooltip title="View on site">
                          <a href={`https://masonamelia.vercel.app/showroom/${row.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex' }}>
                            <IconButton size="small"><RemoveRedEyeIcon fontSize="small" /></IconButton>
                          </a>
                        </Tooltip>
                        <RowStatusMenu rowId={row.id} currentStatus={row.status} onUpdated={handleStatusUpdated} />
                      </Stack>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Infinite scroll sentinel */}
          {hasMore && !loading && (
            <div ref={sentinelRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={20} />
            </div>
          )}
        </Box>

        {/* Footer — inside the bordered container */}
        {!loading && rows.length > 0 && (
          <Box sx={{
            flexShrink: 0,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            fontSize: 13,
            color: theme.palette.text.secondary,
          }}>
            <span>
              Showing <strong style={{ color: theme.palette.text.primary }}>{visibleRows.length}</strong> of <strong style={{ color: theme.palette.text.primary }}>{rows.length}</strong> aircraft
            </span>
            {hasMore && (
              <span style={{ fontSize: 12, opacity: 0.6 }}>Scroll down to load more</span>
            )}
          </Box>
        )}
      </Box>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirm.open} onClose={deleting ? undefined : closeConfirm}>
        <DialogTitle>
          {confirm.mode === 'single' ? `Delete "${confirm.title}"?` : `Delete ${confirm.ids.length} selected item(s)?`}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete {confirm.mode === 'single' ? 'this item' : 'these items'}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={deleting} variant="outlined">Cancel</Button>
          <Button onClick={handleConfirmDelete} disabled={deleting} color="error" variant="contained">
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Carousel Dialog */}
      <ImageCarouselDialog carousel={carousel} onClose={closeCarousel} />

      {/* Add Aircraft Modal */}
      <AddAircraftModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={fetchRows} />
    </>
  );
}
