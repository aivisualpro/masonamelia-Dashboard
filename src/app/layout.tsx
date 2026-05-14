import type { Metadata } from "next";
// import "./globals.css"; // Disabling tailwind globals for now to avoid conflict with MUI? Or keep it? keeping it.
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import "@/themes/index"; // Import theme (although it's a component)

import ThemeCustomization from '@/themes/index';
import ScrollTop from '@/components/ScrollTop';

export const metadata: Metadata = {
  title: "Skynet Jet Dashboard",
  description: "Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%', overflow: 'hidden' }}>
      <body suppressHydrationWarning style={{ height: '100%', overflow: 'hidden', margin: 0 }}>
        <AppRouterCacheProvider>
          <ThemeCustomization>
            <ScrollTop>
              {children}
            </ScrollTop>
          </ThemeCustomization>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
