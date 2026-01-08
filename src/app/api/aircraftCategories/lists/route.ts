import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AircraftCategory from '@/lib/models/AircraftCategory.model';

export async function GET() {
  await dbConnect();
  
  try {
    const categories = await AircraftCategory.find().sort({ name: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
