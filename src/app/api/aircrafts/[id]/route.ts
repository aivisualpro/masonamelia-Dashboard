import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';

// PATCH /api/aircrafts/[id] — soft delete (isDeleted = true)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const body = await request.json();
    const aircraft = await Aircraft.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );
    if (!aircraft) {
      return NextResponse.json({ success: false, message: 'Aircraft not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: aircraft });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
