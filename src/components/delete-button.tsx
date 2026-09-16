"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Supprimer",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(async () => {
            try {
              await action();
              router.refresh();
            } catch (e) {
              alert(e instanceof Error ? e.message : "Erreur");
            }
          });
        }
      }}
      className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 transition-colors hover:text-rose-700 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
