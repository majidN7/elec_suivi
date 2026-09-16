import { getTranslations } from "next-intl/server";
import { MapPin, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteLieu } from "@/actions/lieux";
import { DeleteButton } from "@/components/delete-button";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";

export default async function LieuxPage() {
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");
  const te = await getTranslations("empty");

  const lieux = await prisma.lieuDeVote.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { bureaux: true } } },
  });

  return (
    <div>
      <PageHeader
        title={t("lieuxDeVote")}
        action={
          <ButtonLink href="/admin/lieux/new" icon={Plus}>
            {t("nouveauLieu")}
          </ButtonLink>
        }
      />

      {lieux.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title={te("lieuxTitle")}
            description={te("lieuxDesc")}
          />
        </Card>
      ) : (
        <Table>
          <Thead>
            <Th>{t("code")}</Th>
            <Th>{t("nom")}</Th>
            <Th>{t("adresse")}</Th>
            <Th>{t("bureauxDeVote")}</Th>
            <Th>{tc("actions")}</Th>
          </Thead>
          <Tbody>
            {lieux.map((lieu) => (
              <Tr key={lieu.id}>
                <Td className="font-mono text-xs text-slate-500">{lieu.code}</Td>
                <Td className="font-medium text-slate-900">{lieu.nom}</Td>
                <Td className="text-slate-500">{lieu.adresse ?? "—"}</Td>
                <Td>{lieu._count.bureaux}</Td>
                <Td>
                  <div className="flex items-center gap-4">
                    <EditLink href={`/admin/lieux/${lieu.id}`} label={tc("edit")} />
                    <DeleteButton
                      action={deleteLieu.bind(null, lieu.id)}
                      confirmMessage={`Supprimer le lieu de vote "${lieu.nom}" ?`}
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
