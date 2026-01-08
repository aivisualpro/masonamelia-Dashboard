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
    
    // Get total count for pagination
    const total = await Aircraft.countDocuments();
    
    // Get paginated aircrafts
    const aircrafts = await Aircraft.find()
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    
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
