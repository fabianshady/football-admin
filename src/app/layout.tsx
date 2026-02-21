import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import MobileMenuButton from "@/components/MobileMenuButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Club Manager",
  description: "App de administración de futbol",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex min-h-screen text-gray-800 dark:text-gray-100`}>
        <MobileMenuButton>
          {/* SIDEBAR */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-xl">
            <div className="p-6 text-2xl font-black tracking-tighter border-b border-gray-800">
              ⚽ CLUB<span className="text-blue-500">ADMIN</span>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link href="/" className="block px-4 py-3 rounded hover:bg-gray-800 transition">
                🏠 Dashboard
              </Link>
              <div className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2 px-4">Gestión</div>
              <Link href="/admin/players" className="block px-4 py-3 rounded hover:bg-gray-800 transition flex items-center gap-3">
                🏃 Jugadores
              </Link>
              <Link href="/admin/payments" className="block px-4 py-3 rounded hover:bg-gray-800 transition flex items-center gap-3">
                💸 Pagos y Deudas
              </Link>
              <div className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2 px-4">Cancha</div>
              <Link href="/admin/matches" className="block px-4 py-3 rounded hover:bg-gray-800 transition flex items-center gap-3">
                🏟️ Partidos
              </Link>
              <Link href="/admin/goals" className="block px-4 py-3 rounded hover:bg-gray-800 transition flex items-center gap-3">
                🥅 Goleo
              </Link>
            </nav>

            <div className="p-4 text-xs text-gray-500 border-t border-gray-800 text-center">
              fabianshady &copy; {new Date().getFullYear()}<br />
            </div>
          </aside>
        </MobileMenuButton>

        {/* MAIN CONTENT WRAPPER */}
        <main className="flex-1 min-h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900 lg:ml-0 pt-16 lg:pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}