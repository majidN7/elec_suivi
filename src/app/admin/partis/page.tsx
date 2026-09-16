import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { deleteParti } from "@/actions/partis";
import { DeleteButton } from "@/components/delete-button";

export default async function PartisPage() {
  const t = await getTranslations("geo");
  const tp = await getTranslations("partis");
  const tc = await getTranslations("common");

  const partis = await prisma.partiPolitique.findMany({
    orderBy: { code: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{tp("title")}</h1>
        <Link
          href="/admin/partis/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {tp("nouveauParti")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{tp("couleur")}</th>
              <th className="px-4 py-3">{t("code")}</th>
              <th className="px-4 py-3">{t("nom")}</th>
              <th className="px-4 py-3">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partis.map((parti) => (
              <tr key={parti.id}>
                <td className="px-4 py-3">
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: parti.couleur ?? "#94a3b8" }}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{parti.code}</td>
                <td className="px-4 py-3">{parti.nom}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/partis/${parti.id}`}
                      className="text-sm text-slate-600 hover:underline"
                    >
                      {tc("edit")}
                    </Link>
                    <DeleteButton
                      action={deleteParti.bind(null, parti.id)}
                      confirmMessage={`Supprimer le parti "${parti.nom}" ?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {partis.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Aucun parti politique
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
