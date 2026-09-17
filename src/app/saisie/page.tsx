import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Search, Vote } from "lucide-react";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListeStatusBadges } from "@/components/liste-status-badges";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { inputClass } from "@/components/ui/field";

const PAGE_SIZE = 25;

export default async function SaisiePage({ searchParams }: PageProps<"/saisie">) {
  await requireSession();
  const params = await searchParams;
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

  const q = typeof params.q === "string" ? params.q.trim() : "";
  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const where = q
    ? {
        OR: [
          { code: { contains: q, mode: "insensitive" as const } },
          { nom: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [bureaux, total] = await Promise.all([
    prisma.bureauVote.findMany({
      where,
      include: { lieuDeVote: true, resultats: true },
      orderBy: { code: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.bureauVote.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageQuery = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    sp.set("page", String(p));
    return `/saisie?${sp.toString()}`;
  };

  return (
    <div>
      <PageHeader title={ts("rechercheTitre")} />

      <Card className="mb-5 p-4">
        <form className="relative" action="/saisie">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={ts("rechercherPlaceholder")}
            className={`${inputClass} ps-9`}
            autoFocus
          />
        </form>
      </Card>

      {bureaux.length === 0 ? (
        <Card>
          <EmptyState
            icon={Vote}
            title={q ? te("aucunResultatTitle") : te("rechercheTitle")}
            description={q ? te("aucunResultatDesc") : te("rechercheDesc")}
          />
        </Card>
      ) : (
        <>
          <Table>
            <Thead>
              <Th>{tg("code")}</Th>
              <Th>{tg("bureauDeVote")}</Th>
              <Th>{tg("lieuDeVote")}</Th>
              <Th>{tc("status")}</Th>
              <Th>{tc("actions")}</Th>
            </Thead>
            <Tbody>
              {bureaux.map((bureauVote) => (
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                {ts("resultatsTrouves", { count: total })}
              </span>
              <div className="flex items-center gap-3">
                {page > 1 && (
                  <Link href={pageQuery(page - 1)} className="font-medium text-brand-600 hover:text-brand-700">
                    {tc("precedent")}
                  </Link>
                )}
                <span>
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={pageQuery(page + 1)} className="font-medium text-brand-600 hover:text-brand-700">
                    {tc("suivant")}
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
