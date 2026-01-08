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
    const formData = await request.formData();
    const id = params.id;

    const existingAircraft = await Aircraft.findById(id);
    if (!existingAircraft) {
      return NextResponse.json({ success: false, message: 'Aircraft not found' }, { status: 404 });
    }

    const updates: any = {};
    
    // Text fields
    const textFields = [
      'title', 'status', 'category', 'location', 
      'latitude', 'longitude', 'overview', 'videoUrl'
    ];
    
    textFields.forEach(field => {
      if (formData.has(field)) {
        updates[field] = formData.get(field);
      }
    });

    // Numeric fields - handle empty strings safely
    const numericFields = [
        'year', 'price', 'airframe', 'engine', 'engineTwo', 
        'propeller', 'propellerTwo', 'index'
    ];
    
    numericFields.forEach(field => {
        if (formData.has(field)) {
            const val = formData.get(field);
            if (val && val !== 'undefined' && val !== 'null') {
                updates[field] = val;
            }
        }
    });

    // JSON fields
    if (formData.has('description')) {
        try {
            const descStr = formData.get('description') as string;
            updates.description = JSON.parse(descStr);
        } catch (e) {
            console.error('Json parse error description', e);
        }
    }
    if (formData.has('contactAgent')) {
        try {
            const agentStr = formData.get('contactAgent') as string;
            updates.contactAgent = JSON.parse(agentStr);
        } catch (e) {
             console.error('Json parse error contactAgent', e);
        }
    }

    // Images logic
    let finalImages: string[] = [];
    if (formData.has('keepImages')) {
        try {
            const keepStr = formData.get('keepImages') as string;
            const parsed = JSON.parse(keepStr);
             if (Array.isArray(parsed)) {
                finalImages = parsed;
             }
        } catch (e) {
            console.error('Json parse error keepImages', e);
            // fallback to existing if parse fails? Or empty?
            // If parse fails, assume empty or previous state. 
            // Better to respect what user sent as partial list. 
            // If error, maybe don't change images? 
            // Let's rely on empty array if failed.
        }
    }

    // Upload new images
    const newFiles = formData.getAll('images');
    for (const file of newFiles) {
        if (file instanceof File) {
             // Basic validation
             if (file.size > 0) {
                const url = await uploadToCloudinary(file, 'aircrafts');
                finalImages.push(url);
             }
        }
    }
    // Only update images if we processed `keepImages` or received new images
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

    const updatedAircraft = await Aircraft.findByIdAndUpdate(id, updates, { new: true });
    
    return NextResponse.json({ success: true, message: 'Aircraft updated', data: updatedAircraft });

  } catch (error: any) {
    console.error('Update Aircraft Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
