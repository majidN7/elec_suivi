import { getTranslations } from "next-intl/server";
import { ImportForm } from "@/components/import-form";
import { importBureaux, importPartis } from "@/actions/import";

export default async function ImportPage() {
  const ti = await getTranslations("import");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{ti("title")}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <ImportForm
          action={importBureaux}
          templateUrl="/api/templates/bureaux"
          title={ti("bureaux")}
        />
        <ImportForm
          action={importPartis}
          templateUrl="/api/templates/partis"
          title={ti("partis")}
        />
      </div>
    </div>
  );
}
