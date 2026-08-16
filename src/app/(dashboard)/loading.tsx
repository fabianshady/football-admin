import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
        <p className="text-sm font-medium tracking-wide">Cargando datos del vestidor...</p>
      </div>
    </div>
  );
}
