export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  await dbConnect();
  try {
    const Aircraft = (await import('@/lib/models/Aircraft.model')).default;

    // ─── Run ALL independent queries in parallel ─────────────────────────
    const now = new Date();
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
    const d7  = new Date(now); d7.setDate(d7.getDate() - 7);
    const d90 = new Date(now); d90.setDate(d90.getDate() - 90);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const Team = (await import('@/lib/models/Team.model')).default;
    const Review = (await import('@/lib/models/Review.model')).default;
    const WebsiteVisit = (await import('@/lib/models/WebsiteVisit.model')).default;

    // 30-day boundaries for visitor comparison
    const prev30 = new Date(now); prev30.setDate(prev30.getDate() - 60);

    const [
      totalAircrafts, forSale, sold, salePending, offMarket, wanted, comingSoon, acquired,
      listingsLast30Days, listingsLast7Days, listingsLast90Days,
      totalTeam, totalTestimonials,
      totalWebsiteVisits, visitsLast30, visitsPrev30,
      valueAgg, soldValueAgg, byMonth,
      categoryBreakdown, priceRanges, recentListings,
    ] = await Promise.all([
      // Status counts
      Aircraft.countDocuments(),
      Aircraft.countDocuments({ status: 'for-sale' }),
      Aircraft.countDocuments({ status: 'sold' }),
      Aircraft.countDocuments({ status: 'sale-pending' }),
      Aircraft.countDocuments({ status: 'off-market' }),
      Aircraft.countDocuments({ status: 'wanted' }),
      Aircraft.countDocuments({ status: 'coming-soon' }),
      Aircraft.countDocuments({ status: 'acquired' }),
      // Velocity counts
      Aircraft.countDocuments({ createdAt: { $gte: d30 } }),
      Aircraft.countDocuments({ createdAt: { $gte: d7 } }),
      Aircraft.countDocuments({ createdAt: { $gte: d90 } }),
      // Related model counts
      Team.countDocuments().catch(() => 0),
      Review.countDocuments().catch(() => 0),
      // Website visits
      WebsiteVisit.countDocuments().catch(() => 0),
      WebsiteVisit.countDocuments({ visitedAt: { $gte: d30 } }).catch(() => 0),
      WebsiteVisit.countDocuments({ visitedAt: { $gte: prev30, $lt: d30 } }).catch(() => 0),
      // Aggregations
      Aircraft.aggregate([
        { $match: { status: 'for-sale', price: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$price' }, avg: { $avg: '$price' } } }
      ]),
      Aircraft.aggregate([
        { $match: { status: 'sold', price: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$price' } } }
      ]),
      Aircraft.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Aircraft.aggregate([
        { $match: { category: { $ne: null } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $lookup: { from: 'aircraftcategories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$cat.name', 'Uncategorized'] }, count: 1 } }
      ]).catch(() => []),
      Aircraft.aggregate([
        { $match: { price: { $gt: 0 }, status: 'for-sale' } },
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 100000, 250000, 500000, 1000000, 2500000, 5000000],
            default: '5M+',
            output: { count: { $sum: 1 } }
          }
        }
      ]).catch(() => []),
      Aircraft.find()
        .select('title status price featuredImage location createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const avgListingsPerMonth = Math.round(listingsLast90Days / 3);
    const totalValue = valueAgg[0]?.total || 0;
    const avgPrice = valueAgg[0]?.avg || 0;
    const avgSoldPrice = soldValueAgg[0]?.avg || 0;

    // Status breakdown
    const statusBreakdown = [
      { status: 'For Sale', count: forSale, color: '#22c55e' },
      { status: 'Sold', count: sold, color: '#ef4444' },
      { status: 'Sale Pending', count: salePending, color: '#a855f7' },
      { status: 'Off Market', count: offMarket, color: '#6b7280' },
      { status: 'Wanted', count: wanted, color: '#3b82f6' },
      { status: 'Coming Soon', count: comingSoon, color: '#f59e0b' },
      { status: 'Acquired', count: acquired, color: '#06b6d4' },
    ].filter(s => s.count > 0);

    // Monthly listings
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyListings = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = byMonth.find((b: any) => b._id.year === year && b._id.month === month);
      return { label: MONTHS[d.getMonth()], count: found?.count || 0 };
    });

    // Price distribution
    const priceLabels: Record<string, string> = {
      '0': '<$100K', '100000': '$100K–250K', '250000': '$250K–500K',
      '500000': '$500K–1M', '1000000': '$1M–2.5M', '2500000': '$2.5M–5M', '5M+': '$5M+'
    };
    const priceDistribution = priceRanges.map((r: any) => ({
      label: priceLabels[String(r._id)] || String(r._id),
      count: r.count
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpis: { totalAircrafts, forSale, sold, salePending, totalValue, avgPrice, avgSoldPrice, totalTeam, totalTestimonials, listingsLast30Days, listingsLast7Days, avgListingsPerMonth, totalWebsiteVisits, visitsLast30, visitsPrev30 },
        statusBreakdown,
        monthlyListings,
        categoryBreakdown,
        priceDistribution,
        recentListings,
      }
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
