import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';
import '@/lib/models/AircraftCategory.model'; // Ensure schema registration

export async function GET() {
  await dbConnect();
  try {
    const aircrafts = await Aircraft.find().populate('category').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: aircrafts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    // Use the existing logic or adapt it. For now, simple create.
    // Note: The original controller handled file uploads and index logic.
    // This is a simplified version for demonstration.
    const aircraft = await Aircraft.create(body);
    return NextResponse.json({ success: true, message: "Aircraft created", data: aircraft }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
