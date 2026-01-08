export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brands.model';

export async function GET() {
  await dbConnect();
  
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { logo } = body;
    
    if (!logo) {
      return NextResponse.json(
        { success: false, message: 'Logo URL is required' },
        { status: 400 }
      );
    }
    
    const brand = await Brand.create({ logo });
    
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
