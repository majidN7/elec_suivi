import { getTranslations } from "next-intl/server";
import { Building2, CheckCircle2, Users, XCircle, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/stat-tile";
import { VoixBarChart } from "@/components/charts/voix-bar-chart";
import { ListeTabs } from "@/components/liste-tabs";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import type { TypeListe } from "@/generated/prisma/enums";

const nf = new Intl.NumberFormat("fr-FR");
const pf = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

async function getListeStats(typeListe: TypeListe, totalBureaux: number) {
  const [resultatsSoumis, voixRows] = await Promise.all([
    prisma.resultat.findMany({
      where: { statut: "SOUMIS", typeListe },
      include: { bureauVote: true },
    }),
    prisma.resultatVoixParti.findMany({
      where: { resultat: { statut: "SOUMIS", typeListe } },
      include: { parti: true },
    }),
  ]);

  const bureauxSoumis = resultatsSoumis.length;
  const tauxSoumission = totalBureaux > 0 ? bureauxSoumis / totalBureaux : 0;

  const totalInscrits = resultatsSoumis.reduce(
    (acc, r) => acc + (r.bureauVote.inscrits ?? 0),
    0,
  );
  const totalVotants = resultatsSoumis.reduce((acc, r) => acc + r.totalVotants, 0);
  const totalVotesRejetes = resultatsSoumis.reduce((acc, r) => acc + r.votesRejetes, 0);
  const tauxParticipation = totalInscrits > 0 ? totalVotants / totalInscrits : 0;

  const voixParPartiMap = new Map<string, { nom: string; couleur: string; voix: number }>();
  for (const row of voixRows) {
    const existing = voixParPartiMap.get(row.partiId);
    if (existing) {
      existing.voix += row.voix;
    } else {
      voixParPartiMap.set(row.partiId, {
        nom: row.parti.nom,
        couleur: row.parti.couleur ?? "#94a3b8",
        voix: row.voix,
      });
    }
  }
  const voixParParti = Array.from(voixParPartiMap.values()).sort((a, b) => b.voix - a.voix);

  return { bureauxSoumis, tauxSoumission, totalVotants, totalVotesRejetes, tauxParticipation, voixParParti };
}

export default async function AdminDashboardPage() {
  const td = await getTranslations("dashboard");
  const te = await getTranslations("empty");
  const tl = await getTranslations("listes");

  const totalBureaux = await prisma.bureauVote.count();
  const [localeStats, regionaleStats] = await Promise.all([
    getListeStats("LOCALE", totalBureaux),
    getListeStats("REGIONALE", totalBureaux),
  ]);

  function renderListeContent(stats: Awaited<ReturnType<typeof getListeStats>>) {
    return (
      <div>
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label={td("totalBureaux")} value={nf.format(totalBureaux)} icon={Building2} />
          <StatTile
            label={td("bureauxSoumis")}
            value={nf.format(stats.bureauxSoumis)}
            sublabel={`${td("tauxSoumission")} : ${pf.format(stats.tauxSoumission)}`}
            icon={CheckCircle2}
          />
          <StatTile
            label={td("totalVotants")}
            value={nf.format(stats.totalVotants)}
            sublabel={`${td("tauxParticipation")} : ${pf.format(stats.tauxParticipation)}`}
            icon={Users}
          />
          <StatTile
            label={td("votesRejetes")}
            value={nf.format(stats.totalVotesRejetes)}
            icon={XCircle}
          />
        </div>

        <Card className="mb-6 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{td("progressionSaisie")}</span>
            <span className="font-semibold text-slate-900">
              {pf.format(stats.tauxSoumission)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${Math.min(100, stats.tauxSoumission * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {nf.format(stats.bureauxSoumis)} / {nf.format(totalBureaux)}
          </p>
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">{td("voixParParti")}</h2>
          {stats.voixParParti.length > 0 ? (
            <VoixBarChart data={stats.voixParParti} />
          ) : (
            <EmptyState icon={BarChart3} title={te("voixTitle")} description={te("voixDesc")} />
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={td("title")} />

      <ListeTabs
        localeLabel={tl("locale")}
        regionaleLabel={tl("regionale")}
        localeContent={renderListeContent(localeStats)}
        regionaleContent={renderListeContent(regionaleStats)}
      />
    </div>
  );
}
