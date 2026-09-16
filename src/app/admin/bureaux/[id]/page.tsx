import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { updateBureau } from "@/actions/bureaux";
import { BureauForm } from "@/components/bureau-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditBureauPage({
  params,
}: PageProps<"/admin/bureaux/[id]">) {
  const { id } = await params;
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");

  const [bureau, lieux] = await Promise.all([
    prisma.bureauVote.findUnique({ where: { id } }),
    prisma.lieuDeVote.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, nom: true },
    }),
  ]);

  if (!bureau) {
    notFound();
  }

  const action = updateBureau.bind(null, id);

  return (
    <div>
      <BackLink href="/admin/bureaux" label={tc("back")} />
      <PageHeader title={`${t("bureauDeVote")} — ${bureau.nom}`} />
      <BureauForm action={action} lieux={lieux} defaultValues={bureau} />
    </div>
  );
}
