import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { updateLieu } from "@/actions/lieux";
import { LieuForm } from "@/components/lieu-form";

export default async function EditLieuPage({
  params,
}: PageProps<"/admin/lieux/[id]">) {
  const { id } = await params;
  const t = await getTranslations("geo");

  const lieu = await prisma.lieuDeVote.findUnique({ where: { id } });
  if (!lieu) {
    notFound();
  }

  const action = updateLieu.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {t("lieuDeVote")} — {lieu.nom}
      </h1>
      <LieuForm action={action} defaultValues={lieu} />
    </div>
  );
}
