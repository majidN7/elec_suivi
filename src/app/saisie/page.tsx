import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Vote } from "lucide-react";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListeStatusBadges } from "@/components/liste-status-badges";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";

export default async function SaisiePage() {
  const session = await requireSession();
  const ts = await getTranslations("saisie");
  const tc = await getTranslations("common");
  const tg = await getTranslations("geo");
  const te = await getTranslations("empty");
  const tl = await getTranslations("listes");

  const statusLabels = {
    locale: tl("locale"),
    regionale: tl("regionale"),
    brouillon: ts("brouillon"),
    soumis: ts("verrouille"),
  };

  const assignments = await prisma.agentAssignment.findMany({
    where: { userId: session.user.id },
    include: {
      bureauVote: {
        include: { lieuDeVote: true, resultats: true },
      },
    },
    orderBy: { bureauVote: { code: "asc" } },
  });

  return (
    <div>
      <PageHeader title={ts("mesBureaux")} />

      {assignments.length === 0 ? (
        <Card>
          <EmptyState
            icon={Vote}
            title={te("mesBureauxTitle")}
            description={te("mesBureauxDesc")}
          />
        </Card>
      ) : (
        <Table>
          <Thead>
            <Th>{tg("code")}</Th>
            <Th>{tg("bureauDeVote")}</Th>
            <Th>{tg("lieuDeVote")}</Th>
            <Th>{tc("status")}</Th>
            <Th>{tc("actions")}</Th>
          </Thead>
          <Tbody>
            {assignments.map(({ bureauVote }) => (
              <Tr key={bureauVote.id}>
                <Td className="font-mono text-xs text-slate-500">{bureauVote.code}</Td>
                <Td className="font-medium text-slate-900">{bureauVote.nom}</Td>
                <Td className="text-slate-500">{bureauVote.lieuDeVote.nom}</Td>
                <Td>
                  <ListeStatusBadges resultats={bureauVote.resultats} labels={statusLabels} />
                </Td>
                <Td>
                  <Link
                    href={`/saisie/${bureauVote.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    {ts("title")}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
