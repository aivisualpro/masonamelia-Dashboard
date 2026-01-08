import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';
import '@/lib/models/AircraftCategory.model'; // Ensure schema registration

export async function GET() {
  await dbConnect();
  try {
    // Get latest 10 aircrafts sorted by creation date
    const aircrafts = await Aircraft.find()
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(10);
    return NextResponse.json({ success: true, data: aircrafts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
