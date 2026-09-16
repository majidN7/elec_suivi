import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const VARIANT = {
  success: {
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    Icon: CheckCircle2,
  },
  error: {
    className: "bg-rose-50 text-rose-800 ring-rose-200",
    Icon: XCircle,
  },
  warning: {
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    Icon: AlertTriangle,
  },
  info: {
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    Icon: Info,
  },
} as const;

export function Alert({
  variant = "info",
  children,
}: {
  variant?: keyof typeof VARIANT;
  children: React.ReactNode;
}) {
  const { className, Icon } = VARIANT[variant];

  return (
    <div
      className={`flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm ring-1 ring-inset ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
