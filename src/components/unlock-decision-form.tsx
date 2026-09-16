"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { ActionState } from "@/actions/lieux";

export function UnlockDecisionForm({
  approveAction,
  rejectAction,
}: {
  approveAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  rejectAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const tu = useTranslations("unlock");
  const [motifTraite, setMotifTraite] = useState("");
  const [approveState, approveFormAction, approvePending] = useActionState(
    approveAction,
    undefined,
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectAction,
    undefined,
  );

  const error = approveState?.error ?? rejectState?.error;

  return (
    <div className="space-y-2">
      <textarea
        placeholder={tu("motifTraitement")}
        value={motifTraite}
        onChange={(e) => setMotifTraite(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <form action={approveFormAction}>
          <input type="hidden" name="motifTraite" value={motifTraite} />
          <button
            type="submit"
            disabled={approvePending || rejectPending}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {tu("approuver")}
          </button>
        </form>
        <form action={rejectFormAction}>
          <input type="hidden" name="motifTraite" value={motifTraite} />
          <button
            type="submit"
            disabled={approvePending || rejectPending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {tu("rejeter")}
          </button>
        </form>
      </div>
    </div>
  );
}
