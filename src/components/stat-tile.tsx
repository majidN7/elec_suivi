import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-4 w-4 text-brand-600" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>}
    </Card>
  );
}
