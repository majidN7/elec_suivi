import { getTranslations } from "next-intl/server";
import { Building2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteBureau } from "@/actions/bureaux";
import { DeleteButton } from "@/components/delete-button";
import { EditLink } from "@/components/edit-link";
import { ResultatStatusBadge } from "@/components/resultat-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";

export default async function BureauxPage() {
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");
  const ts = await getTranslations("saisie");
  const te = await getTranslations("empty");

  const bureaux = await prisma.bureauVote.findMany({
    orderBy: { code: "asc" },
    include: { lieuDeVote: true, resultat: true },
  });

  const statusLabels = { brouillon: ts("brouillon"), soumis: ts("soumis") };

  return (
    <div>
      <PageHeader
        title={t("bureauxDeVote")}
        action={
          <ButtonLink href="/admin/bureaux/new" icon={Plus}>
            {t("nouveauBureau")}
          </ButtonLink>
        }
      />

      {bureaux.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title={te("bureauxTitle")}
            description={te("bureauxDesc")}
          />
        </Card>
      ) : (
        <Table>
          <Thead>
            <Th>{t("code")}</Th>
            <Th>{t("nom")}</Th>
            <Th>{t("lieuDeVote")}</Th>
            <Th>{t("inscrits")}</Th>
            <Th>{tc("status")}</Th>
            <Th>{tc("actions")}</Th>
          </Thead>
          <Tbody>
            {bureaux.map((bureau) => (
              <Tr key={bureau.id}>
                <Td className="font-mono text-xs text-slate-500">{bureau.code}</Td>
                <Td className="font-medium text-slate-900">{bureau.nom}</Td>
                <Td className="text-slate-500">{bureau.lieuDeVote.nom}</Td>
                <Td>{bureau.inscrits ?? "—"}</Td>
                <Td>
                  <ResultatStatusBadge
                    statut={bureau.resultat?.statut ?? null}
                    labels={statusLabels}
                  />
                </Td>
                <Td>
                  <div className="flex items-center gap-4">
                    <EditLink href={`/admin/bureaux/${bureau.id}`} label={tc("edit")} />
                    <DeleteButton
                      action={deleteBureau.bind(null, bureau.id)}
                      confirmMessage={`Supprimer le bureau de vote "${bureau.nom}" ?`}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
