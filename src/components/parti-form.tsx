"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/actions/lieux";

export function PartiForm({
  action,
  defaultValues,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: { code: string; nom: string; couleur: string | null };
}) {
  const [state, formAction] = useActionState(action, undefined);
  const t = useTranslations("geo");
  const tp = useTranslations("partis");
  const tc = useTranslations("common");

  return (
    <Card className="max-w-lg p-6">
      <form action={formAction} className="space-y-4">
        <Field label={t("code")} htmlFor="code" required>
          <input
            id="code"
            name="code"
            required
            defaultValue={defaultValues?.code}
            className={inputClass}
          />
        </Field>
        <Field label={t("nom")} htmlFor="nom" required>
          <input
            id="nom"
            name="nom"
            required
            defaultValue={defaultValues?.nom}
            className={inputClass}
          />
        </Field>
        <Field label={tp("couleur")} htmlFor="couleur">
          <input
            id="couleur"
            type="color"
            name="couleur"
            defaultValue={defaultValues?.couleur ?? "#334155"}
            className="h-10 w-20 cursor-pointer rounded-lg border border-slate-300 p-1"
          />
        </Field>

        {state?.error && <Alert variant="error">{state.error}</Alert>}

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton>{tc("save")}</SubmitButton>
          <Link
            href="/admin/partis"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {tc("cancel")}
          </Link>
        </div>
      </form>
    </Card>
  );
}
