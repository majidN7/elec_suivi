"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { bureauVoteSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/actions/lieux";

export async function createBureau(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = bureauVoteSchema.safeParse({
    code: formData.get("code"),
    nom: formData.get("nom"),
    lieuDeVoteId: formData.get("lieuDeVoteId"),
    inscrits: formData.get("inscrits") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.bureauVote.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return { error: "Ce code de bureau de vote existe déjà" };
  }

  const bureau = await prisma.bureauVote.create({
    data: {
      code: parsed.data.code,
      nom: parsed.data.nom,
      lieuDeVoteId: parsed.data.lieuDeVoteId,
      inscrits: parsed.data.inscrits ?? null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entite: "BureauVote",
    entiteId: bureau.id,
    details: { code: bureau.code, nom: bureau.nom },
  });

  revalidatePath("/admin/bureaux");
  redirect("/admin/bureaux");
}

export async function updateBureau(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = bureauVoteSchema.safeParse({
    code: formData.get("code"),
    nom: formData.get("nom"),
    lieuDeVoteId: formData.get("lieuDeVoteId"),
    inscrits: formData.get("inscrits") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const conflict = await prisma.bureauVote.findFirst({
    where: { code: parsed.data.code, NOT: { id } },
  });
  if (conflict) {
    return { error: "Ce code de bureau de vote existe déjà" };
  }

  await prisma.bureauVote.update({
    where: { id },
    data: {
      code: parsed.data.code,
      nom: parsed.data.nom,
      lieuDeVoteId: parsed.data.lieuDeVoteId,
      inscrits: parsed.data.inscrits ?? null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entite: "BureauVote",
    entiteId: id,
    details: parsed.data,
  });

  revalidatePath("/admin/bureaux");
  redirect("/admin/bureaux");
}

export async function deleteBureau(id: string) {
  const session = await requireAdmin();

  const resultat = await prisma.resultat.findFirst({
    where: { bureauVoteId: id },
  });
  if (resultat) {
    throw new Error(
      "Impossible de supprimer un bureau de vote ayant déjà un résultat saisi",
    );
  }

  await prisma.bureauVote.delete({ where: { id } });

  await logAudit({
    userId: session.user.id,
    action: "DELETE",
    entite: "BureauVote",
    entiteId: id,
  });

  revalidatePath("/admin/bureaux");
}
