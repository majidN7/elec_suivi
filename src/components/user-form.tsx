"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ShieldCheck, Vote } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/actions/lieux";

type Bureau = { id: string; code: string; nom: string };
type Role = "ADMIN_NATIONAL" | "AGENT_SAISIE";

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
    role: Role;
    actif: boolean;
    bureauIds: string[];
  };
}) {
  const [state, formAction] = useActionState(action, undefined);
  const tu = useTranslations("users");
  const tr = useTranslations("roles");
  const tc = useTranslations("common");
  const [role, setRole] = useState<Role>(defaultValues?.role ?? "AGENT_SAISIE");

  return (
    <Card className="max-w-lg p-6">
      <form action={formAction} className="space-y-5">
        <Field label={tu("nom")} htmlFor="name" required>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name}
            className={inputClass}
          />
        </Field>
        <Field label={tu("email")} htmlFor="email" required>
          <input
            id="email"
            type="email"
            name="email"
            required
            defaultValue={defaultValues?.email}
            className={inputClass}
          />
        </Field>
        <Field
          label={tu("motDePasse")}
          htmlFor="password"
          required={requirePassword}
          hint={!requirePassword ? "(laisser vide pour ne pas changer)" : undefined}
        >
          <input
            id="password"
            type="password"
            name="password"
            required={requirePassword}
            minLength={8}
            className={inputClass}
          />
        </Field>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">{tu("role")}</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "AGENT_SAISIE" as const, icon: Vote },
                { value: "ADMIN_NATIONAL" as const, icon: ShieldCheck },
              ]
            ).map(({ value, icon: Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  role === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="sr-only"
                />
                <Icon className="h-4 w-4" />
                {tr(value)}
              </label>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            id="actif"
            name="actif"
            defaultChecked={defaultValues?.actif ?? true}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
          />
          {tu("actif")}
        </label>

        {role === "AGENT_SAISIE" && (
          <Field label={tu("bureauxAssignes")}>
            <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-lg border border-slate-300 p-1.5">
              {bureaux.map((bureau) => (
                <label
                  key={bureau.id}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    name="bureauIds"
                    value={bureau.id}
                    defaultChecked={defaultValues?.bureauIds.includes(bureau.id)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
                  />
                  <span className="font-mono text-xs text-slate-400">{bureau.code}</span>
                  {bureau.nom}
                </label>
              ))}
              {bureaux.length === 0 && (
                <p className="px-2 py-1.5 text-sm text-slate-400">Aucun bureau de vote</p>
              )}
            </div>
          </Field>
        )}

        {state?.error && <Alert variant="error">{state.error}</Alert>}

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton>{tc("save")}</SubmitButton>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {tc("cancel")}
          </Link>
        </div>
      </form>
    </Card>
  );
}
