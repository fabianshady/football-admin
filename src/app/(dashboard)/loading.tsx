import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium tracking-wide">Cargando datos del vestidor...</p>
      </div>
    </div>
  );
}
