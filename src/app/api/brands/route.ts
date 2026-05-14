export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brands.model';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
  await dbConnect();
  
  try {
    const brands = await Brand.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const contentType = request.headers.get('content-type') || '';
    let logo: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      const file = fd.get('logo') as File | null;
      if (file && file.size > 0) {
        logo = await uploadToCloudinary(file, 'brands');
      }
    } else {
      const body = await request.json();
      logo = body.logo;
    }

    if (!logo) {
      return NextResponse.json(
        { success: false, message: 'Logo image is required' },
        { status: 400 }
      );
    }
    
    const brand = await Brand.create({ logo });
    
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
