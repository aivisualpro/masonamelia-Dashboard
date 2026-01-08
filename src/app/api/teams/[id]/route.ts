import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Team from '@/lib/models/Team.model';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const team = await Team.findById(params.id);
    
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const team = await Team.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const team = await Team.findByIdAndDelete(params.id);
    
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
