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
    numero: formData.get("numero"),
    commune: formData.get("commune"),
    nom: formData.get("nom"),
    lieuDeVoteId: formData.get("lieuDeVoteId"),
    code: formData.get("code") || undefined,
    inscrits: formData.get("inscrits") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.bureauVote.findUnique({
    where: { commune_numero: { commune: parsed.data.commune, numero: parsed.data.numero } },
  });
  if (existing) {
    return { error: "Un bureau avec ce numéro existe déjà dans cette commune" };
  }

  const bureau = await prisma.bureauVote.create({
    data: {
      numero: parsed.data.numero,
      commune: parsed.data.commune,
      nom: parsed.data.nom,
      lieuDeVoteId: parsed.data.lieuDeVoteId,
      code: parsed.data.code || null,
      inscrits: parsed.data.inscrits ?? null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entite: "BureauVote",
    entiteId: bureau.id,
    details: { numero: bureau.numero, commune: bureau.commune, nom: bureau.nom },
  });

  revalidatePath("/admin/bureaux");
  revalidatePath("/admin");
  redirect("/admin/bureaux");
}

export async function updateBureau(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = bureauVoteSchema.safeParse({
    numero: formData.get("numero"),
    commune: formData.get("commune"),
    nom: formData.get("nom"),
    lieuDeVoteId: formData.get("lieuDeVoteId"),
    code: formData.get("code") || undefined,
    inscrits: formData.get("inscrits") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const conflict = await prisma.bureauVote.findFirst({
    where: { commune: parsed.data.commune, numero: parsed.data.numero, NOT: { id } },
  });
  if (conflict) {
    return { error: "Un bureau avec ce numéro existe déjà dans cette commune" };
  }

  await prisma.bureauVote.update({
    where: { id },
    data: {
      numero: parsed.data.numero,
      commune: parsed.data.commune,
      nom: parsed.data.nom,
      lieuDeVoteId: parsed.data.lieuDeVoteId,
      code: parsed.data.code || null,
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
}
