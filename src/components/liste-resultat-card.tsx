import { getTranslations } from "next-intl/server";
import { Lock } from "lucide-react";
import { saveResultatDraft, submitResultat } from "@/actions/resultats";
import { requestUnlock } from "@/actions/unlock";
import { ResultatForm } from "@/components/resultat-form";
import { UnlockRequestForm } from "@/components/unlock-request-form";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import type { TypeListe } from "@/generated/prisma/enums";

type Parti = {
  id: string;
  code: string;
  nom: string;
  couleur: string | null;
  numeroListe: string;
  mandataire: string;
};
type Resultat = {
  totalVotants: number;
  votesRejetes: number;
  statut: "BROUILLON" | "SOUMIS";
  voix: { partiId: string; voix: number }[];
  unlockRequests: { motif: string }[];
} | null;

export async function ListeResultatCard({
  bureauId,
  typeListe,
  label,
  partis,
  resultat,
}: {
  bureauId: string;
  typeListe: TypeListe;
  label: string;
  partis: Parti[];
  resultat: Resultat;
}) {
  const ts = await getTranslations("saisie");
  const tu = await getTranslations("unlock");

  const voixMap = Object.fromEntries((resultat?.voix ?? []).map((v) => [v.partiId, v.voix]));
  const isLocked = resultat?.statut === "SOUMIS";
  const pendingUnlock = resultat?.unlockRequests[0];

  const draftAction = saveResultatDraft.bind(
    null,
    bureauId,
    typeListe,
    partis.map((p) => p.id),
  );
  const submitAction = submitResultat.bind(
    null,
    bureauId,
    typeListe,
    partis.map((p) => p.id),
  );
  const unlockAction = requestUnlock.bind(null, bureauId, typeListe);

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{label}</h2>

      {isLocked ? (
        <div className="max-w-2xl space-y-6">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <Lock className="h-4 w-4" />
              <p className="font-medium">{ts("verrouille")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">{ts("totalVotants")}</p>
                <p className="font-semibold text-slate-900">{resultat?.totalVotants}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{ts("votesRejetes")}</p>
                <p className="font-semibold text-slate-900">{resultat?.votesRejetes}</p>
              </div>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {partis.map((parti) => (
                <li key={parti.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-slate-700">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: parti.couleur ?? "#94a3b8" }}
                    />
                    <span className="shrink-0 text-xs font-semibold text-slate-400">
                      {parti.numeroListe}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{parti.code}</span>
                      <span className="block truncate text-xs text-slate-400">
                        {parti.mandataire}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-slate-900">
                    {voixMap[parti.id] ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {pendingUnlock ? (
            <Alert variant="warning">
              {tu("enAttente")} — {pendingUnlock.motif}
            </Alert>
          ) : (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                {ts("demanderDeverouillage")}
              </h3>
              <UnlockRequestForm action={unlockAction} />
            </div>
          )}
        </div>
      ) : (
        <ResultatForm
          draftAction={draftAction}
          submitAction={submitAction}
          partis={partis}
          defaultValues={{
            totalVotants: resultat?.totalVotants ?? 0,
            votesRejetes: resultat?.votesRejetes ?? 0,
            voix: voixMap,
          }}
        />
      )}
    </div>
  );
}
