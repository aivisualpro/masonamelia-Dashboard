import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';
import '@/lib/models/AircraftCategory.model';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
  await dbConnect();
  try {
    const aircrafts = await Aircraft.find({ isDeleted: { $ne: true } }).populate('category').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: aircrafts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('multipart/form-data')) {
      // ── FormData path (from AddJet / AddAircraftModal) ──
      const formData = await request.formData();

      const textFields = ['title', 'slug', 'status', 'location', 'overview', 'videoUrl'];
      textFields.forEach(f => { if (formData.has(f)) body[f] = formData.get(f); });

      // category is an ObjectId reference — only set it when a real value is provided
      const categoryVal = (formData.get('category') as string || '').trim();
      if (categoryVal) body.category = categoryVal;

      const numericFields = ['year', 'price', 'airframe', 'engine', 'engineTwo', 'propeller', 'propellerTwo', 'index', 'latitude', 'longitude'];
      numericFields.forEach(f => {
        const v = formData.get(f);
        if (v && v !== 'undefined' && v !== 'null' && v !== '') body[f] = Number(v);
      });

      if (formData.has('contactAgent')) {
        try { body.contactAgent = JSON.parse(formData.get('contactAgent') as string); } catch {}
      }
      if (formData.has('description')) {
        try { body.description = JSON.parse(formData.get('description') as string); } catch {}
      }

      // Upload gallery images
      const imageFiles = formData.getAll('images');
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        if (file instanceof File && file.size > 0) {
          const url = await uploadToCloudinary(file, 'aircrafts');
          imageUrls.push(url);
        }
      }
      if (imageUrls.length) body.images = imageUrls;

      // Upload featured image
      const featured = formData.get('featuredImage');
      if (featured instanceof File && featured.size > 0) {
        body.featuredImage = await uploadToCloudinary(featured, 'aircrafts');
      }
    } else {
      // ── JSON path (programmatic / API callers) ──
      body = await request.json();
    }

    const aircraft = await Aircraft.create(body);
    return NextResponse.json({ success: true, message: 'Aircraft created', data: aircraft }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
