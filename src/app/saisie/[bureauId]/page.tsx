import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Lock } from "lucide-react";
import { requireSession } from "@/lib/auth-helpers";
import { assertBureauAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { saveResultatDraft, submitResultat } from "@/actions/resultats";
import { requestUnlock } from "@/actions/unlock";
import { ResultatForm } from "@/components/resultat-form";
import { UnlockRequestForm } from "@/components/unlock-request-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default async function SaisieBureauPage({
  params,
}: PageProps<"/saisie/[bureauId]">) {
  const { bureauId } = await params;
  const session = await requireSession();
  await assertBureauAccess(session.user.id, session.user.role, bureauId);

  const ts = await getTranslations("saisie");
  const tu = await getTranslations("unlock");
  const tc = await getTranslations("common");

  const [bureau, partis] = await Promise.all([
    prisma.bureauVote.findUnique({
      where: { id: bureauId },
      include: {
        lieuDeVote: true,
        resultat: {
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

  const voixMap = Object.fromEntries(
    (bureau.resultat?.voix ?? []).map((v) => [v.partiId, v.voix]),
  );

  const isLocked = bureau.resultat?.statut === "SOUMIS";
  const pendingUnlock = bureau.resultat?.unlockRequests[0];

  const draftAction = saveResultatDraft.bind(
    null,
    bureauId,
    partis.map((p) => p.id),
  );
  const submitAction = submitResultat.bind(
    null,
    bureauId,
    partis.map((p) => p.id),
  );
  const unlockAction = requestUnlock.bind(null, bureauId);

  return (
    <div>
      <BackLink href="/saisie" label={tc("back")} />
      <PageHeader
        title={bureau.nom}
        description={`${bureau.code} · ${bureau.lieuDeVote.nom}`}
      />

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
                <p className="font-semibold text-slate-900">
                  {bureau.resultat?.totalVotants}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{ts("votesRejetes")}</p>
                <p className="font-semibold text-slate-900">
                  {bureau.resultat?.votesRejetes}
                </p>
              </div>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {partis.map((parti) => (
                <li
                  key={parti.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: parti.couleur ?? "#94a3b8" }}
                    />
                    {parti.nom}
                  </span>
                  <span className="font-medium text-slate-900">
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
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                {ts("demanderDeverouillage")}
              </h2>
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
            totalVotants: bureau.resultat?.totalVotants ?? 0,
            votesRejetes: bureau.resultat?.votesRejetes ?? 0,
            voix: voixMap,
          }}
        />
      )}
    </div>
  );
}
