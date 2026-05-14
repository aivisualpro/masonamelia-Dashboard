export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow up to 5 min

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Aircraft from '@/lib/models/Aircraft.model';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * Migrate all Aircraft images (featuredImage + images[]) from old Cloudinary to new account.
 *
 * Safe to re-run: skips any URL already on the new account.
 *
 * POST /api/aircrafts/migrate
 */

async function migrateUrl(oldUrl: string, folder: string, cloudName: string): Promise<{ newUrl: string; skipped: boolean }> {
  // Skip if already on the new account or not a cloudinary URL
  if (!oldUrl || oldUrl.includes(cloudName) || !oldUrl.includes('cloudinary.com')) {
    return { newUrl: oldUrl, skipped: true };
  }

  // Download from old URL (public, no auth needed)
  const resp = await fetch(oldUrl);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} downloading ${oldUrl}`);
  const arrayBuf = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  // Upload to new account
  const newUrl = await uploadToCloudinary(buffer, folder);
  return { newUrl, skipped: false };
}

export async function POST() {
  await dbConnect();

  try {
    const aircrafts = await Aircraft.find().select('title featuredImage images');
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';

    const results: any[] = [];
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (const aircraft of aircrafts) {
      const shortId = aircraft._id.toString().slice(-6);
      const title = aircraft.title || 'Untitled';
      const updates: any = {};
      let migratedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      // ── Featured Image ──
      if (aircraft.featuredImage) {
        try {
          const { newUrl, skipped } = await migrateUrl(aircraft.featuredImage, 'aircrafts', cloudName);
          if (!skipped) {
            updates.featuredImage = newUrl;
            migratedCount++;
          } else {
            skippedCount++;
          }
        } catch (err: any) {
          errors.push(`featuredImage: ${err.message}`);
        }
      }

      // ── Gallery Images ──
      if (Array.isArray(aircraft.images) && aircraft.images.length > 0) {
        const newImages: string[] = [];
        for (let i = 0; i < aircraft.images.length; i++) {
          const imgUrl = aircraft.images[i];
          try {
            const { newUrl, skipped } = await migrateUrl(imgUrl, 'aircrafts', cloudName);
            newImages.push(newUrl);
            if (!skipped) {
              migratedCount++;
            } else {
              skippedCount++;
            }
          } catch (err: any) {
            // Keep old URL on failure so we don't lose data
            newImages.push(imgUrl);
            errors.push(`images[${i}]: ${err.message}`);
          }
        }
        // Only update if at least one image was migrated
        if (migratedCount > 0 || newImages.some((u, i) => u !== aircraft.images[i])) {
          updates.images = newImages;
        }
      }

      // ── Update DB only if we have changes ──
      if (Object.keys(updates).length > 0) {
        await Aircraft.updateOne({ _id: aircraft._id }, { $set: updates });
      }

      totalMigrated += migratedCount;
      totalSkipped += skippedCount;
      totalFailed += errors.length;

      results.push({
        id: shortId,
        title,
        migrated: migratedCount,
        skipped: skippedCount,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalAircraft: aircrafts.length,
        totalImages: totalMigrated + totalSkipped + totalFailed,
        migrated: totalMigrated,
        skipped: totalSkipped,
        failed: totalFailed,
      },
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
