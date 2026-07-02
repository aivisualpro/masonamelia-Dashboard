import withBundleAnalyzer from '@next/bundle-analyzer';

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Often helpful to disable for legacy MUI templates to avoid double-mount issues during dev
  transpilePackages: ['@mui/system', '@mui/material', '@mui/icons-material'],

  // ─── Tree-shaking: barrel-file elimination ───────────────────────────
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },

  // ─── Experimental optimizations ──────────────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@mui/x-charts',
      '@mui/x-data-grid',
      '@ant-design/icons',
      'lodash-es',
      'framer-motion',
      'react-device-detect',
    ],
  },

  // ─── Compression & security ──────────────────────────────────────────
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  swcMinify: true,

  // ─── Compiler: strip console.log in production ───────────────────────
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // ─── Optimized image pipeline ────────────────────────────────────────
  // Using a custom Cloudinary loader so Next.js does NOT proxy images
  // through /_next/image server-side. The browser fetches directly from
  // Cloudinary's CDN, avoiding ConnectTimeoutError (IPv6 issues in dev).
  images: {
    loader: 'custom',
    loaderFile: './src/utils/cloudinaryLoader.js',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    // remotePatterns not needed with a custom loader
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  // ─── Static-asset caching headers ────────────────────────────────────
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604320',
          },
        ],
      },
    ];
  },
};

export default analyze(nextConfig);
