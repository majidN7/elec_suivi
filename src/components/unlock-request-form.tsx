"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/actions/lieux";

export function UnlockRequestForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ts = useTranslations("saisie");

  if (state && !state.error) {
    return (
      <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
        Demande envoyée. Un administrateur va l&apos;examiner.
      </p>
    );
  }

  return (
    <form action={formAction} className="max-w-md space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {ts("motifDeverouillage")}
        </label>
        <textarea
          name="motif"
          required
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <SubmitButton
        className="rounded-md border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
      >
        {ts("demanderDeverouillage")}
      </SubmitButton>
    </form>
  );
}
