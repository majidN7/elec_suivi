const VARIANT_CLASS = {
  neutral: "bg-slate-100 text-slate-600",
  brand: "bg-brand-100 text-brand-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-700",
} as const;

export type BadgeVariant = keyof typeof VARIANT_CLASS;

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASS[variant]}`}
    >
      {children}
    </span>
  );
}
