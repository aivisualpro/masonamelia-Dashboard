/**
 * Cloudinary URL optimizer.
 *
 * Takes any image URL and, if it's a Cloudinary URL, injects
 * auto-format/quality/width/DPR transforms right after "/upload/".
 *
 * Non-Cloudinary URLs are returned unchanged.
 *
 * @param {string} url  - Original image URL
 * @param {object} [opts]
 * @param {number} [opts.width]  - Desired width in px (overrides w_auto)
 * @param {number} [opts.quality] - Quality 1-100 (overrides q_auto)
 * @returns {string} Optimized URL
 */
export function optimizeCloudinaryUrl(url, opts = {}) {
  if (!url || typeof url !== 'string') return url || '';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // Build transform segment
  const parts = ['f_auto'];
  parts.push(opts.quality ? `q_${opts.quality}` : 'q_auto');
  parts.push(opts.width ? `w_${opts.width}` : 'w_auto');
  parts.push('dpr_auto');
  const transform = parts.join(',');

  // Inject after /upload/ (before any existing transforms or the version/path)
  // Pattern: .../upload/v1234/... or .../upload/folder/...
  const uploadIdx = url.indexOf('/upload/');
  if (uploadIdx === -1) return url;

  const before = url.slice(0, uploadIdx + '/upload/'.length);
  const after = url.slice(uploadIdx + '/upload/'.length);

  // Don't double-inject if already has f_auto
  if (after.startsWith('f_auto')) return url;

  return `${before}${transform}/${after}`;
}
