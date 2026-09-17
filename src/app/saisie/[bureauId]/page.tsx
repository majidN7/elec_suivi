import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth-helpers";
import { assertBureauAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ListeResultatCard } from "@/components/liste-resultat-card";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function SaisieBureauPage({
  params,
}: PageProps<"/saisie/[bureauId]">) {
  const { bureauId } = await params;
  const session = await requireSession();
  await assertBureauAccess(session.user.id, session.user.role, bureauId);

  const tc = await getTranslations("common");
  const tl = await getTranslations("listes");

  const [bureau, partis] = await Promise.all([
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
    prisma.partiPolitique.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!bureau) {
    notFound();
  }

  const resultatLocale = bureau.resultats.find((r) => r.typeListe === "LOCALE") ?? null;
  const resultatRegionale =
    bureau.resultats.find((r) => r.typeListe === "REGIONALE") ?? null;

  return (
    <div>
      <BackLink href="/saisie" label={tc("back")} />
      <PageHeader
        title={bureau.nom}
        description={`${bureau.code} · ${bureau.lieuDeVote.nom}`}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ListeResultatCard
          bureauId={bureauId}
          typeListe="LOCALE"
          label={tl("locale")}
          partis={partis}
          resultat={resultatLocale}
        />
        <ListeResultatCard
          bureauId={bureauId}
          typeListe="REGIONALE"
          label={tl("regionale")}
          partis={partis}
          resultat={resultatRegionale}
        />
      </div>
    </div>
  );
}
