"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "...",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
