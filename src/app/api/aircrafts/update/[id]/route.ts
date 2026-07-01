import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const id = params.id;
    const existingAircraft = await Aircraft.findById(id);
    if (!existingAircraft) {
      return NextResponse.json({ success: false, message: 'Aircraft not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    let updates: any = {};

    if (contentType.includes('application/json')) {
      // ── JSON path (images already uploaded via /api/upload-image) ──
      const body = await request.json();

      const textFields = [
        'title', 'slug', 'status', 'category', 'location',
        'latitude', 'longitude', 'overview', 'videoUrl'
      ];
      textFields.forEach(field => {
        if (body[field] !== undefined) updates[field] = body[field];
      });

      const numericFields = [
        'year', 'price', 'airframe', 'engine', 'engineTwo',
        'propeller', 'propellerTwo', 'index'
      ];
      numericFields.forEach(field => {
        if (body[field] !== undefined && body[field] !== '' && body[field] !== null) {
          updates[field] = Number(body[field]);
        }
      });

      if (body.description) updates.description = body.description;
      if (body.contactAgent) updates.contactAgent = body.contactAgent;

      // Images are already URLs — no upload needed
      if (Array.isArray(body.images)) {
        updates.images = body.images;
      }
      if (body.featuredImage) {
        updates.featuredImage = body.featuredImage;
      }

    } else {
      // ── Legacy FormData path (files uploaded inline) ──
      const formData = await request.formData();

      const textFields = [
        'title', 'slug', 'status', 'category', 'location',
        'latitude', 'longitude', 'overview', 'videoUrl'
      ];
      textFields.forEach(field => {
        if (formData.has(field)) updates[field] = formData.get(field);
      });

      const numericFields = [
        'year', 'price', 'airframe', 'engine', 'engineTwo',
        'propeller', 'propellerTwo', 'index'
      ];
      numericFields.forEach(field => {
        if (formData.has(field)) {
          const val = formData.get(field);
          if (val && val !== 'undefined' && val !== 'null') updates[field] = val;
        }
      });

      if (formData.has('description')) {
        try { updates.description = JSON.parse(formData.get('description') as string); } catch (e) { console.error('Json parse error description', e); }
      }
      if (formData.has('contactAgent')) {
        try { updates.contactAgent = JSON.parse(formData.get('contactAgent') as string); } catch (e) { console.error('Json parse error contactAgent', e); }
      }

      // Images logic
      let finalImages: string[] = [];
      if (formData.has('keepImages')) {
        try {
          const parsed = JSON.parse(formData.get('keepImages') as string);
          if (Array.isArray(parsed)) finalImages = parsed;
        } catch (e) { console.error('Json parse error keepImages', e); }
      }

      // Upload new images
      const newFiles = formData.getAll('images');
      for (const file of newFiles) {
        if (file instanceof File && file.size > 0) {
          const url = await uploadToCloudinary(file, 'aircrafts');
          finalImages.push(url);
        }
      }
      if (formData.has('keepImages') || newFiles.length > 0) {
        updates.images = finalImages;
      }

      // Featured Image
      if (formData.has('featuredImage')) {
        const file = formData.get('featuredImage');
        if (file instanceof File && file.size > 0) {
          const url = await uploadToCloudinary(file, 'aircrafts');
          updates.featuredImage = url;
        }
      }
    }

    const updatedAircraft = await Aircraft.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ success: true, message: 'Aircraft updated', data: updatedAircraft });

  } catch (error: any) {
    console.error('Update Aircraft Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
