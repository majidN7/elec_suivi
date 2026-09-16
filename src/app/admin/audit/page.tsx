import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

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

const ACTION_CLASS: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-700",
  UPDATE: "bg-slate-100 text-slate-700",
  DELETE: "bg-red-100 text-red-700",
  IMPORT: "bg-purple-100 text-purple-700",
  SAVE_DRAFT: "bg-slate-100 text-slate-700",
  SUBMIT: "bg-green-100 text-green-700",
  UNLOCK_REQUEST: "bg-amber-100 text-amber-700",
  UNLOCK_APPROVE: "bg-green-100 text-green-700",
  UNLOCK_REJECT: "bg-red-100 text-red-700",
};

export default async function AuditPage() {
  const ta = await getTranslations("audit");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{ta("title")}</h1>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{ta("action")}</th>
              <th className="px-4 py-3">{ta("entite")}</th>
              <th className="px-4 py-3">{ta("utilisateur")}</th>
              <th className="px-4 py-3">{ta("details")}</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${ACTION_CLASS[log.action] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {log.entite}
                  {log.entiteId && (
                    <span className="ml-1 font-mono text-xs text-slate-400">
                      {log.entiteId.slice(0, 8)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {log.user?.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {log.details ? JSON.stringify(log.details) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {log.createdAt.toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Aucune entrée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
