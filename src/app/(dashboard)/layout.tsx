import MobileMenuButton from "@/components/MobileMenuButton";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <MobileMenuButton>
                <DashboardSidebar />
            </MobileMenuButton>

            <main className="min-h-screen min-w-0 flex-1 pt-16 lg:pt-0">
                <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
