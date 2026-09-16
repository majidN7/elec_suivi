import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function ButtonLink({
  href,
  icon: Icon,
  children,
  variant = "primary",
}: {
  href: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700"
      : "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50";

  return (
    <Link href={href} className={className}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}
