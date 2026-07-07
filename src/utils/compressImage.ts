/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║            SMART ADAPTIVE IMAGE COMPRESSION ENGINE                  ║
 * ║                                                                      ║
 * ║  Client-side intelligent compression that automatically finds the    ║
 * ║  optimal quality & resolution to produce the smallest possible       ║
 * ║  file while preserving visual fidelity. Works with any file size     ║
 * ║  — from 1 KB selfies to 50 MB DSLR shots.                           ║
 * ║                                                                      ║
 * ║  Key features:                                                       ║
 * ║  • Adaptive quality: binary-search to hit target file size           ║
 * ║  • Smart resolution tiers: picks optimal dimensions per file size    ║
 * ║  • WebP-first with JPEG fallback (for Safari < 14)                   ║
 * ║  • EXIF orientation handling via createImageBitmap                   ║
 * ║  • Progress callbacks for real-time UI updates                       ║
 * ║  • Concurrent-safe: each call is fully isolated                      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────

export interface CompressionOptions {
  /** Target maximum file size in bytes. Default: 900 KB (safe for Cloudinary free) */
  targetSizeBytes?: number;
  /** Maximum pixel dimension (width or height). Default: auto-detected */
  maxDimension?: number;
  /** Minimum quality floor (0–1). Default: 0.55 — never goes uglier than this */
  minQuality?: number;
  /** Maximum quality ceiling (0–1). Default: 0.92 */
  maxQuality?: number;
  /** Preferred output format. Default: 'image/webp' with JPEG fallback */
  outputFormat?: 'image/webp' | 'image/jpeg';
  /** Callback with progress updates (0–100) */
  onProgress?: (progress: number, stage: string) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  quality: number;
  format: string;
  durationMs: number;
}

// ── Resolution tiers based on original file size ────────────────────

/**
 * Smart resolution selection: larger files get more aggressive downscaling
 * because they're typically from high-res cameras where 4000×3000 → 2400×1600
 * is visually indistinguishable on web.
 */
function getOptimalMaxDimension(originalSizeBytes: number, originalWidth: number, originalHeight: number): number {
  const sizeMB = originalSizeBytes / (1024 * 1024);
  const maxOriginal = Math.max(originalWidth, originalHeight);

  // Tiny images (< 500 KB): don't touch
  if (sizeMB < 0.5) return maxOriginal;

  // Small images (0.5–2 MB): light resize
  if (sizeMB < 2) return Math.min(maxOriginal, 2400);

  // Medium images (2–5 MB): moderate resize
  if (sizeMB < 5) return Math.min(maxOriginal, 2000);

  // Large images (5–10 MB): aggressive resize
  if (sizeMB < 10) return Math.min(maxOriginal, 1800);

  // Very large images (10–20 MB): heavy resize
  if (sizeMB < 20) return Math.min(maxOriginal, 1600);

  // Monster images (20 MB+): maximum resize
  return Math.min(maxOriginal, 1400);
}

// ── Format support detection (cached) ───────────────────────────────

let _webpSupported: boolean | null = null;

async function isWebPSupported(): Promise<boolean> {
  if (_webpSupported !== null) return _webpSupported;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    _webpSupported = dataUrl.startsWith('data:image/webp');
  } catch {
    _webpSupported = false;
  }

  return _webpSupported;
}

// ── Core canvas compression ─────────────────────────────────────────

async function renderToCanvas(
  file: File,
  maxDimension: number,
  onProgress?: (p: number, s: string) => void
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  onProgress?.(10, 'Decoding image…');

  // Use createImageBitmap for EXIF-aware decoding (handles rotation)
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Fallback for older browsers
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        onProgress?.(30, 'Image decoded');
        resolve({ canvas, width, height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to decode image'));
      };
      img.src = url;
    });
  }

  let { width, height } = bitmap;

  // Apply dimension constraints while preserving aspect ratio
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  onProgress?.(25, 'Rendering…');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // High-quality resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  onProgress?.(35, 'Image rendered');

  return { canvas, width, height };
}

