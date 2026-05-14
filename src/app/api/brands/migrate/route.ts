export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brands.model';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST() {
  await dbConnect();

  try {
    const brands = await Brand.find();
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';

    const results: { id: string; status: string; oldUrl?: string; newUrl?: string; error?: string }[] = [];

    for (const brand of brands) {
      const oldUrl = brand.logo;
      const shortId = brand._id.toString().slice(-6);

      // Skip if already on the new account
      if (oldUrl.includes(cloudName)) {
        results.push({ id: shortId, status: 'skipped', oldUrl });
        continue;
      }

      try {
        // Download image from old URL
        const resp = await fetch(oldUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const arrayBuf = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        // Upload to new Cloudinary
        const newUrl = await uploadToCloudinary(buffer, 'brands');

        // Update DB
        await Brand.updateOne({ _id: brand._id }, { $set: { logo: newUrl } });

        results.push({ id: shortId, status: 'migrated', oldUrl, newUrl });
      } catch (err: any) {
        results.push({ id: shortId, status: 'failed', oldUrl, error: err.message });
      }
    }

    const migrated = results.filter(r => r.status === 'migrated').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      summary: { total: brands.length, migrated, skipped, failed },
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
