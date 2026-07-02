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
  CircularProgress,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Badge,
  FormControl,
  InputLabel,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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
  model?: string;
  year?: number | string;
  price?: number | string;
  status?: string;
  index?: number | string;
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
  index: number | null;
  image: string;
  images: string[];
  title: string;
  model: string;
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

type SortKey = 'index' | 'title' | 'model' | 'year' | 'price' | 'status' | 'category' | 'airframe' | 'location';
type SortDir = 'asc' | 'desc';

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
  const [sortKey, setSortKey] = React.useState<SortKey | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // ── Filter state ──
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string[]>([]);
  const [filterMake, setFilterMake] = React.useState<string[]>([]);
  const [filterModel, setFilterModel] = React.useState<string[]>([]);
  const [filterYear, setFilterYear] = React.useState<string[]>([]);

  // ── Drag & drop state ──
  const dragRowId = React.useRef<string | null>(null);
  const dragOverRowId = React.useRef<string | null>(null);
  const [dragActiveId, setDragActiveId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [savingOrder, setSavingOrder] = React.useState(false);
  // Tracks the drag-reordered sequence of IDs; overrides sort pipeline when set
  const [customOrderIds, setCustomOrderIds] = React.useState<string[] | null>(null);

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
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`Aircraft list fetch failed (${res.status}):`, errText);
        return;
      }
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

  // ── Drag & Drop handlers ──
  const handleDragStart = React.useCallback((e: React.DragEvent, id: string) => {
    dragRowId.current = id;
    setDragActiveId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // required for Firefox
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverRowId.current !== id) {
      dragOverRowId.current = id;
      setDragOverId(id);
    }
  }, []);

  const handleDragEnd = React.useCallback(() => {
    setDragActiveId(null);
    setDragOverId(null);
  }, []);

  // handleDrop is defined after filteredRows below

  const rows: AircraftRow[] = React.useMemo(() => {
    return (aircrafts || []).map((d) => {
      const toNum = (v: unknown): number | null => (v === undefined || v === null || v === '' ? null : Number(v));
      const allImages: string[] = [];
      if (d.featuredImage) allImages.push(d.featuredImage);
      if (Array.isArray(d.images)) allImages.push(...d.images.filter((img) => img && img !== d.featuredImage));

      return {
        id: d._id || d.id || '',
        index: toNum(d.index),
        image: d.featuredImage || '',
        images: allImages,
        title: d.title ?? '',
        model: d.model || d.title || '',
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

  // Sorting logic — bypassed when customOrderIds is active
  const sortedRows = React.useMemo(() => {
    // If user has set a drag order, skip sorting and use that order
    if (customOrderIds) {
      const idxMap = new Map(customOrderIds.map((id, i) => [id, i]));
      return [...rows].sort((a, b) => {
        const ai = idxMap.has(a.id) ? idxMap.get(a.id)! : 999999;
        const bi = idxMap.has(b.id) ? idxMap.get(b.id)! : 999999;
        return ai - bi;
      });
    }
    if (!sortKey) return rows;
    const sorted = [...rows].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      switch (sortKey) {
        case 'index':
          aVal = a.index ?? Infinity;
          bVal = b.index ?? Infinity;
          return aVal - bVal;
        case 'title':
          aVal = (a.title || '').toLowerCase();
          bVal = (b.title || '').toLowerCase();
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        case 'year':
          aVal = a.year ?? 0;
          bVal = b.year ?? 0;
          return aVal - bVal;
        case 'price':
          aVal = typeof a.price === 'number' ? a.price : Infinity;
          bVal = typeof b.price === 'number' ? b.price : Infinity;
          return aVal - bVal;
        case 'status':
          aVal = (a.status || '').toLowerCase();
          bVal = (b.status || '').toLowerCase();
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        case 'model':
          aVal = (a.model || '').toLowerCase();
          bVal = (b.model || '').toLowerCase();
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        case 'airframe':
          aVal = (a.airframe || '').toLowerCase();
          bVal = (b.airframe || '').toLowerCase();
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        case 'location':
          aVal = (a.location || '').toLowerCase();
          bVal = (b.location || '').toLowerCase();
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        default:
          return 0;
      }
    });
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [rows, sortKey, sortDir, customOrderIds]);

  const handleSort = React.useCallback((key: SortKey) => {
    // Clicking a sort column clears any custom drag order
    setCustomOrderIds(null);
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);


  // ── Cascading filter helpers ──
  // For each dropdown, compute options from rows filtered by ALL OTHER active filters.
  // This ensures you can never pick an impossible combination.
  const applySearch = React.useCallback((list: AircraftRow[]) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) =>
      [r.title, r.model, r.status, r.category, r.location]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [searchTerm]);

  const applyFilter = React.useCallback((list: AircraftRow[], exclude?: 'status' | 'make' | 'model' | 'year') => {
    let result = list;
    if (exclude !== 'status' && filterStatus.length) result = result.filter((r) => filterStatus.includes(r.status));
    if (exclude !== 'make' && filterMake.length) result = result.filter((r) => filterMake.includes(r.category || ''));
    if (exclude !== 'model' && filterModel.length) result = result.filter((r) => filterModel.includes(r.model || ''));
    if (exclude !== 'year' && filterYear.length) result = result.filter((r) => filterYear.includes(String(r.year || '')));
    return result;
  }, [filterStatus, filterMake, filterModel, filterYear]);

  const filteredRows = React.useMemo(() => {
    return applyFilter(applySearch(sortedRows));
  }, [sortedRows, applySearch, applyFilter]);

  // Cascading options: each dropdown shows only values possible given the OTHER filters
  const searchedRows = React.useMemo(() => applySearch(sortedRows), [applySearch, sortedRows]);
  const uniqueStatuses = React.useMemo(() =>
    [...new Set(applyFilter(searchedRows, 'status').map((r) => r.status).filter(Boolean))].sort(),
  [searchedRows, applyFilter]);
  const uniqueMakes = React.useMemo(() =>
    [...new Set(applyFilter(searchedRows, 'make').map((r) => r.category).filter(Boolean) as string[])].sort(),
  [searchedRows, applyFilter]);
  const uniqueModels = React.useMemo(() =>
    [...new Set(applyFilter(searchedRows, 'model').map((r) => r.model).filter(Boolean))].sort(),
  [searchedRows, applyFilter]);
  const uniqueYears = React.useMemo(() =>
    [...new Set(applyFilter(searchedRows, 'year').map((r) => String(r.year || '')).filter((y) => y && y !== ''))].sort((a, b) => Number(b) - Number(a)),
  [searchedRows, applyFilter]);

  const activeFilterCount = (filterStatus.length > 0 ? 1 : 0) + (filterMake.length > 0 ? 1 : 0) + (filterModel.length > 0 ? 1 : 0) + (filterYear.length > 0 ? 1 : 0);
  const clearAllFilters = () => { setFilterStatus([]); setFilterMake([]); setFilterModel([]); setFilterYear([]); };

  const visibleRows = React.useMemo(() => filteredRows.slice(0, visibleCount), [filteredRows, visibleCount]);
  const hasMore = visibleCount < filteredRows.length;

  // handleDrop lives here so it can close over filteredRows (current visual order)
  const handleDrop = React.useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = dragRowId.current;
    dragRowId.current = null;
    dragOverRowId.current = null;
    setDragActiveId(null);
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;

    // Reorder the VISUAL list (what the user sees), not the raw aircrafts state
    const visual = [...filteredRows];
    const fromIdx = visual.findIndex((r) => r.id === fromId);
    const toIdx = visual.findIndex((r) => r.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = visual.splice(fromIdx, 1);
    visual.splice(toIdx, 0, moved);

    // 1. Set custom order so the pipeline renders in drag order (overrides sortKey)
    setCustomOrderIds(visual.map((r) => r.id));

    // 2. Update aircraft state optimistically with new indices
    const newIndexMap = new Map(visual.map((r, i) => [r.id, i + 1]));
    setAircrafts((prev) =>
      prev.map((d) => {
        const id = d._id || d.id || '';
        return newIndexMap.has(id) ? { ...d, index: newIndexMap.get(id) } : d;
      })
    );

    // 3. Persist new indices to the API
    setSavingOrder(true);
    Promise.all(
      visual.map((r, i) => {
        const fd = new FormData();
        fd.append('index', String(i + 1));
        return fetch(`${API_BASE}/update/${r.id}`, { method: 'PUT', body: fd });
      })
    )
      .then(() => setSavingOrder(false))
      .catch((err) => { console.error('Failed to save order:', err); setSavingOrder(false); });
  }, [filteredRows]);

  // Infinite scroll via IntersectionObserver
  React.useEffect(() => {
    if (!sentinelRef.current || !scrollContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setVisibleCount((prev) => Math.min(prev + 20, filteredRows.length));
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, filteredRows.length]);

  const openConfirmSingle = React.useCallback((row: AircraftRow) => setConfirm({ open: true, mode: 'single', ids: [row.id], title: row.title || '' }), []);
  const closeConfirm = React.useCallback(() => setConfirm((c) => ({ ...c, open: false })), []);

  const handleConfirmDelete = async () => {
    if (!confirm.ids.length) return;
    setDeleting(true);
    try {
      if (confirm.mode === 'single') {
        await fetch(`${API_BASE}/${confirm.ids[0]}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDeleted: true })
        });
      } else {
        // Bulk delete via bulkDelete route or multiple PATCH calls in parallel
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
        {/* ── Search toolbar ── */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          flexShrink: 0,
        }}>
          <Box component="span" sx={{ color: theme.palette.text.disabled, display: 'flex', alignItems: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Box>
          <input
            id="aircraft-search"
            type="text"
            placeholder="Search by title, model, status, make or location…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(20); }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              color: theme.palette.text.primary,
              fontFamily: 'inherit',
            }}
          />
          {searchTerm && (
            <Box
              component="button"
              onClick={() => { setSearchTerm(''); setVisibleCount(20); }}
              sx={{
                border: 'none', background: 'none', cursor: 'pointer', px: 1, py: 0.25,
                borderRadius: 1, fontSize: 11, color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.text.primary, bgcolor: alpha(theme.palette.text.primary, 0.06) },
              }}
            >
              Clear
            </Box>
          )}
          {searchTerm && (
            <Box sx={{ fontSize: 12, color: theme.palette.text.disabled, whiteSpace: 'nowrap' }}>
              {filteredRows.length} result{filteredRows.length !== 1 ? 's' : ''}
            </Box>
          )}
          {savingOrder && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto', fontSize: 12, color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}>
              <CircularProgress size={12} />
              Saving order…
            </Box>
          )}
          <Tooltip title="Filters">
            <IconButton
              size="small"
              onClick={() => setFilterOpen((v) => !v)}
              sx={{
                ml: savingOrder ? 0 : 'auto',
                color: filterOpen || activeFilterCount > 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                bgcolor: filterOpen ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              }}
            >
              <Badge badgeContent={activeFilterCount} color="primary" overlap="circular">
                <FilterListIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Filter bar ── */}
        {filterOpen && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            flexShrink: 0,
            flexWrap: 'wrap',
          }}>
            {/* Status filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontSize: 13 }}>Status</InputLabel>
              <Select
                multiple
                value={filterStatus}
                onChange={(e) => setFilterStatus(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                input={<OutlinedInput label="Status" />}
                renderValue={(sel) => `${sel.length} selected`}
                sx={{ fontSize: 13, height: 36 }}
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {uniqueStatuses.map((s) => (
                  <MenuItem key={s} value={s} dense>
                    <Checkbox size="small" checked={filterStatus.includes(s)} />
                    <ListItemText primary={<StatusPill value={s} />} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Make filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontSize: 13 }}>Make</InputLabel>
              <Select
                multiple
                value={filterMake}
                onChange={(e) => setFilterMake(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                input={<OutlinedInput label="Make" />}
                renderValue={(sel) => `${sel.length} selected`}
                sx={{ fontSize: 13, height: 36 }}
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {uniqueMakes.map((m) => (
                  <MenuItem key={m} value={m} dense>
                    <Checkbox size="small" checked={filterMake.includes(m)} />
                    <ListItemText primary={m} primaryTypographyProps={{ fontSize: 13 }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Model filter */}
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel sx={{ fontSize: 13 }}>Model</InputLabel>
              <Select
                multiple
                value={filterModel}
                onChange={(e) => setFilterModel(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                input={<OutlinedInput label="Model" />}
                renderValue={(sel) => `${sel.length} selected`}
                sx={{ fontSize: 13, height: 36 }}
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {uniqueModels.map((m) => (
                  <MenuItem key={m} value={m} dense>
                    <Checkbox size="small" checked={filterModel.includes(m)} />
                    <ListItemText primary={m} primaryTypographyProps={{ fontSize: 13 }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontSize: 13 }}>Year</InputLabel>
              <Select
                multiple
                value={filterYear}
                onChange={(e) => setFilterYear(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                input={<OutlinedInput label="Year" />}
                renderValue={(sel) => `${sel.length} selected`}
                sx={{ fontSize: 13, height: 36 }}
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {uniqueYears.map((y) => (
                  <MenuItem key={y} value={y} dense>
                    <Checkbox size="small" checked={filterYear.includes(y)} />
                    <ListItemText primary={y} primaryTypographyProps={{ fontSize: 13 }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {activeFilterCount > 0 && (
              <Box
                component="button"
                onClick={clearAllFilters}
                sx={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 12, color: theme.palette.error.main, fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Clear all
              </Box>
            )}
            <Box sx={{ fontSize: 12, color: theme.palette.text.disabled, ml: 'auto' }}>
              {filteredRows.length} of {rows.length} aircraft
            </Box>
          </Box>
        )}

        {/* Table scroll area */}
        <Box ref={scrollContainerRef} sx={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { key: null, label: '', width: 36 }, // drag handle
                  { key: 'index' as SortKey, label: '#', width: 54 },
                  { key: 'title' as SortKey, label: 'Title', width: undefined },
                  { key: null, label: 'Image', width: 88 },
                  { key: 'year' as SortKey, label: 'Year', width: 70 },
                  { key: 'price' as SortKey, label: 'Price', width: 110 },
                  { key: 'status' as SortKey, label: 'Status', width: 120 },
                  { key: 'category' as SortKey, label: 'Make', width: 110 },
                  { key: 'model' as SortKey, label: 'Model', width: 130 },
                  { key: 'airframe' as SortKey, label: 'Airframe', width: 110 },
                  { key: null, label: 'Engine', width: 110 },
                  { key: 'location' as SortKey, label: 'Location', width: 160 },
                  { key: null, label: 'Actions', width: 100 },
                ].map((col, ci) => (
                  <th
                    key={ci}
                    style={{
                      ...thStyle,
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      width: col.width,
                      cursor: col.key ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    onClick={col.key ? () => handleSort(col.key!) : undefined}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {col.key && sortKey === col.key && (
                        sortDir === 'asc'
                          ? <ArrowUpwardIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                          : <ArrowDownwardIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} style={{ ...tdStyle, textAlign: 'center', height: 200, borderBottom: 'none' }}>
                    <CircularProgress size={28} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ ...tdStyle, textAlign: 'center', height: 200, borderBottom: 'none', color: theme.palette.text.secondary }}>
                    No aircraft found.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    onDragOver={(e) => handleDragOver(e, row.id)}
                    onDrop={(e) => handleDrop(e, row.id)}
                    onDragLeave={(e) => {
                      // Only clear if leaving the row entirely (not entering a child)
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        if (dragOverRowId.current === row.id) {
                          dragOverRowId.current = null;
                          setDragOverId(null);
                        }
                      }
                    }}
                    style={{
                      transition: 'background-color 0.15s ease, opacity 0.15s ease',
                      opacity: dragActiveId === row.id ? 0.35 : 1,
                      backgroundColor: dragOverId === row.id && dragActiveId !== row.id
                        ? (isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)')
                        : 'transparent',
                      boxShadow: dragOverId === row.id && dragActiveId !== row.id
                        ? `inset 0 2px 0 rgba(99,102,241,0.6)`
                        : 'none',
                    }}
                  >
                    {/* Drag handle — only this element is draggable */}
                    <td
                      draggable
                      onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, row.id); }}
                      onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
                      style={{ ...tdStyle, width: 36, textAlign: 'center', padding: '0 4px', cursor: 'grab', color: theme.palette.text.disabled, userSelect: 'none' }}
                    >
                      <DragIndicatorIcon sx={{ fontSize: 18, verticalAlign: 'middle', pointerEvents: 'none' }} />
                    </td>
                    {/* Index number */}
                    <td style={{ ...tdStyle, width: 54, textAlign: 'center', color: theme.palette.text.secondary, fontWeight: 500, fontSize: 12 }}>
                      {row.index != null ? row.index : '—'}
                    </td>
                    <td
                      style={{ ...tdStyle, fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => router.push(`/aircraft/edit/${row.id}`)}
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
                    <td style={{ ...tdStyle, width: 110 }}>{row.category || '—'}{/* Make */}</td>
                    <td style={{ ...tdStyle, width: 130 }}>{row.model || '—'}</td>
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
              Showing <strong style={{ color: theme.palette.text.primary }}>{visibleRows.length}</strong> of <strong style={{ color: theme.palette.text.primary }}>{filteredRows.length}</strong> aircraft
              {searchTerm && rows.length !== filteredRows.length && (
                <span style={{ opacity: 0.6 }}> (filtered from {rows.length})</span>
              )}
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
