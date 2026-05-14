export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * Migrate ALL remaining image URLs from old Cloudinary to new account.
 * Covers: Team (profile_picture, team_member_picture), Logo (logo)
 *
 * Brands and Aircraft are already migrated via their own routes.
 *
 * Safe to re-run: skips URLs already on the new account.
 *
 * POST /api/migrate-images
 */

// Lightweight model loaders (avoid import conflicts)
async function getModels() {
  const mongoose = (await import('mongoose')).default;

  const Team = mongoose.models.Team || mongoose.model('Team', new mongoose.Schema({
    name: String,
    profile_picture: String,
    team_member_picture: String,
  }, { timestamps: true, strict: false }));

  const Logo = mongoose.models.Logo || mongoose.model('Logo', new mongoose.Schema({
    logo: String,
  }, { timestamps: true, strict: false }));

  return { Team, Logo };
}

async function migrateUrl(oldUrl: string, folder: string, cloudName: string): Promise<{ newUrl: string; skipped: boolean }> {
  if (!oldUrl || !oldUrl.trim()) return { newUrl: oldUrl, skipped: true };
  if (oldUrl.includes(cloudName)) return { newUrl: oldUrl, skipped: true };
  if (!oldUrl.includes('cloudinary.com')) return { newUrl: oldUrl, skipped: true };

  const resp = await fetch(oldUrl);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} downloading ${oldUrl}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  const newUrl = await uploadToCloudinary(buf, folder);
  return { newUrl, skipped: false };
}

export async function POST() {
  await dbConnect();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const { Team, Logo } = await getModels();

  const allResults: any[] = [];
  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // ── 1. Team members ───────────────────────────────────────────
  const teams = await Team.find();
  for (const member of teams) {
    const shortId = member._id.toString().slice(-6);
    const updates: any = {};
    let migrated = 0, skipped = 0;
    const errors: string[] = [];

    // profile_picture
    if (member.profile_picture) {
      try {
        const { newUrl, skipped: sk } = await migrateUrl(member.profile_picture, 'teams', cloudName);
        if (!sk) { updates.profile_picture = newUrl; migrated++; } else { skipped++; }
      } catch (e: any) { errors.push(`profile_picture: ${e.message}`); }
    }

    // team_member_picture
    if (member.team_member_picture) {
      try {
        const { newUrl, skipped: sk } = await migrateUrl(member.team_member_picture, 'teams', cloudName);
        if (!sk) { updates.team_member_picture = newUrl; migrated++; } else { skipped++; }
      } catch (e: any) { errors.push(`team_member_picture: ${e.message}`); }
    }

    if (Object.keys(updates).length > 0) {
      await Team.updateOne({ _id: member._id }, { $set: updates });
    }

    totalMigrated += migrated;
    totalSkipped += skipped;
    totalFailed += errors.length;
    allResults.push({ collection: 'Team', id: shortId, name: member.name, migrated, skipped, failed: errors.length, errors: errors.length ? errors : undefined });
  }

  // ── 2. Logos ──────────────────────────────────────────────────
  const logos = await Logo.find();
  for (const logo of logos) {
    const shortId = logo._id.toString().slice(-6);
    let migrated = 0, skipped = 0;
    const errors: string[] = [];

    if (logo.logo) {
      try {
        const { newUrl, skipped: sk } = await migrateUrl(logo.logo, 'logos', cloudName);
        if (!sk) {
          await Logo.updateOne({ _id: logo._id }, { $set: { logo: newUrl } });
          migrated++;
        } else { skipped++; }
      } catch (e: any) { errors.push(`logo: ${e.message}`); }
    }

    totalMigrated += migrated;
    totalSkipped += skipped;
    totalFailed += errors.length;
    allResults.push({ collection: 'Logo', id: shortId, migrated, skipped, failed: errors.length, errors: errors.length ? errors : undefined });
  }

  return NextResponse.json({
    success: true,
    summary: { totalMigrated, totalSkipped, totalFailed },
    results: allResults,
  });
}
