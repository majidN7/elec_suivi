import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth-helpers";
import { assertBureauAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { saveResultatDraft, submitResultat } from "@/actions/resultats";
import { requestUnlock } from "@/actions/unlock";
import { ResultatForm } from "@/components/resultat-form";
import { UnlockRequestForm } from "@/components/unlock-request-form";

export default async function SaisieBureauPage({
  params,
}: PageProps<"/saisie/[bureauId]">) {
  const { bureauId } = await params;
  const session = await requireSession();
  await assertBureauAccess(session.user.id, session.user.role, bureauId);

  const ts = await getTranslations("saisie");
  const tu = await getTranslations("unlock");

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{bureau.nom}</h1>
        <p className="text-sm text-slate-500">
          {bureau.code} · {bureau.lieuDeVote.nom}
        </p>
      </div>

      {isLocked ? (
        <div className="space-y-6">
          <div className="max-w-2xl rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-800">{ts("verrouille")}</p>
            <p className="mt-1 text-sm text-green-700">
              Total votants : {bureau.resultat?.totalVotants} · Votes rejetés :{" "}
              {bureau.resultat?.votesRejetes}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-green-700">
              {partis.map((parti) => (
                <li key={parti.id}>
                  {parti.nom} : {voixMap[parti.id] ?? 0}
                </li>
              ))}
            </ul>
          </div>

          {pendingUnlock ? (
            <div className="max-w-md rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {tu("enAttente")} — {pendingUnlock.motif}
            </div>
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
