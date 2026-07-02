/**
 * Next.js custom image loader for Cloudinary.
 *
 * Tells Next.js to skip its /_next/image proxy entirely for Cloudinary images.
 * Instead, it builds an optimized Cloudinary URL directly — the browser fetches
 * from Cloudinary's CDN without the server acting as a middleman.
 *
 * This prevents ConnectTimeoutError when the server has IPv6 issues reaching
 * Cloudinary (a common problem in local dev / certain hosting environments).
 */
export default function cloudinaryLoader({ src, width, quality }) {
  // For non-Cloudinary URLs (e.g. placehold.co), return as-is
  if (!src || !src.includes('res.cloudinary.com')) return src;

  const uploadIdx = src.indexOf('/upload/');
  if (uploadIdx === -1) return src;

  const before = src.slice(0, uploadIdx + '/upload/'.length);
  const after = src.slice(uploadIdx + '/upload/'.length);

  // Strip any existing transformation segment so we don't double-apply
  // A transform segment looks like: f_auto,q_auto/ or w_auto,f_auto/
  const transformStripped = after.replace(/^[a-z_,0-9:]+\//, '');

  const q = quality || 'auto';
  const transform = `f_auto,q_${q},w_${width}`;

  return `${before}${transform}/${transformStripped}`;
}
