import MobileMenuButton from "@/components/MobileMenuButton";
import DashboardSidebar from "@/components/DashboardSidebar";
import { requireAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try { await requireAdmin(); } catch { redirect('/login?error=' + encodeURIComponent('Se requiere una cuenta de administrador')); }
    return (
        <div className="flex min-h-screen">
            <a href="#main-content" className="skip-link">Saltar al contenido</a>
            <MobileMenuButton>
                <DashboardSidebar />
            </MobileMenuButton>

            <main id="main-content" className="min-h-screen min-w-0 flex-1 pt-16 lg:pt-0">
                <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
