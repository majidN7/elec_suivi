import { getTranslations, getLocale } from "next-intl/server";
import { intlLocale, type Locale } from "@/i18n/config";
import { Unlock as UnlockIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { decideUnlock } from "@/actions/unlock";
import { UnlockDecisionForm } from "@/components/unlock-decision-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

export default async function UnlockRequestsPage() {
  const tu = await getTranslations("unlock");
  const te = await getTranslations("empty");
  const tl = await getTranslations("listes");
  const locale = (await getLocale()) as Locale;
  const dateFormatter = new Intl.DateTimeFormat(intlLocale[locale], {
    dateStyle: "short",
    timeStyle: "medium",
  });

  const listeLabel: Record<string, string> = {
    LOCALE: tl("locale"),
    REGIONALE: tl("regionale"),
  };

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

  const statutVariant: Record<string, BadgeVariant> = {
    EN_ATTENTE: "warning",
    APPROUVEE: "success",
    REJETEE: "danger",
  };

  return (
    <div>
      <PageHeader title={tu("title")} />

      {requests.length === 0 ? (
        <Card>
          <EmptyState icon={UnlockIcon} title={te("unlockTitle")} />
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    {req.resultat.bureauVote.code} — {req.resultat.bureauVote.nom}{" "}
                    <span className="font-normal text-slate-400">
                      ({listeLabel[req.resultat.typeListe]})
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {tu("demandePar")} : {req.demandePar.name} ·{" "}
                    {dateFormatter.format(req.createdAt)}
                  </p>
                </div>
                <Badge variant={statutVariant[req.statut]}>{statutLabel[req.statut]}</Badge>
              </div>
              <p className="mb-3 rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
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
                  {req.traiteAt ? dateFormatter.format(req.traiteAt) : "—"}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
