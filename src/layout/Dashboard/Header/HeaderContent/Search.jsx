'use client';

// Dashboard Aircraft Search
// Live autocomplete search — mirrors the website's HeroSearch.jsx but styled for MUI dashboard.
// Hits the same /api/aircrafts/lists/search endpoint.
// On selection, navigates to /aircraft/edit/[id].

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

const API_BASE   = process.env.NEXT_PUBLIC_API_URL || '';
const SEARCH_URL = `${API_BASE}/api/aircrafts/lists/search`;
const DEBOUNCE_MS = 280;
const MIN_CHARS   = 2;

const fmtPrice = (n) =>
  typeof n === 'number' && n > 0
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : null;

/* ── single result row in the dropdown ─────────────────────────────── */
function ResultRow({ item, highlighted, onSelect, theme }) {
  const img   = item.featuredImage || item.images?.[0];
  const price = fmtPrice(item.price);
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      role="option"
      aria-selected={highlighted}
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        cursor: 'pointer',
        transition: 'background 0.12s',
        bgcolor: highlighted
          ? alpha(theme.palette.primary.main, 0.10)
          : 'transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.06),
        },
      }}
    >
      {/* thumbnail */}
      <Box sx={{
        width: 40,
        height: 32,
        borderRadius: 1,
        overflow: 'hidden',
        flexShrink: 0,
        bgcolor: theme.palette.action.hover,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {img ? (
          <Image
            src={img}
            alt={item.title || item.model || ''}
            width={40}
            height={32}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <SearchIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
        )}
      </Box>

      {/* text */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title || item.model}
        </Box>
        <Box sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', mt: 0.25 }}>
          {[item.year, item.model, price].filter(Boolean).join(' · ')}
        </Box>
      </Box>

      {/* status chip */}
      {item.status && (
        <Box sx={{
          fontSize: 10,
          fontWeight: 600,
          px: 1,
          py: 0.25,
          borderRadius: '999px',
          bgcolor: alpha(theme.palette.primary.main, 0.10),
          color: theme.palette.primary.dark,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          textTransform: 'capitalize',
          display: { xs: 'none', sm: 'block' },
        }}>
          {item.status.replace(/-/g, ' ')}
        </Box>
      )}
    </Box>
  );
}

/* ── main search component ──────────────────────────────────────────── */
export default function Search() {
  const router    = useRouter();
  const theme     = useTheme();
  const isDark    = theme.palette.mode === 'dark';

  const wrapRef     = useRef(null);
  const inputRef    = useRef(null);
  const abortRef    = useRef(null);
  const debounceRef = useRef(null);

  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [open,      setOpen]      = useState(false);
  const [highlight, setHighlight] = useState(-1);

  /* click outside → close */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* debounced fetch */
  useEffect(() => {
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current)    abortRef.current.abort();

    const q = query.trim();
    if (q.length < MIN_CHARS) { setLoading(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const res  = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setResults(json?.data || []);
        setOpen(true);
      } catch (e) {
        if (e.name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSelect = useCallback((item) => {
    const id = item._id || item.id;
    router.push(`/aircraft/edit/${id}`);
    setOpen(false);
    setQuery('');
    setResults([]);
  }, [router]);

  const handleClear = () => {
    setQuery('');
    setOpen(false);
    setResults([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && results[highlight]) {
        handleSelect(results[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  };

  const showDropdown = open && query.trim().length >= MIN_CHARS && (results.length > 0 || !loading);

  return (
    <Box ref={wrapRef} sx={{ position: 'relative', width: { xs: '100%', md: 240 } }}>

      {/* ── input pill ─────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        height: 34,
        borderRadius: 1.5,
        border: `1px solid ${open || query ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: open || query
          ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.15)}`
          : 'none',
      }}>
        <SearchIcon sx={{ fontSize: 15, color: query ? 'primary.main' : 'text.disabled', flexShrink: 0 }} />

        <InputBase
          inputRef={inputRef}
          id="dashboard-aircraft-search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlight(-1); }}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search aircraft…"
          inputProps={{ 'aria-label': 'Search aircraft', 'aria-expanded': open, 'aria-autocomplete': 'list' }}
          sx={{
            flex: 1,
            fontSize: 13,
            '& input': {
              p: 0,
              color: 'text.primary',
              '&::placeholder': { color: 'text.disabled', opacity: 1 },
            },
          }}
        />

        {/* spinner / clear */}
        {loading ? (
          <CircularProgress size={13} sx={{ flexShrink: 0, color: 'text.disabled' }} />
        ) : query ? (
          <IconButton size="small" onClick={handleClear} sx={{ p: 0.25, flexShrink: 0 }} aria-label="Clear search">
            <CloseIcon sx={{ fontSize: 13 }} />
          </IconButton>
        ) : null}
      </Box>

      {/* ── dropdown ───────────────────────────────────────────────── */}
      {showDropdown && (
        <Box
          role="listbox"
          aria-label="Aircraft search results"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 'calc(100% + 6px)',
            zIndex: 9999,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.6)'
              : '0 8px 32px rgba(0,0,0,0.14)',
            minWidth: 280,
          }}
        >
          {/* section label */}
          {results.length > 0 && (
            <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}>
              <Box sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled' }}>
                Aircraft
              </Box>
            </Box>
          )}

          {/* rows */}
          {results.map((item, i) => (
            <ResultRow
              key={item._id || item.id || i}
              item={item}
              highlighted={highlight === i}
              onSelect={handleSelect}
              theme={theme}
            />
          ))}

          {/* no results */}
          {results.length === 0 && !loading && (
            <Box sx={{ px: 2, py: 2.5, fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
              No aircraft matched &ldquo;{query.trim()}&rdquo;
            </Box>
          )}

          {/* footer */}
          <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, px: 1, py: 0.75 }}>
            <Box
              component="button"
              onMouseDown={(e) => { e.preventDefault(); router.push(`/aircraft?q=${encodeURIComponent(query.trim())}`); setOpen(false); }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                width: '100%',
                border: 'none',
                bgcolor: 'transparent',
                cursor: 'pointer',
                py: 0.75,
                px: 1,
                borderRadius: 1,
                fontSize: 12,
                color: 'text.secondary',
                fontFamily: 'inherit',
                transition: 'background 0.12s, color 0.12s',
                '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
              }}
            >
              <SearchIcon sx={{ fontSize: 12 }} />
              View all results for &ldquo;{query.trim()}&rdquo;
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