function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, format, quality);
  });
}

// ── Binary-search quality optimizer ─────────────────────────────────

/**
 * Finds the highest quality setting that produces a file under the target size.
 * Uses a binary search approach for efficiency — typically finds optimal
 * quality in 4–6 iterations instead of stepping linearly.
 */
async function findOptimalQuality(
  canvas: HTMLCanvasElement,
  format: string,
  targetBytes: number,
  minQ: number,
  maxQ: number,
  onProgress?: (p: number, s: string) => void,
): Promise<{ blob: Blob; quality: number }> {
  let lo = minQ;
  let hi = maxQ;
  let bestBlob: Blob | null = null;
  let bestQ = maxQ;
  let iteration = 0;
  const maxIterations = 7;

  // First try at max quality — if it's already small enough, we're done
  const firstBlob = await canvasToBlob(canvas, format, maxQ);
  if (firstBlob && firstBlob.size <= targetBytes) {
    return { blob: firstBlob, quality: maxQ };
  }

  while (iteration < maxIterations && (hi - lo) > 0.02) {
    const mid = (lo + hi) / 2;
    const progressPct = 40 + Math.round((iteration / maxIterations) * 45);
    onProgress?.(progressPct, `Optimizing quality… (pass ${iteration + 1})`);

    const blob = await canvasToBlob(canvas, format, mid);
    if (!blob) break;

    if (blob.size <= targetBytes) {
      // Under budget — try higher quality
      bestBlob = blob;
      bestQ = mid;
      lo = mid;
    } else {
      // Over budget — try lower quality
      hi = mid;
    }

    iteration++;
  }

  // If binary search didn't find anything under target, use the lowest quality result
  if (!bestBlob) {
    bestBlob = await canvasToBlob(canvas, format, minQ);
    bestQ = minQ;
  }

  return { blob: bestBlob!, quality: bestQ };
}

// ── Main compression function ───────────────────────────────────────

