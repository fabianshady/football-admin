import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { themeScript } from '@/lib/theme';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ITJAGUARS Admin",
  description: "Panel de administración de ITJAGUARS FC",
  icons: {
    icon: "https://vpl0mb2pgnbucvy2.public.blob.vercel-storage.com/logo.png",
    apple: "https://vpl0mb2pgnbucvy2.public.blob.vercel-storage.com/logo.png",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className={inter.className}>
        <div className="min-h-screen animated-gradient-bg">{children}</div>
      </body>
    </html>
  );
}
