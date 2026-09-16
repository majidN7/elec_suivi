"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/actions/lieux";

export function LieuForm({
  action,
  defaultValues,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: { code: string; nom: string; adresse: string | null };
}) {
  const [state, formAction] = useActionState(action, undefined);
  const t = useTranslations("geo");
  const tc = useTranslations("common");

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t("code")}
        </label>
        <input
          name="code"
          required
          defaultValue={defaultValues?.code}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t("nom")}
        </label>
        <input
          name="nom"
          required
          defaultValue={defaultValues?.nom}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t("adresse")}
        </label>
        <input
          name="adresse"
          defaultValue={defaultValues?.adresse ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton>{tc("save")}</SubmitButton>
    </form>
  );
}
