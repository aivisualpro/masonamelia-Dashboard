import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { name, slug } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }
    
    const category = await AircraftCategory.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
    
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
