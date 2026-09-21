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
  defaultValues?: {
    code: string;
    nom: string;
    couleur: string | null;
    numeroListeLocale?: string;
    mandataireLocale?: string;
    numeroListeRegionale?: string;
    mandataireRegionale?: string;
  };
}) {
  const [state, formAction] = useActionState(action, undefined);
  const t = useTranslations("geo");
  const tp = useTranslations("partis");
  const tl = useTranslations("listes");
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

        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700">{tl("locale")}</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label={tp("numeroListe")} htmlFor="numeroListeLocale">
              <input
                id="numeroListeLocale"
                name="numeroListeLocale"
                defaultValue={defaultValues?.numeroListeLocale}
                className={inputClass}
              />
            </Field>
            <Field label={tp("mandataire")} htmlFor="mandataireLocale">
              <input
                id="mandataireLocale"
                name="mandataireLocale"
                defaultValue={defaultValues?.mandataireLocale}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700">{tl("regionale")}</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label={tp("numeroListe")} htmlFor="numeroListeRegionale">
              <input
                id="numeroListeRegionale"
                name="numeroListeRegionale"
                defaultValue={defaultValues?.numeroListeRegionale}
                className={inputClass}
              />
            </Field>
            <Field label={tp("mandataire")} htmlFor="mandataireRegionale">
              <input
                id="mandataireRegionale"
                name="mandataireRegionale"
                defaultValue={defaultValues?.mandataireRegionale}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

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
