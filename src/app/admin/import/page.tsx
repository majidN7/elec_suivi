import { getTranslations } from "next-intl/server";
import { Building2, Flag } from "lucide-react";
import { ImportForm } from "@/components/import-form";
import { importBureaux, importPartis } from "@/actions/import";
import { PageHeader } from "@/components/ui/page-header";

export default async function ImportPage() {
  const ti = await getTranslations("import");

  return (
    <div>
      <PageHeader
        title={ti("title")}
        description={ti("description")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ImportForm
          action={importBureaux}
          templateUrl="/api/templates/bureaux"
          title={ti("bureaux")}
          icon={<Building2 className="h-4 w-4" />}
        />
        <ImportForm
          action={importPartis}
          templateUrl="/api/templates/partis"
          title={ti("partis")}
          icon={<Flag className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
