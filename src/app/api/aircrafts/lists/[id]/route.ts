import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';
import '@/lib/models/AircraftCategory.model'; // Ensure schema registration

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const aircraft = await Aircraft.findById(params.id).populate('category');
    
    if (!aircraft) {
      return NextResponse.json(
        { success: false, message: 'Aircraft not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: aircraft });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
