"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/auth-helpers";
import { assertBureauAccess } from "@/lib/access";
import { unlockRequestSchema, unlockDecisionSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/actions/lieux";

export async function requestUnlock(
  bureauVoteId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  await assertBureauAccess(session.user.id, session.user.role, bureauVoteId);

  const resultat = await prisma.resultat.findUnique({
    where: { bureauVoteId },
  });

  if (!resultat || resultat.statut !== "SOUMIS") {
    return { error: "Ce résultat n'est pas verrouillé" };
  }

  const existingPending = await prisma.unlockRequest.findFirst({
    where: { resultatId: resultat.id, statut: "EN_ATTENTE" },
  });
  if (existingPending) {
    return { error: "Une demande de déverrouillage est déjà en attente" };
  }

  const parsed = unlockRequestSchema.safeParse({
    resultatId: resultat.id,
    motif: formData.get("motif"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const unlockRequest = await prisma.unlockRequest.create({
    data: {
      resultatId: resultat.id,
      demandeParId: session.user.id,
      motif: parsed.data.motif,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "UNLOCK_REQUEST",
    entite: "Resultat",
    entiteId: resultat.id,
    details: { unlockRequestId: unlockRequest.id, motif: parsed.data.motif },
  });

  revalidatePath(`/saisie/${bureauVoteId}`);
  revalidatePath("/admin/unlock-requests");
  return { error: undefined };
}

export async function decideUnlock(
  unlockRequestId: string,
  decision: "APPROUVEE" | "REJETEE",
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = unlockDecisionSchema.safeParse({
    unlockRequestId,
    decision,
    motifTraite: formData.get("motifTraite"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const unlockRequest = await prisma.unlockRequest.findUnique({
    where: { id: unlockRequestId },
    include: { resultat: true },
  });

  if (!unlockRequest || unlockRequest.statut !== "EN_ATTENTE") {
    return { error: "Cette demande a déjà été traitée" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.unlockRequest.update({
      where: { id: unlockRequestId },
      data: {
        statut: parsed.data.decision,
        traiteParId: session.user.id,
        traiteAt: new Date(),
        motifTraite: parsed.data.motifTraite || null,
      },
    });

    if (parsed.data.decision === "APPROUVEE") {
      await tx.resultat.update({
        where: { id: unlockRequest.resultatId },
        data: { statut: "BROUILLON" },
      });
    }
  });

  await logAudit({
    userId: session.user.id,
    action: parsed.data.decision === "APPROUVEE" ? "UNLOCK_APPROVE" : "UNLOCK_REJECT",
    entite: "Resultat",
    entiteId: unlockRequest.resultatId,
    details: { unlockRequestId },
  });

  revalidatePath("/admin/unlock-requests");
  return { error: undefined };
}
