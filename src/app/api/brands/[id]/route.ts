import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brands.model';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const brand = await Brand.findById(params.id);
    
    if (!brand) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: brand });
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
    const brand = await Brand.findByIdAndDelete(params.id);
    
    if (!brand) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
