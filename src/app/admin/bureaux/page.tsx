import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { deleteBureau } from "@/actions/bureaux";
import { DeleteButton } from "@/components/delete-button";

export default async function BureauxPage() {
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");
  const ts = await getTranslations("saisie");

  const bureaux = await prisma.bureauVote.findMany({
    orderBy: { code: "asc" },
    include: { lieuDeVote: true, resultat: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t("bureauxDeVote")}</h1>
        <Link
          href="/admin/bureaux/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t("nouveauBureau")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("code")}</th>
              <th className="px-4 py-3">{t("nom")}</th>
              <th className="px-4 py-3">{t("lieuDeVote")}</th>
              <th className="px-4 py-3">{t("inscrits")}</th>
              <th className="px-4 py-3">{tc("status")}</th>
              <th className="px-4 py-3">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bureaux.map((bureau) => (
              <tr key={bureau.id}>
                <td className="px-4 py-3 font-mono text-xs">{bureau.code}</td>
                <td className="px-4 py-3">{bureau.nom}</td>
                <td className="px-4 py-3 text-slate-500">
                  {bureau.lieuDeVote.nom}
                </td>
                <td className="px-4 py-3">{bureau.inscrits ?? "—"}</td>
                <td className="px-4 py-3">
                  {!bureau.resultat && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      —
                    </span>
                  )}
                  {bureau.resultat?.statut === "BROUILLON" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {ts("brouillon")}
                    </span>
                  )}
                  {bureau.resultat?.statut === "SOUMIS" && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      {ts("soumis")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/bureaux/${bureau.id}`}
                      className="text-sm text-slate-600 hover:underline"
                    >
                      {tc("edit")}
                    </Link>
                    <DeleteButton
                      action={deleteBureau.bind(null, bureau.id)}
                      confirmMessage={`Supprimer le bureau de vote "${bureau.nom}" ?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {bureaux.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Aucun bureau de vote
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
