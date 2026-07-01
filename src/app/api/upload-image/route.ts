import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Allow up to 5 minutes for large images
export const maxDuration = 300;

// No body size limit for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/upload-image
 * 
 * Uploads a single image to Cloudinary and returns the secure URL.
 * This endpoint is designed to be called sequentially (one image at a time)
 * so that Cloudinary's rate limits are not exceeded when uploading 100s of images.
 * 
 * FormData fields:
 *   - file: The image file to upload
 *   - folder: (optional) The Cloudinary folder, defaults to 'aircrafts'
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'aircrafts';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, message: 'File is empty' },
        { status: 400 }
      );
    }

    const url = await uploadToCloudinary(file, folder);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
