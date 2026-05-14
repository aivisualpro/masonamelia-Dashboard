import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brands.model';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const brand = await Brand.findById(params.id).lean();
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { success: false, message: 'Logo is required' },
        { status: 400 }
      );
    }

    const brand = await Brand.findByIdAndUpdate(params.id, { logo }, { new: true });

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
