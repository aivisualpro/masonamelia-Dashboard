import PropTypes from 'prop-types';
import React from 'react';
import Image from 'next/image';
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary';

// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TablePagination from '@mui/material/TablePagination';
import { alpha, useTheme } from '@mui/material/styles';

// api
import { useLatestAircraft } from '../../../api/hooks';

const PAGE_SIZE = 25;

// ---------------- helpers ----------------
const headCells = [
  { id: 'no', label: 'S.No', align: 'left' },
  { id: 'image', label: 'Image', align: 'left' },
  { id: 'title', label: 'Title', align: 'left' },
  { id: 'year', label: 'Year', align: 'center' },
  { id: 'price', label: 'Price', align: 'center' },
  { id: 'category', label: 'Category', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'airframe', label: 'Airframe', align: 'center' },
  { id: 'engine', label: 'Engine', align: 'center' },
  { id: 'propeller', label: 'Propeller', align: 'center' },
];

const OrderTableHead = React.memo(function OrderTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((h) => (
          <TableCell
            key={h.id}
            align={h.align || 'center'}
            sx={{ fontWeight: 700, color: 'text.secondary' }}
          >
            {h.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
});

// ------ Status Pill ------
const StatusPill = React.memo(function StatusPill({ value }) {
  const theme = useTheme();
  const slug = String(value || '').toLowerCase();

  // label: "for-sale" -> "For Sale"
  const label = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const pal = theme.palette;
  const tone = (key) => ({
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
        return tone('secondary');
      case 'off-market':
        return {
          bg: alpha(pal.grey[500], 0.18),
          fg: pal.grey[800],
          bd: alpha(pal.grey[600], 0.26)
        };
      case 'acquired':
        return tone('primary');
      default:
        return {
          bg: alpha(pal.grey[400], 0.18),
          fg: pal.text.primary,
          bd: alpha(pal.grey[500], 0.26)
        };
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
        height: 26
      }}
    />
  );
});



// ── Memoized table row ──
const OrderRow = React.memo(function OrderRow({ row, index }) {
  return (
    <TableRow
      hover
      sx={{
        '&:nth-of-type(odd)': { bgcolor: 'action.hover' }
      }}
    >
      <TableCell align="left">
        <Link color="secondary" underline="hover">
          {index + 1}
        </Link>
      </TableCell>

      <TableCell align="center">
        {row?.images?.[0] ? (
          <Image
            src={optimizeCloudinaryUrl(row.images[0])}
            width={100}
            height={60}
            sizes="100px"
            style={{ borderRadius: 6, objectFit: 'cover' }}
            alt={row?.title || 'Aircraft'}
          />
        ) : (
          <Box sx={{ width: 56, height: 36, borderRadius: 1, bgcolor: 'action.selected' }} />
        )}
      </TableCell>

      <TableCell align="left">
        {row?.title ?? '—'}
      </TableCell>

      <TableCell align="center">{row?.year ?? '—'}</TableCell>
      <TableCell align="center">{row?.price ? row.price : 'Call'}</TableCell>
      <TableCell align="center">{row?.category?.name ?? '—'}</TableCell>

      <TableCell align="center">
        <StatusPill value={row?.status} />
      </TableCell>

      <TableCell align="center">{row?.airframe ?? '—'}</TableCell>
      <TableCell align="center">{row?.engineTwo ? row.engine + ' / ' + row.engineTwo : row.engine}</TableCell>
      <TableCell align="center">{row?.propellerTwo ? row.propeller + ' / ' + row.propellerTwo : row.propeller}</TableCell>
    </TableRow>
  );
}, (prev, next) => prev.row._id === next.row._id && prev.index === next.index);

// ---------------- Table ----------------
export default function OrderTable() {
  const { rows } = useLatestAircraft();
  const [page, setPage] = React.useState(0);

  const paginatedRows = React.useMemo(
    () => rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [rows, page]
  );

  const handleChangePage = React.useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' },
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Table aria-labelledby="tableTitle" size="small" stickyHeader>
          <OrderTableHead />
          <TableBody>
            {paginatedRows?.map((row, index) => (
              <OrderRow key={row._id} row={row} index={page * PAGE_SIZE + index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > PAGE_SIZE && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
        />
      )}
    </Box>
  );
}
