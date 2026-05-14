/**
 * Migration script: Re-upload all Brand logos to the new Cloudinary account.
 *
 * 1. Connect to MongoDB
 * 2. Fetch all Brand documents
 * 3. Download each image from the old URL
 * 4. Upload to the NEW Cloudinary account
 * 5. Update the Brand document with the new URL
 *
 * Run: node scripts/migrate-brands-cloudinary.mjs
 */

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import https from 'https';
import http from 'http';

// ── Config (reads from .env.local) ──────────────────────────────
const MONGO_URL = 'mongodb+srv://admin_db_user:N36etR5qV9ERTdwY@cluster0.ummmkan.mongodb.net/mainDb';
const CLOUD_NAME = 'dfhmut9lf';
const API_KEY = '892774349659755';
const API_SECRET = 'wollksuLbhMwcEGp-CsQe2lh7gc';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

// ── Brand schema (minimal) ──────────────────────────────────────
const brandSchema = new mongoose.Schema({
  logo: { type: String, required: true },
}, { timestamps: true });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

// ── Download helper ─────────────────────────────────────────────
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ── Upload helper ───────────────────────────────────────────────
function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result?.secure_url || '');
      }
    );
    stream.end(buffer);
  });
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('✅ Connected.\n');

  const brands = await Brand.find();
  console.log(`📦 Found ${brands.length} brands to migrate.\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const brand of brands) {
    const oldUrl = brand.logo;
    const shortId = brand._id.toString().slice(-6);

    // Skip if already on the new account
    if (oldUrl.includes(`//${CLOUD_NAME}`) || oldUrl.includes(`res.cloudinary.com/${CLOUD_NAME}`)) {
      console.log(`⏭  [${shortId}] Already on new account — skipping`);
      skipped++;
      continue;
    }

    try {
      console.log(`⬇  [${shortId}] Downloading: ${oldUrl.slice(0, 80)}...`);
      const buffer = await downloadBuffer(oldUrl);
      console.log(`   Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);

      console.log(`⬆  [${shortId}] Uploading to new Cloudinary...`);
      const newUrl = await uploadBuffer(buffer, 'brands');
      console.log(`   New URL: ${newUrl.slice(0, 80)}...`);

      await Brand.updateOne({ _id: brand._id }, { $set: { logo: newUrl } });
      console.log(`✅ [${shortId}] Updated in DB.\n`);
      migrated++;
    } catch (err) {
      console.error(`❌ [${shortId}] FAILED: ${err.message}\n`);
      failed++;
    }
  }

  console.log('═══════════════════════════════════════');
  console.log(`Migration complete!`);
  console.log(`  ✅ Migrated: ${migrated}`);
  console.log(`  ⏭  Skipped:  ${skipped}`);
  console.log(`  ❌ Failed:   ${failed}`);
  console.log('═══════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
