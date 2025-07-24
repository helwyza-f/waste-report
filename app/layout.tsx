import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import PWAInstallPrompt from "@/components/pwainstallprompt";

import PushPermissionBanner from "@/components/push-permission-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WasteReport",
    template: "%s | WasteReport",
  },
  description:
    "Laporkan sampah dengan mudah. Aplikasi pelaporan sampah berbasis PWA.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://helwiza.com"
  ),
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "WasteReport",
    description: "Laporkan sampah dengan mudah melalui aplikasi PWA.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "WasteReport",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "WasteReport Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WasteReport",
    description: "Laporkan sampah dengan mudah melalui aplikasi PWA.",
    images: ["/icons/icon-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={geistSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="pt-5 px-4 max-w-6xl mx-auto">{children}</main>
          <Toaster />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
