"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/actions/lieux";

export function UnlockRequestForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ts = useTranslations("saisie");

  if (state && !state.error) {
    return <Alert variant="success">{ts("demandeEnvoyee")}</Alert>;
  }

  return (
    <Card className="max-w-md p-5">
      <form action={formAction} className="space-y-3">
        <Field label={ts("motifDeverouillage")} htmlFor="motif" required>
          <textarea id="motif" name="motif" required rows={3} className={inputClass} />
        </Field>
        {state?.error && <Alert variant="error">{state.error}</Alert>}
        <button
          type="submit"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
        >
          {ts("demanderDeverouillage")}
        </button>
      </form>
    </Card>
  );
}
