import Link from "next/link";
import { Pencil } from "lucide-react";

export function EditLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
    >
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
