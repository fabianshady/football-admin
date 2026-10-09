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
  title: { default: "ITJAGUARS FC · Administración", template: "%s · ITJAGUARS FC Admin" },
  description: "Panel de administración de ITJAGUARS FC",
  applicationName: "ITJAGUARS FC Admin",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
  openGraph: { title: "ITJAGUARS FC · Administración", description: "Panel privado de gestión del club", locale: "es_MX", type: "website" },
  twitter: { card: "summary", title: "ITJAGUARS FC · Administración", description: "Panel privado de gestión del club" },
  icons: {
    icon: { url: "/logo.png", type: "image/png" },
    apple: "/logo.png",
    shortcut: "/logo.png",
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
