"use client";

import { useActionState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import type { ImportState } from "@/actions/import";

export function ImportForm({
  action,
  templateUrl,
  title,
  icon,
}: {
  action: (state: ImportState, formData: FormData) => Promise<ImportState>;
  templateUrl: string;
  title: string;
  icon: ReactNode;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ti = useTranslations("import");
  const tc = useTranslations("common");

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        <a
          href={templateUrl}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <Download className="h-3.5 w-3.5" />
          {ti("template")}
        </a>
      </div>

      <form action={formAction} className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
          <span className="text-sm font-medium text-slate-600">{ti("selectFile")}</span>
          <span className="text-xs text-slate-400">CSV, XLSX ou XLS</span>
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            required
            className="sr-only"
          />
        </label>

        <SubmitButton className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
          {tc("import")}
        </SubmitButton>
      </form>

      {state?.fatalError && (
        <div className="mt-4">
          <Alert variant="error">{state.fatalError}</Alert>
        </div>
      )}

      {state && !state.fatalError && (
        <div className="mt-4 space-y-2">
          <Alert variant="success">
            {state.importedCount} {ti("lignesImportees")}
          </Alert>
          {state.errors.length > 0 && (
            <Alert variant="error">
              <p className="mb-1 font-medium">
                {state.errors.length} {ti("lignesErreur")}
              </p>
              <ul className="list-inside list-disc space-y-0.5">
                {state.errors.map((e, idx) => (
                  <li key={idx}>
                    Ligne {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      )}
    </Card>
  );
}