/**
 * Intelligently compress an image file to an optimal size for web upload.
 *
 * The algorithm:
 * 1. Decode the image respecting EXIF orientation
 * 2. Auto-select optimal max dimension based on original file size
 * 3. Render to a downscaled canvas
 * 4. Binary-search for the highest quality that fits under target size
 * 5. If WebP isn't supported, fall back to JPEG
 * 6. Return a new File with compression metadata
 *
 * @example
 * ```ts
 * const result = await compressImage(file, {
 *   targetSizeBytes: 900_000,
 *   onProgress: (pct, stage) => console.log(`${pct}% — ${stage}`)
 * });
 * console.log(`${result.originalSize} → ${result.compressedSize} (${result.compressionRatio}x)`);
 * ```
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const startTime = performance.now();
  const {
    targetSizeBytes = 900_000,        // 900 KB default
    maxDimension: userMaxDim,
    minQuality = 0.55,
    maxQuality = 0.92,
    outputFormat: preferredFormat = 'image/webp',
    onProgress,
  } = options;

  onProgress?.(0, 'Starting compression…');

  // Skip non-image files
  if (!file.type.startsWith('image/') && !isImageLike(file.name)) {
    onProgress?.(100, 'Skipped (not an image)');
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
      width: 0, height: 0,
      quality: 1,
      format: file.type,
      durationMs: performance.now() - startTime,
    };
  }

  // Already small enough? Skip compression entirely
  if (file.size <= targetSizeBytes * 0.8) {
    onProgress?.(100, 'Already optimized');
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
      width: 0, height: 0,
      quality: 1,
      format: file.type,
      durationMs: performance.now() - startTime,
    };
  }

  // Detect format support
  onProgress?.(5, 'Checking format support…');
  const webpOk = await isWebPSupported();
  const format = preferredFormat === 'image/webp' && webpOk ? 'image/webp' : 'image/jpeg';

  // Step 1: Decode and render to canvas
  // First pass — use auto-detected dimension
  let maxDim = userMaxDim ?? getOptimalMaxDimension(file.size, 9999, 9999);

  // We need to decode first to get actual dimensions
  const { canvas, width, height } = await renderToCanvas(file, maxDim, onProgress);

  // Re-calculate optimal dimension now that we know actual image size
  if (!userMaxDim) {
    const optimalDim = getOptimalMaxDimension(file.size, width, height);
    if (optimalDim < maxDim) {
      // Need to re-render at smaller size
      const rerendered = await renderToCanvas(file, optimalDim, onProgress);
      canvas.width = rerendered.width;
      canvas.height = rerendered.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(rerendered.canvas, 0, 0);
      Object.assign(canvas, { width: rerendered.width, height: rerendered.height });
    }
  }

  // Step 2: Binary-search for optimal quality
  onProgress?.(40, 'Finding optimal quality…');
  const { blob, quality } = await findOptimalQuality(
    canvas, format, targetSizeBytes, minQuality, maxQuality, onProgress
  );

  // Step 3: If still too large with format, try the other format
  let finalBlob = blob;
  let finalFormat = format;
  let finalQuality = quality;

  if (blob.size > targetSizeBytes && format === 'image/webp') {
    onProgress?.(88, 'Trying JPEG fallback…');
    const jpegResult = await findOptimalQuality(
      canvas, 'image/jpeg', targetSizeBytes, minQuality, maxQuality
    );
    if (jpegResult.blob.size < blob.size) {
      finalBlob = jpegResult.blob;
      finalFormat = 'image/jpeg';
      finalQuality = jpegResult.quality;
    }
  }

  // Step 4: Build the output File
  onProgress?.(95, 'Finalizing…');
  const ext = finalFormat === 'image/webp' ? '.webp' : '.jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const outputFile = new File([finalBlob], `${baseName}${ext}`, {
    type: finalFormat,
    lastModified: Date.now(),
  });

  const durationMs = performance.now() - startTime;
  const result: CompressionResult = {
    file: outputFile,
    originalSize: file.size,
    compressedSize: outputFile.size,
    compressionRatio: Math.round((file.size / outputFile.size) * 10) / 10,
    width: canvas.width,
    height: canvas.height,
    quality: Math.round(finalQuality * 100) / 100,
    format: finalFormat,
    durationMs: Math.round(durationMs),
  };

  onProgress?.(100, `Done — ${formatBytes(file.size)} → ${formatBytes(outputFile.size)} (${result.compressionRatio}x)`);

  return result;
}

// ── Batch compression with sequential processing ────────────────────

export interface BatchProgress {
  /** Index of the image currently being processed (0-based) */
  currentIndex: number;
  /** Total number of images to process */
  totalImages: number;
  /** Per-image progress (0–100) */
  imageProgress: number;
  /** Overall progress (0–100) */
  overallProgress: number;
  /** Current stage description */
  stage: string;
  /** File name being processed */
  fileName: string;
  /** Results completed so far */
  completedResults: CompressionResult[];
}

/**
 * Compress multiple images sequentially with progress tracking.
 * Designed for the gallery upload flow — processes one at a time
 * to avoid memory pressure on mobile devices.
 */
export async function compressImageBatch(
  files: File[],
  options: Omit<CompressionOptions, 'onProgress'> & {
    onBatchProgress?: (progress: BatchProgress) => void;
  } = {}
): Promise<CompressionResult[]> {
  const { onBatchProgress, ...compressionOpts } = options;
  const results: CompressionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await compressImage(file, {
      ...compressionOpts,
      onProgress: (pct, stage) => {
        onBatchProgress?.({
          currentIndex: i,
          totalImages: files.length,
          imageProgress: pct,
          overallProgress: Math.round(((i + pct / 100) / files.length) * 100),
          stage,
          fileName: file.name,
          completedResults: results,
        });
      },
    });

    results.push(result);
  }

  return results;
}

// ── Helpers ──────────────────────────────────────────────────────────

function isImageLike(name: string): boolean {
  return /\.(jpe?g|png|gif|webp|bmp|svg|tiff?|heic|heif|avif)$/i.test(name);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}
