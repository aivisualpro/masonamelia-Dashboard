'use client';

import * as React from 'react';
import { DataGrid, GridToolbar, GridColDef, GridRowId } from '@mui/x-data-grid';
import {
  Paper,
  Typography,
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
import { alpha, useTheme, Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { useRouter } from 'next/navigation';
import { purple } from '@mui/material/colors';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/aircrafts`;
const BULK_DELETE_URL = `${API_BASE}/bulkDelete`;

// Status options (slugs)
const STATUS_OPTIONS = ['for-sale', 'sold', 'wanted', 'coming-soon', 'sale-pending', 'off-market', 'acquired'] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

const numberFmt = new Intl.NumberFormat('en-US');

const SECTION_KEYS = ['airframe', 'engine', 'propeller', 'avionics', 'equipment', 'interior', 'exterior', 'inspection'] as const;

interface DescriptionSection {
  html?: string;
}

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
  contactAgent?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  description?: {
    sections?: Record<string, DescriptionSection>;
  };
}

interface AircraftRow {
  id: string;
  index: number;
  image: string;
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

const stripHtml = (html: string = ''): string =>
  String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const pickDescriptionText = (doc: AircraftDoc): { full: string; short: string } => {
  const sections = doc?.description?.sections || {};
  const firstHtml = SECTION_KEYS.map((k) => sections?.[k]?.html).find(Boolean);
  const full = stripHtml(firstHtml || '');
  const short = full.length > 120 ? full.slice(0, 120) + '…' : full;
  return { full, short };
};

/* ------------ Status Pill (soft badge) ------------ */
interface StatusPillProps {
  value?: string;
}

function StatusPill({ value }: StatusPillProps) {
  const theme = useTheme();
  const slug = String(value || '').toLowerCase();
  const label = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '—';

  const pal = theme.palette;
  const tone = (key: 'success' | 'error' | 'info' | 'warning' | 'primary' | 'secondary') => ({
    bg: alpha(pal[key].main, 0.12),
    fg: pal[key].dark,
    bd: alpha(pal[key].main, 0.24)
  });

  const colors = (() => {
    switch (slug) {
      case 'for-sale':
        return tone('success');
      case 'sold':
        return tone('error');
      case 'wanted':
        return tone('info');
      case 'coming-soon':
        return tone('warning');
      case 'sale-pending':
        return {
          bg: alpha(purple[500], 0.14),
          fg: purple[700],
          bd: alpha(purple[500], 0.28)
        };
      case 'off-market':
        return { bg: alpha(pal.grey[500], 0.18), fg: pal.grey[800], bd: alpha(pal.grey[600], 0.26) };
      case 'acquired':
        return tone('primary');
      default:
        return { bg: alpha(pal.grey[400], 0.18), fg: pal.text.primary, bd: alpha(pal.grey[500], 0.26) };
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

/* ------------ Per-row Status Menu (inside Actions) ------------ */
interface RowStatusMenuProps {
  rowId: string;
  currentStatus: string;
  onUpdated?: (id: string, newStatus: string) => void;
}

function RowStatusMenu({ rowId, currentStatus, onUpdated }: RowStatusMenuProps) {
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
      const res = await fetch(`${API_BASE}/update/${rowId}`, {
        method: 'PUT',
        body: fd
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Update failed: ${res.status} ${t}`);
      }
      onUpdated?.(rowId, newStatus);
    } finally {
      setSaving(false);
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title="Change status">
        <span className="flex">
          <IconButton size="small" onClick={handleOpen} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : <ChangeCircleIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {STATUS_OPTIONS.map((s) => (
          <MenuItem key={s} selected={s === currentStatus} onClick={() => updateStatus(s)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusPill value={s} />
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function AircraftTable() {
  const [loading, setLoading] = React.useState(true);
  const [aircrafts, setAircrafts] = React.useState<AircraftDoc[]>([]);
  const [selection, setSelection] = React.useState<GridRowId[]>([]);
  const [confirm, setConfirm] = React.useState<ConfirmState>({ open: false, mode: null, ids: [], title: '' });
  const [deleting, setDeleting] = React.useState(false);

  const router = useRouter();

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
    fetchRows();
  }, [fetchRows]);

  // apply local change after successful PUT
  const handleStatusUpdated = React.useCallback((id: string, newStatus: string) => {
    setAircrafts((prev) =>
      (prev || []).map((d) => {
        const docId = d._id || d.id;
        if (String(docId) === String(id)) {
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
  }, []);

  const rows: AircraftRow[] = React.useMemo(() => {
    return (aircrafts || []).map((d, ind) => {
      const toNum = (v: unknown): number | null => (v === undefined || v === null || v === '' ? null : Number(v));
      return {
        id: d._id || d.id || '',
        index: ind + 1,
        image: d.featuredImage || '',
        title: d.title ?? '',
        year: toNum(d.year),
        price: d.price ? toNum(d.price) : 'Call',
        status: d.status ?? '',
        category: d.category?.name,
        airframe: d.airframe,
        engine: `${d.engineTwo ? `${d.engine} / ${d.engineTwo}` : `${d.engine}`}`,
        propeller: `${d.propellerTwo ? `${d.propeller} / ${d.propellerTwo}` : `${d.propeller}`}`,
        location: d.location ? d.location : 'Not Define',
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

  const openConfirmSingle = (row: AircraftRow) => setConfirm({ open: true, mode: 'single', ids: [row.id], title: row.title || '' });
  const openConfirmBulk = () => setConfirm({ open: true, mode: 'bulk', ids: selection as (string | number)[], title: `${selection.length} items` });
  const closeConfirm = () => setConfirm((c) => ({ ...c, open: false }));

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
        setSelection([]);
      }
      await fetchRows();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
      closeConfirm();
    }
  };

  const columns: GridColDef<AircraftRow>[] = React.useMemo(
    () => [
      { field: 'index', headerName: 'Index', width: 90, type: 'number' },
      { field: 'image', headerName: 'Image', width: 120, renderCell: (params) => <div className="w-full h-full p-1"><img src={params?.value} alt="" className="w-full h-full object-cover rounded-md" loading="lazy" /></div> },
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 220 },
      { field: 'year', headerName: 'Year', width: 90, type: 'number' },
      { field: 'price', headerName: 'Price', width: 120, type: 'number' },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => <StatusPill value={params?.value} />
      },
      { field: 'category', headerName: 'Category', width: 150 },
      { field: 'airframe', headerName: 'Airframe', width: 150 },
      { field: 'engine', headerName: 'Engine', width: 150 },
      { field: 'propeller', headerName: 'Propeller', width: 150 },
      { field: 'location', headerName: 'Location', flex: 0.8, minWidth: 150 },
      {
        field: 'agent',
        headerName: 'Contact Agent',
        width: 220,
        renderCell: (params) => {
          const a = params?.row?._agent || {};
          const tooltip = [a?.name, a?.phone, a?.email].filter(Boolean).join(' | ');
          return (
            <div title={tooltip} style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600 }}>{a?.name || '-'}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{a?.phone || ''}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{a?.email || ''}</div>
            </div>
          );
        }
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <a className='flex items-start h-full' href={`https://skynet.skynetsilicon.com/showroom/${params.row.id}`} target="_blank" rel="noopener noreferrer">
                <IconButton size="small">
                  <RemoveRedEyeIcon fontSize="small" />
                </IconButton>
              </a>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => router.push(`/jets/edit/${params.row.id}`)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => openConfirmSingle(params.row)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <RowStatusMenu rowId={params.row.id} currentStatus={params.row.status} onUpdated={handleStatusUpdated} />
          </Stack>
        )
      }
    ],
    [router, handleStatusUpdated]
  );

  return (
    <Box className="w-full">
      <Paper elevation={0} sx={{ minHeight: '75vh' }} className="rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <Typography variant="h6" className="font-bold">
              Aircrafts
            </Typography>
            <span className="text-xs text-zinc-500">{numberFmt.format(rows.length)} items</span>
          </div>
          <div className="flex items-center gap-2">
            {selection.length > 0 && (
              <Button color="error" variant="outlined" onClick={openConfirmBulk} startIcon={<DeleteIcon />}>
                Delete Selected ({selection.length})
              </Button>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/jets/add')}>
              Add Aircraft
            </Button>
          </div>
        </div>

        <div style={{ width: '100%' }} className="p-2">
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(m) => setSelection(m as unknown as GridRowId[])}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
            sx={{ minHeight: '75vh', border: 0 }}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </Paper>

      <Dialog open={confirm.open} onClose={deleting ? undefined : closeConfirm}>
        <DialogTitle>
          {confirm.mode === 'single' ? `Delete "${confirm.title}"?` : `Delete ${confirm.ids.length} selected item(s)?`}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete {confirm.mode === 'single' ? 'this item' : 'these items'}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={deleting} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} disabled={deleting} color="error" variant="contained">
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
