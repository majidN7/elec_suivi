import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { decideUnlock } from "@/actions/unlock";
import { UnlockDecisionForm } from "@/components/unlock-decision-form";

export default async function UnlockRequestsPage() {
  const tu = await getTranslations("unlock");

  const requests = await prisma.unlockRequest.findMany({
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
    include: {
      resultat: { include: { bureauVote: true } },
      demandePar: true,
      traitePar: true,
    },
  });

  const statutLabel: Record<string, string> = {
    EN_ATTENTE: tu("enAttente"),
    APPROUVEE: tu("approuvee"),
    REJETEE: tu("rejetee"),
  };

  const statutClass: Record<string, string> = {
    EN_ATTENTE: "bg-amber-100 text-amber-700",
    APPROUVEE: "bg-green-100 text-green-700",
    REJETEE: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{tu("title")}</h1>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {req.resultat.bureauVote.code} — {req.resultat.bureauVote.nom}
                </p>
                <p className="text-xs text-slate-500">
                  {tu("demandePar")} : {req.demandePar.name} ·{" "}
                  {req.createdAt.toLocaleString("fr-FR")}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${statutClass[req.statut]}`}
              >
                {statutLabel[req.statut]}
              </span>
            </div>
            <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {req.motif}
            </p>

            {req.statut === "EN_ATTENTE" ? (
              <UnlockDecisionForm
                approveAction={decideUnlock.bind(null, req.id, "APPROUVEE")}
                rejectAction={decideUnlock.bind(null, req.id, "REJETEE")}
              />
            ) : (
              <p className="text-xs text-slate-500">
                {tu("motifTraitement")} : {req.motifTraite || "—"} ·{" "}
                {req.traitePar?.name} ·{" "}
                {req.traiteAt?.toLocaleString("fr-FR")}
              </p>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-center text-slate-400">Aucune demande de déverrouillage</p>
        )}
      </div>
    </div>
  );
}
