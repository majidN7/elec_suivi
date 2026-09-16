import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { createBureau } from "@/actions/bureaux";
import { BureauForm } from "@/components/bureau-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewBureauPage() {
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");
  const lieux = await prisma.lieuDeVote.findMany({
    orderBy: { code: "asc" },
    select: { id: true, code: true, nom: true },
  });

  return (
    <div>
      <BackLink href="/admin/bureaux" label={tc("back")} />
      <PageHeader title={t("nouveauBureau")} />
      <BureauForm action={createBureau} lieux={lieux} />
    </div>
  );
}
