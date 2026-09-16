"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/actions/lieux";

type Parti = { id: string; code: string; nom: string; couleur: string | null };
type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;
type FormDispatch = (formData: FormData) => void;

function DraftButton({
  formAction,
  label,
}: {
  formAction: FormDispatch;
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
    >
      {pending ? "..." : label}
    </button>
  );
}

function SubmitButton({
  formAction,
  label,
  disabled,
  onBeforeSubmit,
}: {
  formAction: FormDispatch;
  label: string;
  disabled: boolean;
  onBeforeSubmit: () => boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={disabled || pending}
      onClick={(e) => {
        if (!onBeforeSubmit()) {
          e.preventDefault();
        }
      }}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "..." : label}
    </button>
  );
}

export function ResultatForm({
  draftAction,
  submitAction,
  partis,
  defaultValues,
}: {
  draftAction: ServerAction;
  submitAction: ServerAction;
  partis: Parti[];
  defaultValues: {
    totalVotants: number;
    votesRejetes: number;
    voix: Record<string, number>;
  };
}) {
  const ts = useTranslations("saisie");
  const tc = useTranslations("common");

  const [draftState, draftFormAction] = useActionState(draftAction, undefined);
  const [submitState, submitFormAction] = useActionState(submitAction, undefined);

  const [totalVotants, setTotalVotants] = useState(defaultValues.totalVotants);
  const [votesRejetes, setVotesRejetes] = useState(defaultValues.votesRejetes);
  const [voix, setVoix] = useState<Record<string, number>>(defaultValues.voix);

  const sommeVoix = useMemo(
    () => Object.values(voix).reduce((acc, v) => acc + (v || 0), 0),
    [voix],
  );
  const sommeControle = sommeVoix + (votesRejetes || 0);
  const isValid = sommeControle === totalVotants;

  const error = submitState?.error ?? draftState?.error;

  return (
    <Card className="max-w-2xl p-6">
      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label={ts("totalVotants")} htmlFor="totalVotants" required>
            <input
              id="totalVotants"
              type="number"
              min={0}
              name="totalVotants"
              value={totalVotants}
              onChange={(e) => setTotalVotants(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label={ts("votesRejetes")} htmlFor="votesRejetes" required>
            <input
              id="votesRejetes"
              type="number"
              min={0}
              name="votesRejetes"
              value={votesRejetes}
              onChange={(e) => setVotesRejetes(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">
            {ts("voixParParti")}
          </h3>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {partis.map((parti) => (
              <div key={parti.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: parti.couleur ?? "#94a3b8" }}
                />
                <span className="flex-1 truncate text-sm text-slate-700">
                  {parti.nom}
                </span>
                <input
                  type="number"
                  min={0}
                  name={`voix_${parti.id}`}
                  value={voix[parti.id] ?? 0}
                  onChange={(e) =>
                    setVoix((prev) => ({
                      ...prev,
                      [parti.id]: Number(e.target.value),
                    }))
                  }
                  className={`${inputClass} w-28 text-end`}
                />
              </div>
            ))}
            {partis.length === 0 && (
              <p className="px-3.5 py-3 text-sm text-slate-400">
                {ts("aucunParti")}
              </p>
            )}
          </div>
        </div>

        <div
          className={`flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm ring-1 ring-inset ${
            isValid
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-amber-50 text-amber-800 ring-amber-200"
          }`}
        >
          {isValid ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            <span className="font-medium">
              {ts("sommeControle")}: {sommeControle} / {totalVotants}
            </span>
            {!isValid && <p className="mt-0.5">{ts("erreurSomme")}</p>}
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex items-center gap-3 pt-1">
          <DraftButton formAction={draftFormAction} label={ts("saveDraft")} />
          <SubmitButton
            formAction={submitFormAction}
            label={tc("submit")}
            disabled={!isValid}
            onBeforeSubmit={() => window.confirm(ts("confirmSubmit"))}
          />
        </div>
      </form>
    </Card>
  );
}
