import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ListeResultatCard } from "@/components/liste-resultat-card";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function SaisieBureauPage({
  params,
}: PageProps<"/saisie/[bureauId]">) {
  const { bureauId } = await params;
  await requireSession();

  const tc = await getTranslations("common");
  const tl = await getTranslations("listes");

  const [bureau, allPartis] = await Promise.all([
    prisma.bureauVote.findUnique({
      where: { id: bureauId },
      include: {
        lieuDeVote: true,
        resultats: {
          include: {
            voix: true,
            unlockRequests: {
              where: { statut: "EN_ATTENTE" },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    }),
    prisma.partiPolitique.findMany({ include: { participations: true } }),
  ]);

  if (!bureau) {
    notFound();
  }

  function partisPourListe(typeListe: "LOCALE" | "REGIONALE") {
    return allPartis
      .flatMap((parti) => {
        const participation = parti.participations.find((p) => p.typeListe === typeListe);
        if (!participation) return [];
        return [
          {
            id: parti.id,
            code: parti.code,
            nom: parti.nom,
            couleur: parti.couleur,
            numeroListe: participation.numeroListe,
            mandataire: participation.mandataire,
          },
        ];
      })
      .sort((a, b) => Number(a.numeroListe) - Number(b.numeroListe));
  }

  const partisLocale = partisPourListe("LOCALE");
  const partisRegionale = partisPourListe("REGIONALE");

  const resultatLocale = bureau.resultats.find((r) => r.typeListe === "LOCALE") ?? null;
  const resultatRegionale =
    bureau.resultats.find((r) => r.typeListe === "REGIONALE") ?? null;

  return (
    <div>
      <BackLink href="/saisie" label={tc("back")} />
      <PageHeader
        title={bureau.nom}
        description={`${bureau.commune} · N° ${bureau.numero} · ${bureau.lieuDeVote.nom}`}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ListeResultatCard
          bureauId={bureauId}
          typeListe="LOCALE"
          label={tl("locale")}
          partis={partisLocale}
          resultat={resultatLocale}
        />
        <ListeResultatCard
          bureauId={bureauId}
          typeListe="REGIONALE"
          label={tl("regionale")}
          partis={partisRegionale}
          resultat={resultatRegionale}
        />
      </div>
    </div>
  );
}
