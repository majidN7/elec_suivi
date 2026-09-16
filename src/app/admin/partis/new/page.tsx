import { getTranslations } from "next-intl/server";
import { createParti } from "@/actions/partis";
import { PartiForm } from "@/components/parti-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewPartiPage() {
  const tp = await getTranslations("partis");
  const tc = await getTranslations("common");

  return (
    <div>
      <BackLink href="/admin/partis" label={tc("back")} />
      <PageHeader title={tp("nouveauParti")} />
      <PartiForm action={createParti} />
    </div>
  );
}
