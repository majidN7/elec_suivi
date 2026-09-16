"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/actions/lieux";

type Bureau = { id: string; code: string; nom: string };

export function UserForm({
  action,
  bureaux,
  requirePassword,
  defaultValues,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  bureaux: Bureau[];
  requirePassword: boolean;
  defaultValues?: {
    name: string;
    email: string;
    role: "ADMIN_NATIONAL" | "AGENT_SAISIE";
    actif: boolean;
    bureauIds: string[];
  };
}) {
  const [state, formAction] = useActionState(action, undefined);
  const tu = useTranslations("users");
  const tr = useTranslations("roles");
  const tc = useTranslations("common");
  const [role, setRole] = useState(defaultValues?.role ?? "AGENT_SAISIE");

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {tu("nom")}
        </label>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {tu("email")}
        </label>
        <input
          type="email"
          name="email"
          required
          defaultValue={defaultValues?.email}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {tu("motDePasse")}{" "}
          {!requirePassword && (
            <span className="text-xs text-slate-400">
              (laisser vide pour ne pas changer)
            </span>
          )}
        </label>
        <input
          type="password"
          name="password"
          required={requirePassword}
          minLength={8}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {tu("role")}
        </label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="AGENT_SAISIE">{tr("AGENT_SAISIE")}</option>
          <option value="ADMIN_NATIONAL">{tr("ADMIN_NATIONAL")}</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="actif"
          name="actif"
          defaultChecked={defaultValues?.actif ?? true}
        />
        <label htmlFor="actif" className="text-sm text-slate-700">
          {tu("actif")}
        </label>
      </div>

      {role === "AGENT_SAISIE" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {tu("bureauxAssignes")}
          </label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-slate-300 p-2">
            {bureaux.map((bureau) => (
              <label key={bureau.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="bureauIds"
                  value={bureau.id}
                  defaultChecked={defaultValues?.bureauIds.includes(bureau.id)}
                />
                {bureau.code} — {bureau.nom}
              </label>
            ))}
            {bureaux.length === 0 && (
              <p className="text-sm text-slate-400">Aucun bureau de vote</p>
            )}
          </div>
        </div>
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton>{tc("save")}</SubmitButton>
    </form>
  );
}
