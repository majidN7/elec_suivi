"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/submit-button";
import type { ImportState } from "@/actions/import";

export function ImportForm({
  action,
  templateUrl,
  title,
}: {
  action: (state: ImportState, formData: FormData) => Promise<ImportState>;
  templateUrl: string;
  title: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ti = useTranslations("import");
  const tc = useTranslations("common");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <a
          href={templateUrl}
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          {ti("template")}
        </a>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {ti("selectFile")}
          </label>
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            required
            className="block w-full text-sm"
          />
        </div>

        <SubmitButton>{tc("import")}</SubmitButton>
      </form>

      {state?.fatalError && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.fatalError}
        </p>
      )}

      {state && !state.fatalError && (
        <div className="mt-4 space-y-2">
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.importedCount} {ti("lignesImportees")}
          </p>
          {state.errors.length > 0 && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
