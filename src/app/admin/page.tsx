import { getTranslations } from "next-intl/server";
import {
  Building2,
  Users,
  UserCheck,
  XCircle,
  BarChart3,
  Landmark,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/stat-tile";
import { VoixBarChart } from "@/components/charts/voix-bar-chart";
import { ListeTabs } from "@/components/liste-tabs";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { siegesPourListe, quotientElectoral, repartirSieges } from "@/lib/seats";
import type { TypeListe } from "@/generated/prisma/enums";

const nf = new Intl.NumberFormat("fr-FR");
const pf = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

async function getListeStats(typeListe: TypeListe, totalBureaux: number, totalInscrits: number) {
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

  const totalVotants = resultatsSoumis.reduce((acc, r) => acc + r.totalVotants, 0);
  const totalVotesRejetes = resultatsSoumis.reduce((acc, r) => acc + r.votesRejetes, 0);
  const tauxParticipation = totalInscrits > 0 ? totalVotants / totalInscrits : 0;
  const votesExprimes = totalVotants - totalVotesRejetes;

  const voixParPartiMap = new Map<
    string,
    { id: string; nom: string; couleur: string; voix: number }
  >();
  for (const row of voixRows) {
    const existing = voixParPartiMap.get(row.partiId);
    if (existing) {
      existing.voix += row.voix;
    } else {
      voixParPartiMap.set(row.partiId, {
        id: row.partiId,
        nom: row.parti.nom,
        couleur: row.parti.couleur ?? "#94a3b8",
        voix: row.voix,
      });
    }
  }
  const voixParParti = Array.from(voixParPartiMap.values()).sort((a, b) => b.voix - a.voix);
  const sommeVoixSaisies = voixParParti.reduce((acc, p) => acc + p.voix, 0);
  const coherent = votesExprimes === sommeVoixSaisies;

  const siegesTotal = siegesPourListe(typeListe);
  const quotient = quotientElectoral(totalInscrits, siegesTotal);
  const siegesParParti = repartirSieges(voixParParti, quotient, siegesTotal);
  const repartition = voixParParti
    .map((p) => ({ ...p, sieges: siegesParParti.get(p.id) ?? 0 }))
    .sort((a, b) => b.sieges - a.sieges || b.voix - a.voix);

  return {
    bureauxSoumis,
    tauxSoumission,
    totalInscrits,
    totalVotants,
    totalVotesRejetes,
    votesExprimes,
    tauxParticipation,
    voixParParti,
    sommeVoixSaisies,
    coherent,
    siegesTotal,
    quotient,
    repartition,
  };
}

export default async function AdminDashboardPage() {
  const td = await getTranslations("dashboard");
  const te = await getTranslations("empty");
  const tl = await getTranslations("listes");

  const [totalBureaux, inscritsAgg] = await Promise.all([
    prisma.bureauVote.count(),
    prisma.bureauVote.aggregate({ _sum: { inscrits: true } }),
  ]);
  const totalInscrits = inscritsAgg._sum.inscrits ?? 0;

  const [localeStats, regionaleStats] = await Promise.all([
    getListeStats("LOCALE", totalBureaux, totalInscrits),
    getListeStats("REGIONALE", totalBureaux, totalInscrits),
  ]);

  function renderListeContent(stats: Awaited<ReturnType<typeof getListeStats>>) {
    return (
      <div>
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label={td("totalBureaux")} value={nf.format(totalBureaux)} icon={Building2} />
          <StatTile
            label={td("totalInscrits")}
            value={nf.format(stats.totalInscrits)}
            icon={UserCheck}
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

        <Card className="mb-6 p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">{td("voixParParti")}</h2>
          {stats.voixParParti.length > 0 ? (
            <VoixBarChart data={stats.voixParParti} />
          ) : (
            <EmptyState icon={BarChart3} title={te("voixTitle")} description={te("voixDesc")} />
          )}
        </Card>

        {stats.voixParParti.length > 0 && (
          <>
            <div
              className={`mb-6 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm ring-1 ring-inset ${
                stats.coherent
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                  : "bg-amber-50 text-amber-800 ring-amber-200"
              }`}
            >
              {stats.coherent ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                <p className="font-medium">
                  {td("coherenceTitle")} — {td("votesExprimes")} : {nf.format(stats.votesExprimes)}
                  {" / "}
                  {td("sommeVoixSaisies")} : {nf.format(stats.sommeVoixSaisies)}
                </p>
                <p className="mt-0.5">
                  {stats.coherent ? td("coherenceOk") : td("coherenceErreur")}
                </p>
              </div>
            </div>

            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Landmark className="h-4 w-4 text-brand-600" />
                  {td("repartitionSieges")}
                </h2>
                <p className="text-xs text-slate-500">
                  {td("quotientElectoral")} : {nf.format(Math.round(stats.quotient))} ·{" "}
                  {td("siegesTotal")} : {stats.siegesTotal}
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-start text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-2 text-start font-medium">{td("parti")}</th>
                    <th className="pb-2 text-end font-medium">{td("voix")}</th>
                    <th className="pb-2 text-end font-medium">{td("sieges")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.repartition.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2">
                        <span className="flex items-center gap-2 text-slate-700">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                            style={{ backgroundColor: p.couleur }}
                          />
                          {p.nom}
                        </span>
                      </td>
                      <td className="py-2 text-end text-slate-700">{nf.format(p.voix)}</td>
                      <td className="py-2 text-end font-semibold text-slate-900">{p.sieges}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
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
