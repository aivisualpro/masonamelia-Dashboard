export const dynamic = "force-dynamic";

// Allow uploads up to 10 MB (Next.js default is 1 MB)
export const maxDuration = 30; // seconds – gives Cloudinary time to respond
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * Generic file upload endpoint.
 * Accepts multipart/form-data with a 'file' field.
 * Returns { success: true, url: "https://..." }
 */
export async function POST(request: NextRequest) {
  try {
    // Pre-flight: make sure Cloudinary env vars are present
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_CLOUD_API_KEY ||
      !process.env.CLOUDINARY_CLOUD_API_SECRET
    ) {
      console.error('[upload] Missing Cloudinary environment variables');
      return NextResponse.json(
        {
          success: false,
          message:
            'Server misconfiguration: Cloudinary credentials are not set. ' +
            'Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_CLOUD_API_KEY, and ' +
            'CLOUDINARY_CLOUD_API_SECRET are defined in Vercel Environment Variables.',
        },
        { status: 500 }
      );
    }

    const fd = await request.formData();
    const file = fd.get('file') as File | null;
    const folder = (fd.get('folder') as string) || 'uploads';

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.` },
        { status: 413 }
      );
    }

    const url = await uploadToCloudinary(file, folder);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('[upload] Upload failed:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
