import type { Prisma } from "@/generated/prisma/client";

const FILLER_WORDS = new Set([
  "bureau",
  "bureaux",
  "n",
  "n°",
  "no",
  "num",
  "numero",
  "numéro",
  "مكتب",
  "رقم",
]);

/**
 * Recherche multicritère (numéro, commune, nom) : chaque terme de la
 * requête doit correspondre à au moins un des trois champs, ex.
 * "Bureau 5 - Dakhla" -> les bureaux n°5 de la commune de Dakhla.
 */
export function bureauSearchWhere(q: string): Prisma.BureauVoteWhereInput {
  const tokens = q
    .split(/[\s\-–,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !FILLER_WORDS.has(t.toLowerCase()));

  if (tokens.length === 0) return {};

  return {
    AND: tokens.map((token) => ({
      OR: [
        { numero: { contains: token, mode: "insensitive" as const } },
        { commune: { contains: token, mode: "insensitive" as const } },
        { nom: { contains: token, mode: "insensitive" as const } },
      ],
    })),
  };
}
