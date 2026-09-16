import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { createBureau } from "@/actions/bureaux";
import { BureauForm } from "@/components/bureau-form";

export default async function NewBureauPage() {
  const t = await getTranslations("geo");
  const lieux = await prisma.lieuDeVote.findMany({
    orderBy: { code: "asc" },
    select: { id: true, code: true, nom: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t("nouveauBureau")}</h1>
      <BureauForm action={createBureau} lieux={lieux} />
    </div>
  );
}
