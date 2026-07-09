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
    if (body.category === '' || body.category === 'null' || body.category === 'undefined') {
      body.category = null;
    }
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

// DELETE /api/aircrafts/[id] — hard delete (completely from DB)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const aircraft = await Aircraft.findByIdAndDelete(params.id);
    if (!aircraft) {
      return NextResponse.json({ success: false, message: 'Aircraft not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Aircraft deleted completely' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
