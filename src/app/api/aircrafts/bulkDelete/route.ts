import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs provided' }, { status: 400 });
    }
    
    await Aircraft.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ success: true, message: 'Aircrafts deleted completely' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
