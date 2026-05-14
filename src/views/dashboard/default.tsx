'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const numFmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const curFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });

// ── KPI Card ────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  const theme = useTheme();
  return (
    <Box sx={{
      p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2,
      backgroundColor: theme.palette.background.paper,
      display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0,
    }}>
      <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.palette.text.secondary }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 700, color: accent || theme.palette.text.primary, lineHeight: 1.15 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: theme.palette.text.secondary, marginTop: 2 }}>{sub}</span>}
    </Box>
  );
}

// ── Bar Chart (SVG) ─────────────────────────────────────────────
function BarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const theme = useTheme();
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 100 }}>
        {data.map((d, i) => (
          <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, height: '100%', justifyContent: 'flex-end' }}>
            <Box sx={{
              width: '100%', borderRadius: '3px 3px 0 0',
              backgroundColor: color,
              height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%`,
              opacity: 0.85,
              transition: 'height 0.4s ease',
            }} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: '3px', mt: 0.75 }}>
        {data.map((d, i) => (
          <Box key={i} sx={{ flex: 1, textAlign: 'center', fontSize: 10, color: theme.palette.text.secondary, overflow: 'hidden' }}>
            {d.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Horizontal Bars ─────────────────────────────────────────────
function HBarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const theme = useTheme();
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {data.map((d, i) => (
        <Box key={i}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <span style={{ fontSize: 12, color: theme.palette.text.primary }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.palette.text.primary }}>{d.count}</span>
          </Box>
          <Box sx={{ height: 5, borderRadius: 99, backgroundColor: theme.palette.action.hover }}>
            <Box sx={{ height: '100%', width: `${(d.count / max) * 100}%`, backgroundColor: color, borderRadius: 99 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Status List ─────────────────────────────────────────────────
function StatusList({ data }: { data: { status: string; count: number; color: string }[] }) {
  const theme = useTheme();
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, flex: 1, color: theme.palette.text.primary }}>{d.status}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.primary }}>{d.count}</span>
          <span style={{ fontSize: 11, color: theme.palette.text.secondary, width: 34, textAlign: 'right' }}>
            {total > 0 ? `${Math.round((d.count / total) * 100)}%` : '—'}
          </span>
        </Box>
      ))}
    </Box>
  );
}

// ── Recent Row ──────────────────────────────────────────────────
function RecentRow({ item }: { item: any }) {
  const theme = useTheme();
  const statusColor: Record<string, string> = {
    'for-sale': '#22c55e', 'sold': '#ef4444', 'sale-pending': '#a855f7',
    'off-market': '#6b7280', 'wanted': '#3b82f6', 'coming-soon': '#f59e0b', 'acquired': '#06b6d4'
  };
  const c = statusColor[item.status as string] || '#6b7280';
  const label = (item.status || '').split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ width: 44, height: 32, borderRadius: 1, overflow: 'hidden', flexShrink: 0, backgroundColor: theme.palette.action.hover }}>
        {item.featuredImage && <img src={item.featuredImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 13, fontWeight: 500, color: theme.palette.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</Box>
        <Box sx={{ fontSize: 11, color: theme.palette.text.secondary }}>{item.location || '—'}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        {item.price > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: theme.palette.text.primary }}>{curFmt.format(item.price)}</span>}
        <Box sx={{ px: 1, py: 0.25, borderRadius: 99, fontSize: 11, fontWeight: 500, backgroundColor: `${c}18`, color: c, border: `1px solid ${c}40` }}>{label}</Box>
      </Box>
    </Box>
  );
}

// ── Card ────────────────────────────────────────────────────────
function Card({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
  const theme = useTheme();
  return (
    <Box sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, backgroundColor: theme.palette.background.paper, ...sx }}>
      {children}
    </Box>
  );
}

function SectionTitle({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.palette.text.secondary, mb: 2 }}>
      {title}
    </Box>
  );
}

// ── Business Health Card ────────────────────────────────────────
function BusinessHealthCard({ kpis }: { kpis: any }) {
  const theme = useTheme();

  const { totalAircrafts, forSale, sold, salePending, listingsLast30Days, listingsLast7Days, avgListingsPerMonth } = kpis;

  // Score components (0–100)
  // 1. Active inventory rate (up to 35 pts) — healthy business has lots for sale
  const activeRate = totalAircrafts > 0 ? forSale / totalAircrafts : 0;
  const activeScore = Math.min(activeRate * 100, 35);

  // 2. Sell-through rate (up to 35 pts) — how many have been sold vs total
  const sellThrough = totalAircrafts > 0 ? sold / totalAircrafts : 0;
  const sellScore = Math.min(sellThrough * 70, 35);

  // 3. Listing velocity (up to 30 pts) — how active are we recently
  const velocityScore = listingsLast30Days >= 10 ? 30
    : listingsLast30Days >= 5 ? 22
    : listingsLast30Days >= 2 ? 14
    : listingsLast30Days >= 1 ? 8 : 0;

  const score = Math.round(activeScore + sellScore + velocityScore);

  const grade = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Attention';
  const gradeColor = score >= 85 ? '#22c55e' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';
  const scoreColor = gradeColor;

  return (
    <Box sx={{
      p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2,
      backgroundColor: theme.palette.background.paper,
      display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0,
    }}>
      <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.palette.text.secondary }}>Business Health</span>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: scoreColor, lineHeight: 1.15 }}>{score}</span>
        <span style={{ fontSize: 12, color: theme.palette.text.secondary }}>/100</span>
        <Box sx={{ ml: 'auto', px: 1, py: 0.25, borderRadius: 99, fontSize: 11, fontWeight: 600, backgroundColor: `${gradeColor}18`, color: gradeColor, border: `1px solid ${gradeColor}40` }}>
          {grade}
        </Box>
      </Box>

      {/* Score bar */}
      <Box sx={{ height: 4, borderRadius: 99, backgroundColor: theme.palette.action.hover, mt: 0.5 }}>
        <Box sx={{ height: '100%', width: `${score}%`, backgroundColor: scoreColor, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
        <Box sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
          <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{listingsLast30Days}</span> added (30d)
        </Box>
        <Box sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
          <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{listingsLast7Days}</span> this week
        </Box>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════
export default function DashboardDefault() {
  const theme = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analysis/lists')
      .then(r => r.json())
      .then(j => {
        if (j.success) setData(j.data);
        else setError(j.message || 'Failed to load');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 300 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4, color: 'error.main', fontSize: 13 }}>
        Failed to load dashboard data{error ? `: ${error}` : ''}
      </Box>
    );
  }

  const { kpis, statusBreakdown, monthlyListings, categoryBreakdown, priceDistribution, recentListings } = data;

  return (
    <Box sx={{
      flex: 1,
      display: 'flex', flexDirection: 'column', gap: 2,
      overflow: { xs: 'auto', md: 'hidden' },
    }}>

      {/* ── KPI Row ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 2, flexShrink: 0 }}>
        <BusinessHealthCard kpis={kpis} />
        <KpiCard label="Total Aircraft" value={numFmt.format(kpis.totalAircrafts)} sub="All listings" />
        <KpiCard label="For Sale" value={numFmt.format(kpis.forSale)} sub="Active listings" accent="#22c55e" />
        <KpiCard label="Sold" value={numFmt.format(kpis.sold)} sub="All time" accent="#ef4444" />
        <KpiCard label="Sale Pending" value={numFmt.format(kpis.salePending)} sub="In progress" accent="#a855f7" />
        <KpiCard label="Inventory Value" value={kpis.totalValue > 0 ? curFmt.format(kpis.totalValue) : '—'} sub="For-sale listings" />
        <KpiCard label="Avg. List Price" value={kpis.avgPrice > 0 ? curFmt.format(kpis.avgPrice) : '—'} sub="For-sale avg." />
        <KpiCard label="Avg. Sold Price" value={kpis.avgSoldPrice > 0 ? curFmt.format(kpis.avgSoldPrice) : '—'} sub="Historical avg." />
        <KpiCard label="Team Members" value={numFmt.format(kpis.totalTeam)} sub="Active agents" />
      </Box>

      {/* ── Row 2: Monthly chart + Status ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, gap: 2, flex: { md: 1 }, minHeight: { md: 0 } }}>
        <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SectionTitle title="Listings Added — Last 12 Months" />
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <BarChart data={monthlyListings} color={theme.palette.primary.main} />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mt: 1, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
            {monthlyListings.slice(-3).map((m: { label: string; count: number }) => (
              <Box key={m.label}>
                <Box sx={{ fontSize: 18, fontWeight: 700, color: theme.palette.text.primary }}>{m.count}</Box>
                <Box sx={{ fontSize: 11, color: theme.palette.text.secondary }}>{m.label}</Box>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SectionTitle title="Inventory by Status" />
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {statusBreakdown.length > 0
              ? <StatusList data={statusBreakdown} />
              : <Box sx={{ fontSize: 13, color: theme.palette.text.secondary }}>No data</Box>
            }
          </Box>
        </Card>
      </Box>

      {/* ── Row 3: Category + Price + Recent ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, flex: { md: 1 }, minHeight: { md: 0 } }}>
        <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SectionTitle title="Top Categories" />
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {categoryBreakdown.length > 0
              ? <HBarChart data={categoryBreakdown.map((c: any) => ({ label: c.name, count: c.count }))} color={theme.palette.primary.main} />
              : <Box sx={{ fontSize: 13, color: theme.palette.text.secondary }}>No category data</Box>
            }
          </Box>
        </Card>

        <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SectionTitle title="Price Range (For Sale)" />
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {priceDistribution.length > 0
              ? <HBarChart data={priceDistribution} color="#06b6d4" />
              : <Box sx={{ fontSize: 13, color: theme.palette.text.secondary }}>No data</Box>
            }
          </Box>
        </Card>

        <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SectionTitle title="Recent Listings" />
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {recentListings.length > 0
              ? recentListings.map((item: any) => <RecentRow key={item._id} item={item} />)
              : <Box sx={{ fontSize: 13, color: theme.palette.text.secondary }}>No listings</Box>
            }
          </Box>
        </Card>
      </Box>

    </Box>
  );
}
