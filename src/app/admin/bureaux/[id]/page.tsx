import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { updateBureau } from "@/actions/bureaux";
import { BureauForm } from "@/components/bureau-form";

export default async function EditBureauPage({
  params,
}: PageProps<"/admin/bureaux/[id]">) {
  const { id } = await params;
  const t = await getTranslations("geo");

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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {t("bureauDeVote")} — {bureau.nom}
      </h1>
      <BureauForm action={action} lieux={lieux} defaultValues={bureau} />
    </div>
  );
}
