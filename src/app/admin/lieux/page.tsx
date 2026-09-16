import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { deleteLieu } from "@/actions/lieux";
import { DeleteButton } from "@/components/delete-button";

export default async function LieuxPage() {
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");

  const lieux = await prisma.lieuDeVote.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { bureaux: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t("lieuxDeVote")}</h1>
        <Link
          href="/admin/lieux/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t("nouveauLieu")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("code")}</th>
              <th className="px-4 py-3">{t("nom")}</th>
              <th className="px-4 py-3">{t("adresse")}</th>
              <th className="px-4 py-3">{t("bureauxDeVote")}</th>
              <th className="px-4 py-3">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lieux.map((lieu) => (
              <tr key={lieu.id}>
                <td className="px-4 py-3 font-mono text-xs">{lieu.code}</td>
                <td className="px-4 py-3">{lieu.nom}</td>
                <td className="px-4 py-3 text-slate-500">{lieu.adresse ?? "—"}</td>
                <td className="px-4 py-3">{lieu._count.bureaux}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/lieux/${lieu.id}`}
                      className="text-sm text-slate-600 hover:underline"
                    >
                      {tc("edit")}
                    </Link>
                    <DeleteButton
                      action={deleteLieu.bind(null, lieu.id)}
                      confirmMessage={`Supprimer le lieu de vote "${lieu.nom}" ?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {lieux.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Aucun lieu de vote
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
