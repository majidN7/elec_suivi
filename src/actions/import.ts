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
  code: z.string().trim().min(1, "code manquant"),
  nom: z.string().trim().min(1, "nom manquant"),
  lieuDeVoteCode: z.string().trim().min(1, "lieuDeVoteCode manquant"),
  lieuDeVoteNom: z.string().trim().optional(),
  inscrits: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v >= 0), {
      message: "inscrits doit être un entier positif",
    }),
});

const partiRowSchema = z.object({
  code: z.string().trim().min(1, "code manquant"),
  nom: z.string().trim().min(1, "nom manquant"),
  couleur: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^#[0-9a-fA-F]{6}$/.test(v), {
      message: "couleur invalide (format #RRGGBB)",
    }),
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
        where: { code: parsed.data.code },
        update: {
          nom: parsed.data.nom,
          lieuDeVoteId: lieu.id,
          inscrits: parsed.data.inscrits ?? null,
        },
        create: {
          code: parsed.data.code,
          nom: parsed.data.nom,
          lieuDeVoteId: lieu.id,
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
      await prisma.partiPolitique.upsert({
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
