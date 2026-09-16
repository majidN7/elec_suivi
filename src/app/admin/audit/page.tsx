import { getTranslations } from "next-intl/server";
import { ScrollText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  IMPORT: "Import",
  SAVE_DRAFT: "Brouillon enregistré",
  SUBMIT: "Soumission",
  UNLOCK_REQUEST: "Demande de déverrouillage",
  UNLOCK_APPROVE: "Déverrouillage approuvé",
  UNLOCK_REJECT: "Déverrouillage rejeté",
};

const ACTION_VARIANT: Record<string, BadgeVariant> = {
  CREATE: "brand",
  UPDATE: "neutral",
  DELETE: "danger",
  IMPORT: "brand",
  SAVE_DRAFT: "neutral",
  SUBMIT: "success",
  UNLOCK_REQUEST: "warning",
  UNLOCK_APPROVE: "success",
  UNLOCK_REJECT: "danger",
};

export default async function AuditPage() {
  const ta = await getTranslations("audit");
  const te = await getTranslations("empty");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return (
    <div>
      <PageHeader title={ta("title")} />

      {logs.length === 0 ? (
        <Card>
          <EmptyState icon={ScrollText} title={te("auditTitle")} />
        </Card>
      ) : (
        <Table>
          <Thead>
            <Th>{ta("action")}</Th>
            <Th>{ta("entite")}</Th>
            <Th>{ta("utilisateur")}</Th>
            <Th>{ta("details")}</Th>
            <Th>Date</Th>
          </Thead>
          <Tbody>
            {logs.map((log) => (
              <Tr key={log.id}>
                <Td>
                  <Badge variant={ACTION_VARIANT[log.action] ?? "neutral"}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </Badge>
                </Td>
                <Td>
                  {log.entite}
                  {log.entiteId && (
                    <span className="ms-1 font-mono text-xs text-slate-400">
                      {log.entiteId.slice(0, 8)}
                    </span>
                  )}
                </Td>
                <Td className="text-slate-500">{log.user?.name ?? "—"}</Td>
                <Td className="font-mono text-xs text-slate-500">
                  {log.details ? JSON.stringify(log.details) : "—"}
                </Td>
                <Td className="text-slate-500">
                  {log.createdAt.toLocaleString("fr-FR")}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
