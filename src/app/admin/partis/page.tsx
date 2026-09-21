import { getTranslations } from "next-intl/server";
import { Flag, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteParti } from "@/actions/partis";
import { DeleteButton } from "@/components/delete-button";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";

export default async function PartisPage() {
  const t = await getTranslations("geo");
  const tp = await getTranslations("partis");
  const tc = await getTranslations("common");
  const te = await getTranslations("empty");
  const tl = await getTranslations("listes");

  const partis = await prisma.partiPolitique.findMany({
    orderBy: { code: "asc" },
    include: { participations: true },
  });

  return (
    <div>
      <PageHeader
        title={tp("title")}
        action={
          <ButtonLink href="/admin/partis/new" icon={Plus}>
            {tp("nouveauParti")}
          </ButtonLink>
        }
      />

      {partis.length === 0 ? (
        <Card>
          <EmptyState
            icon={Flag}
            title={te("partisTitle")}
            description={te("partisDesc")}
          />
        </Card>
      ) : (
        <Table>
          <Thead>
            <Th>{t("nom")}</Th>
            <Th>{t("code")}</Th>
            <Th>{tp("listes")}</Th>
            <Th>{tc("actions")}</Th>
          </Thead>
          <Tbody>
            {partis.map((parti) => {
              const locale = parti.participations.find((p) => p.typeListe === "LOCALE");
              const regionale = parti.participations.find((p) => p.typeListe === "REGIONALE");
              return (
                <Tr key={parti.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-block h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                        style={{ backgroundColor: parti.couleur ?? "#94a3b8" }}
                      />
                      <span className="font-medium text-slate-900">{parti.nom}</span>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-slate-500">{parti.code}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      {locale && (
                        <Badge variant="brand">
                          {tl("locale")} #{locale.numeroListe}
                        </Badge>
                      )}
                      {regionale && (
                        <Badge variant="neutral">
                          {tl("regionale")} #{regionale.numeroListe}
                        </Badge>
                      )}
                      {!locale && !regionale && <span className="text-xs text-slate-400">—</span>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <EditLink href={`/admin/partis/${parti.id}`} label={tc("edit")} />
                      <DeleteButton
                        action={deleteParti.bind(null, parti.id)}
                        confirmMessage={`Supprimer le parti "${parti.nom}" ?`}
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
