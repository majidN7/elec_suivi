"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/actions/lieux";

export function BureauForm({
  action,
  lieux,
  defaultValues,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  lieux: { id: string; code: string; nom: string }[];
  defaultValues?: {
    numero: string;
    commune: string;
    nom: string;
    lieuDeVoteId: string;
    code: string | null;
    inscrits: number | null;
  };
}) {
  const [state, formAction] = useActionState(action, undefined);
  const t = useTranslations("geo");
  const tc = useTranslations("common");

  return (
    <Card className="max-w-lg p-6">
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("numero")} htmlFor="numero" required>
            <input
              id="numero"
              name="numero"
              required
              defaultValue={defaultValues?.numero}
              className={inputClass}
            />
          </Field>
          <Field label={t("commune")} htmlFor="commune" required>
            <input
              id="commune"
              name="commune"
              required
              defaultValue={defaultValues?.commune}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label={t("code")} htmlFor="code" hint={t("codeHint")}>
          <input
            id="code"
            name="code"
            defaultValue={defaultValues?.code ?? undefined}
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
        <Field label={t("lieuDeVote")} htmlFor="lieuDeVoteId" required>
          <select
            id="lieuDeVoteId"
            name="lieuDeVoteId"
            required
            defaultValue={defaultValues?.lieuDeVoteId}
            className={inputClass}
          >
            <option value="" disabled>
              —
            </option>
            {lieux.map((lieu) => (
              <option key={lieu.id} value={lieu.id}>
                {lieu.code} — {lieu.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("inscrits")} htmlFor="inscrits">
          <input
            id="inscrits"
            type="number"
            min={0}
            name="inscrits"
            defaultValue={defaultValues?.inscrits ?? undefined}
            className={inputClass}
          />
        </Field>

        {state?.error && <Alert variant="error">{state.error}</Alert>}

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton>{tc("save")}</SubmitButton>
          <Link
            href="/admin/bureaux"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {tc("cancel")}
          </Link>
        </div>
      </form>
    </Card>
  );
}
