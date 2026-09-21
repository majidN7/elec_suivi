"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { logAudit } from "@/lib/audit";
import { parseSpreadsheet } from "@/lib/import-parser";

export type ImportState =
  | {
      importedCount: number;
      errors: { row: number; message: string }[];
      fatalError?: string;
    }
  | undefined;

const bureauRowSchema = z.object({
  numero: z.string().trim().min(1, "numero manquant"),
  commune: z.string().trim().min(1, "commune manquante"),
  nom: z.string().trim().min(1, "nom manquant"),
  lieuDeVoteCode: z.string().trim().min(1, "lieuDeVoteCode manquant"),
  lieuDeVoteNom: z.string().trim().optional(),
  code: z.string().trim().optional(),
  inscrits: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v >= 0), {
      message: "inscrits doit être un entier positif",
    }),
});

const partiRowSchema = z
  .object({
    code: z.string().trim().min(1, "code manquant"),
    nom: z.string().trim().min(1, "nom manquant"),
    couleur: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^#[0-9a-fA-F]{6}$/.test(v), {
        message: "couleur invalide (format #RRGGBB)",
      }),
    numeroListeLocale: z.string().trim().optional(),
    mandataireLocale: z.string().trim().optional(),
    numeroListeRegionale: z.string().trim().optional(),
    mandataireRegionale: z.string().trim().optional(),
  })
  .refine((v) => Boolean(v.numeroListeLocale) === Boolean(v.mandataireLocale), {
    message: "numeroListeLocale et mandataireLocale doivent être renseignés ensemble",
  })
  .refine((v) => Boolean(v.numeroListeRegionale) === Boolean(v.mandataireRegionale), {
    message: "numeroListeRegionale et mandataireRegionale doivent être renseignés ensemble",
  });

export async function importBureaux(
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const session = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { importedCount: 0, errors: [], fatalError: "Aucun fichier fourni" };
  }

  const { rows, error } = await parseSpreadsheet(file);
  if (error) {
    return { importedCount: 0, errors: [], fatalError: error };
  }

  const errors: { row: number; message: string }[] = [];
  let importedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2;
    const parsed = bureauRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({
        row: rowNumber,
        message: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
      continue;
    }

    try {
      const lieu = await prisma.lieuDeVote.upsert({
        where: { code: parsed.data.lieuDeVoteCode },
        update: {},
        create: {
          code: parsed.data.lieuDeVoteCode,
          nom: parsed.data.lieuDeVoteNom || parsed.data.lieuDeVoteCode,
        },
      });

      await prisma.bureauVote.upsert({
        where: {
          commune_numero: { commune: parsed.data.commune, numero: parsed.data.numero },
        },
        update: {
          nom: parsed.data.nom,
          lieuDeVoteId: lieu.id,
          code: parsed.data.code || null,
          inscrits: parsed.data.inscrits ?? null,
        },
        create: {
          numero: parsed.data.numero,
          commune: parsed.data.commune,
          nom: parsed.data.nom,
          lieuDeVoteId: lieu.id,
          code: parsed.data.code || null,
          inscrits: parsed.data.inscrits ?? null,
        },
      });

      importedCount++;
    } catch {
      errors.push({ row: rowNumber, message: "Erreur lors de l'enregistrement" });
    }
  }

  await logAudit({
    userId: session.user.id,
    action: "IMPORT",
    entite: "BureauVote",
    details: { importedCount, errorCount: errors.length },
  });

  revalidatePath("/admin/bureaux");
  revalidatePath("/admin/lieux");
  revalidatePath("/admin");
  return { importedCount, errors };
}

export async function importPartis(
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const session = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { importedCount: 0, errors: [], fatalError: "Aucun fichier fourni" };
  }

  const { rows, error } = await parseSpreadsheet(file);
  if (error) {
    return { importedCount: 0, errors: [], fatalError: error };
  }

  const errors: { row: number; message: string }[] = [];
  let importedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2;
    const parsed = partiRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({
        row: rowNumber,
        message: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
      continue;
    }

    try {
      const parti = await prisma.partiPolitique.upsert({
        where: { code: parsed.data.code },
        update: {
          nom: parsed.data.nom,
          couleur: parsed.data.couleur || null,
        },
        create: {
          code: parsed.data.code,
          nom: parsed.data.nom,
          couleur: parsed.data.couleur || null,
        },
      });

      for (const [typeListe, numeroListe, mandataire] of [
        ["LOCALE", parsed.data.numeroListeLocale, parsed.data.mandataireLocale],
        ["REGIONALE", parsed.data.numeroListeRegionale, parsed.data.mandataireRegionale],
      ] as const) {
        if (numeroListe && mandataire) {
          await prisma.participationListe.upsert({
            where: { partiId_typeListe: { partiId: parti.id, typeListe } },
            update: { numeroListe, mandataire },
            create: { partiId: parti.id, typeListe, numeroListe, mandataire },
          });
        } else {
          await prisma.participationListe.deleteMany({
            where: { partiId: parti.id, typeListe },
          });
        }
      }

      importedCount++;
    } catch {
      errors.push({ row: rowNumber, message: "Erreur lors de l'enregistrement" });
    }
  }

  await logAudit({
    userId: session.user.id,
    action: "IMPORT",
    entite: "PartiPolitique",
    details: { importedCount, errorCount: errors.length },
  });

  revalidatePath("/admin/partis");
  return { importedCount, errors };
}
