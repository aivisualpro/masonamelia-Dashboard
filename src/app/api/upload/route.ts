export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * Generic file upload endpoint.
 * Accepts multipart/form-data with a 'file' field.
 * Returns { success: true, url: "https://..." }
 */
export async function POST(request: NextRequest) {
  try {
    const fd = await request.formData();
    const file = fd.get('file') as File | null;
    const folder = (fd.get('folder') as string) || 'uploads';

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    const url = await uploadToCloudinary(file, folder);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
