"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

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
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "..." : label}
    </button>
  );
}
