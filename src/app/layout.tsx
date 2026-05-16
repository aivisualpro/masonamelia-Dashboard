import type { Metadata } from "next";
import "./globals.css";
import 'react-quill/dist/quill.snow.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import localFont from 'next/font/local';

import ThemeCustomization from '@/themes/index';
import ScrollTop from '@/components/ScrollTop';
import SWRProvider from '@/components/SWRProvider';

// ─── Optimized font loading via next/font/local (replaces @fontsource) ───
// Only latin subset, 4 weights, woff2 — self-hosted from @fontsource/public-sans
const publicSans = localFont({
  src: [
    { path: '../../public/fonts/public-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/public-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/public-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/public-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-public-sans',
});

export const metadata: Metadata = {
  title: "Mason Amelia Dashboard",
  description: "Dashboard",
  icons: {
    icon: '/avatar.svg',
    shortcut: '/avatar.svg',
    apple: '/avatar.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable} style={{ height: '100%', overflow: 'hidden' }}>
      <body suppressHydrationWarning style={{ height: '100%', overflow: 'hidden', margin: 0 }}>
        <AppRouterCacheProvider>
          <ThemeCustomization>
            <SWRProvider>
              <ScrollTop>
                {children}
              </ScrollTop>
            </SWRProvider>
          </ThemeCustomization>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
