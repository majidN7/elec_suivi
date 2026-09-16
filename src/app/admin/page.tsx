import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/stat-tile";
import { VoixBarChart } from "@/components/charts/voix-bar-chart";

const nf = new Intl.NumberFormat("fr-FR");
const pf = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

export default async function AdminDashboardPage() {
  const td = await getTranslations("dashboard");

  const [totalBureaux, resultatsSoumis, voixRows] = await Promise.all([
    prisma.bureauVote.count(),
    prisma.resultat.findMany({
      where: { statut: "SOUMIS" },
      include: { bureauVote: true },
    }),
    prisma.resultatVoixParti.findMany({
      where: { resultat: { statut: "SOUMIS" } },
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
  const totalVotesRejetes = resultatsSoumis.reduce(
    (acc, r) => acc + r.votesRejetes,
    0,
  );
  const tauxParticipation = totalInscrits > 0 ? totalVotants / totalInscrits : 0;

  const voixParPartiMap = new Map<
    string,
    { nom: string; couleur: string; voix: number }
  >();
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
  const voixParParti = Array.from(voixParPartiMap.values()).sort(
    (a, b) => b.voix - a.voix,
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{td("title")}</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label={td("totalBureaux")} value={nf.format(totalBureaux)} />
        <StatTile
          label={td("bureauxSoumis")}
          value={nf.format(bureauxSoumis)}
          sublabel={`${td("tauxSoumission")} : ${pf.format(tauxSoumission)}`}
        />
        <StatTile
          label={td("totalVotants")}
          value={nf.format(totalVotants)}
          sublabel={`${td("tauxParticipation")} : ${pf.format(tauxParticipation)}`}
        />
        <StatTile label={td("votesRejetes")} value={nf.format(totalVotesRejetes)} />
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {td("progressionSaisie")}
          </span>
          <span className="text-slate-500">{pf.format(tauxSoumission)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${Math.min(100, tauxSoumission * 100)}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          {td("voixParParti")}
        </h2>
        {voixParParti.length > 0 ? (
          <VoixBarChart data={voixParParti} />
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">
            Aucun résultat soumis pour le moment
          </p>
        )}
      </div>
    </div>
  );
}
