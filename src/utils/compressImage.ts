/**
 * Client-side image compression using Canvas API.
 *
 * Resizes and re-encodes the image before upload so the browser→server→Cloudinary
 * path only transfers a small payload (typically 100–400 KB instead of 5–10 MB).
 */
export function compressImage(
  file: File,
  { maxWidth = 1200, maxHeight = 1200, quality = 0.82, type = 'image/webp' } = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip non-image files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Downscale if needed, preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback: return original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          // Preserve original name but change extension
          const ext = type === 'image/webp' ? '.webp' : type === 'image/jpeg' ? '.jpg' : '.png';
          const name = file.name.replace(/\.[^.]+$/, '') + ext;
          resolve(new File([blob], name, { type, lastModified: Date.now() }));
        },
        type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}
