import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { updateParti } from "@/actions/partis";
import { PartiForm } from "@/components/parti-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditPartiPage({
  params,
}: PageProps<"/admin/partis/[id]">) {
  const { id } = await params;
  const tc = await getTranslations("common");

  const parti = await prisma.partiPolitique.findUnique({
    where: { id },
    include: { participations: true },
  });
  if (!parti) {
    notFound();
  }

  const locale = parti.participations.find((p) => p.typeListe === "LOCALE");
  const regionale = parti.participations.find((p) => p.typeListe === "REGIONALE");

  const action = updateParti.bind(null, id);

  return (
    <div>
      <BackLink href="/admin/partis" label={tc("back")} />
      <PageHeader title={`Parti — ${parti.nom}`} />
      <PartiForm
        action={action}
        defaultValues={{
          code: parti.code,
          nom: parti.nom,
          couleur: parti.couleur,
          numeroListeLocale: locale?.numeroListe ?? "",
          mandataireLocale: locale?.mandataire ?? "",
          numeroListeRegionale: regionale?.numeroListe ?? "",
          mandataireRegionale: regionale?.mandataire ?? "",
        }}
      />
    </div>
  );
}
