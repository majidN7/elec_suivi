import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export default async function SaisiePage() {
  const session = await requireSession();
  const ts = await getTranslations("saisie");
  const tc = await getTranslations("common");

  const assignments = await prisma.agentAssignment.findMany({
    where: { userId: session.user.id },
    include: {
      bureauVote: {
        include: { lieuDeVote: true, resultat: true },
      },
    },
    orderBy: { bureauVote: { code: "asc" } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{ts("mesBureaux")}</h1>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Bureau</th>
              <th className="px-4 py-3">Lieu de vote</th>
              <th className="px-4 py-3">{tc("status")}</th>
              <th className="px-4 py-3">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map(({ bureauVote }) => (
              <tr key={bureauVote.id}>
                <td className="px-4 py-3 font-mono text-xs">{bureauVote.code}</td>
                <td className="px-4 py-3">{bureauVote.nom}</td>
                <td className="px-4 py-3 text-slate-500">
                  {bureauVote.lieuDeVote.nom}
                </td>
                <td className="px-4 py-3">
                  {!bureauVote.resultat && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      —
                    </span>
                  )}
                  {bureauVote.resultat?.statut === "BROUILLON" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {ts("brouillon")}
                    </span>
                  )}
                  {bureauVote.resultat?.statut === "SOUMIS" && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      {ts("verrouille")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/saisie/${bureauVote.id}`}
                    className="text-sm text-slate-600 hover:underline"
                  >
                    {ts("title")}
                  </Link>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Aucun bureau de vote ne vous est assigné
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
