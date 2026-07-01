import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

/**
 * Inject Cloudinary delivery transforms into a URL.
 *
 * Inserts `f_auto,q_auto:best` right after `/upload/` so every consumer
 * gets the optimal format (WebP / AVIF based on browser) with smart
 * compression — without touching the stored original.
 */
function optimizeUrl(url: string): string {
  if (!url || !url.includes('/upload/')) return url;
  const idx = url.indexOf('/upload/');
  const before = url.slice(0, idx + '/upload/'.length);
  const after = url.slice(idx + '/upload/'.length);
  // Don't double-inject
  if (after.startsWith('f_')) return url;
  return `${before}f_auto,q_auto:best/${after}`;
}

/**
 * Upload an image to Cloudinary with automatic quality optimization.
 *
 * - Uses `resource_type: 'auto'` so every format is accepted (HEIC, PNG, JPEG, TIFF…)
 * - The returned URL includes `f_auto,q_auto:best` transforms so Cloudinary
 *   serves the optimal format (WebP/AVIF) with smart compression on every request.
 *   A 10 MB HEIC typically loads as ~200 KB – 1 MB with no visible quality loss.
 */
export const uploadToCloudinary = (file: File | Buffer, folder: string = 'aircrafts'): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (file instanceof File) {
      // @ts-ignore
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      // @ts-ignore
      buffer = Buffer.from(await file.arrayBuffer());
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        // Inject delivery-time optimization into the URL
        resolve(optimizeUrl(result?.secure_url || ''));
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
