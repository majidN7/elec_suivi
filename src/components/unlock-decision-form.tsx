"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { inputClass } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
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
        className={inputClass}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex gap-2">
        <form action={approveFormAction}>
          <input type="hidden" name="motifTraite" value={motifTraite} />
          <button
            type="submit"
            disabled={approvePending || rejectPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {tu("approuver")}
          </button>
        </form>
        <form action={rejectFormAction}>
          <input type="hidden" name="motifTraite" value={motifTraite} />
          <button
            type="submit"
            disabled={approvePending || rejectPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            {tu("rejeter")}
          </button>
        </form>
      </div>
    </div>
  );
}
