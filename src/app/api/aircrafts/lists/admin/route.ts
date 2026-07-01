export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';
import '@/lib/models/AircraftCategory.model'; // Ensure schema registration

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    
    const skip = (page - 1) * pageSize;
    
    const filter = { isDeleted: { $ne: true } };

    // Run count + paginated query in parallel
    const [total, aircrafts] = await Promise.all([
      Aircraft.countDocuments(filter),
      Aircraft.find(filter)
        .select('title slug year price status category airframe engine engineTwo propeller propellerTwo location featuredImage images contactAgent index createdAt')
        .populate('category', 'name')
        .sort({ index: 1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);
    
    return NextResponse.json({ 
      success: true, 
      data: aircrafts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
