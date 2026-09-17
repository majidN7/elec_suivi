"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import { assertBureauAccess } from "@/lib/access";
import { resultatSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/actions/lieux";
import type { TypeListe } from "@/generated/prisma/enums";

const draftSchema = z.object({
  totalVotants: z.coerce.number().int().min(0),
  votesRejetes: z.coerce.number().int().min(0),
  voix: z.array(
    z.object({
      partiId: z.string().min(1),
      voix: z.coerce.number().int().min(0),
    }),
  ),
});

function extractVoixFromFormData(formData: FormData, partiIds: string[]) {
  return partiIds.map((partiId) => ({
    partiId,
    voix: formData.get(`voix_${partiId}`) ?? "0",
  }));
}

async function assertEditable(bureauVoteId: string, typeListe: TypeListe) {
  const resultat = await prisma.resultat.findUnique({
    where: { bureauVoteId_typeListe: { bureauVoteId, typeListe } },
  });
  if (resultat?.statut === "SOUMIS") {
    throw new Error(
      "Ce résultat est verrouillé et ne peut plus être modifié. Demandez un déverrouillage.",
    );
  }
  return resultat;
}

export async function saveResultatDraft(
  bureauVoteId: string,
  typeListe: TypeListe,
  partiIds: string[],
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  await assertBureauAccess(session.user.id, session.user.role, bureauVoteId);

  try {
    await assertEditable(bureauVoteId, typeListe);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur" };
  }

  const parsed = draftSchema.safeParse({
    totalVotants: formData.get("totalVotants"),
    votesRejetes: formData.get("votesRejetes"),
    voix: extractVoixFromFormData(formData, partiIds),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await prisma.$transaction(async (tx) => {
    const resultat = await tx.resultat.upsert({
      where: { bureauVoteId_typeListe: { bureauVoteId, typeListe } },
      update: {
        totalVotants: parsed.data.totalVotants,
        votesRejetes: parsed.data.votesRejetes,
      },
      create: {
        bureauVoteId,
        typeListe,
        totalVotants: parsed.data.totalVotants,
        votesRejetes: parsed.data.votesRejetes,
        statut: "BROUILLON",
      },
    });

    for (const v of parsed.data.voix) {
      await tx.resultatVoixParti.upsert({
        where: { resultatId_partiId: { resultatId: resultat.id, partiId: v.partiId } },
        update: { voix: v.voix },
        create: { resultatId: resultat.id, partiId: v.partiId, voix: v.voix },
      });
    }
  });

  await logAudit({
    userId: session.user.id,
    action: "SAVE_DRAFT",
    entite: "Resultat",
    entiteId: bureauVoteId,
    details: { typeListe },
  });

  revalidatePath(`/saisie/${bureauVoteId}`);
  return { error: undefined };
}

export async function submitResultat(
  bureauVoteId: string,
  typeListe: TypeListe,
  partiIds: string[],
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  await assertBureauAccess(session.user.id, session.user.role, bureauVoteId);

  try {
    await assertEditable(bureauVoteId, typeListe);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur" };
  }

  const parsed = resultatSchema.safeParse({
    bureauVoteId,
    typeListe,
    totalVotants: formData.get("totalVotants"),
    votesRejetes: formData.get("votesRejetes"),
    voix: extractVoixFromFormData(formData, partiIds),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await prisma.$transaction(async (tx) => {
    const resultat = await tx.resultat.upsert({
      where: { bureauVoteId_typeListe: { bureauVoteId, typeListe } },
      update: {
        totalVotants: parsed.data.totalVotants,
        votesRejetes: parsed.data.votesRejetes,
        statut: "SOUMIS",
        soumisParId: session.user.id,
        soumisAt: new Date(),
      },
      create: {
        bureauVoteId,
        typeListe,
        totalVotants: parsed.data.totalVotants,
        votesRejetes: parsed.data.votesRejetes,
        statut: "SOUMIS",
        soumisParId: session.user.id,
        soumisAt: new Date(),
      },
    });

    for (const v of parsed.data.voix) {
      await tx.resultatVoixParti.upsert({
        where: { resultatId_partiId: { resultatId: resultat.id, partiId: v.partiId } },
        update: { voix: v.voix },
        create: { resultatId: resultat.id, partiId: v.partiId, voix: v.voix },
      });
    }

    return resultat;
  });

  await logAudit({
    userId: session.user.id,
    action: "SUBMIT",
    entite: "Resultat",
    entiteId: bureauVoteId,
    details: {
      typeListe,
      totalVotants: parsed.data.totalVotants,
      votesRejetes: parsed.data.votesRejetes,
    },
  });

  revalidatePath(`/saisie/${bureauVoteId}`);
  revalidatePath("/saisie");
  revalidatePath("/admin");
  revalidatePath("/admin/bureaux");
  return { error: undefined };
}
