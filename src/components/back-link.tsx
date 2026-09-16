import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
    >
      <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
      {label}
    </Link>
  );
}
