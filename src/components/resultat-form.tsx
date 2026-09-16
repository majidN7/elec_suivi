"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
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
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
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
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
    <form className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {ts("totalVotants")}
          </label>
          <input
            type="number"
            min={0}
            name="totalVotants"
            value={totalVotants}
            onChange={(e) => setTotalVotants(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {ts("votesRejetes")}
          </label>
          <input
            type="number"
            min={0}
            name="votesRejetes"
            value={votesRejetes}
            onChange={(e) => setVotesRejetes(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-700">
          {ts("voixParParti")}
        </h3>
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
          {partis.map((parti) => (
            <div key={parti.id} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: parti.couleur ?? "#94a3b8" }}
              />
              <span className="w-40 truncate text-sm text-slate-700">
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
                className="w-32 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />
            </div>
          ))}
          {partis.length === 0 && (
            <p className="text-sm text-slate-400">Aucun parti politique configuré</p>
          )}
        </div>
      </div>

      <div
        className={`rounded-md px-3 py-2 text-sm ${
          isValid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {ts("sommeControle")}: {sommeControle} / {totalVotants}
        {!isValid && <p className="mt-1">{ts("erreurSomme")}</p>}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <DraftButton formAction={draftFormAction} label={ts("saveDraft")} />
        <SubmitButton
          formAction={submitFormAction}
          label={tc("submit")}
          disabled={!isValid}
          onBeforeSubmit={() => window.confirm(ts("confirmSubmit"))}
        />
      </div>
    </form>
  );
}
