import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { updateLieu } from "@/actions/lieux";
import { LieuForm } from "@/components/lieu-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditLieuPage({
  params,
}: PageProps<"/admin/lieux/[id]">) {
  const { id } = await params;
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");

  const lieu = await prisma.lieuDeVote.findUnique({ where: { id } });
  if (!lieu) {
    notFound();
  }

  const action = updateLieu.bind(null, id);

  return (
    <div>
      <BackLink href="/admin/lieux" label={tc("back")} />
      <PageHeader title={`${t("lieuDeVote")} — ${lieu.nom}`} />
      <LieuForm action={action} defaultValues={lieu} />
    </div>
  );
}
