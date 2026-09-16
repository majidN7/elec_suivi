"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { lieuDeVoteSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export type ActionState = { error?: string } | undefined;

export async function createLieu(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = lieuDeVoteSchema.safeParse({
    code: formData.get("code"),
    nom: formData.get("nom"),
    adresse: formData.get("adresse"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.lieuDeVote.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return { error: "Ce code de lieu de vote existe déjà" };
  }

  const lieu = await prisma.lieuDeVote.create({
    data: {
      code: parsed.data.code,
      nom: parsed.data.nom,
      adresse: parsed.data.adresse || null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entite: "LieuDeVote",
    entiteId: lieu.id,
    details: { code: lieu.code, nom: lieu.nom },
  });

  revalidatePath("/admin/lieux");
  redirect("/admin/lieux");
}

export async function updateLieu(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = lieuDeVoteSchema.safeParse({
    code: formData.get("code"),
    nom: formData.get("nom"),
    adresse: formData.get("adresse"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const conflict = await prisma.lieuDeVote.findFirst({
    where: { code: parsed.data.code, NOT: { id } },
  });
  if (conflict) {
    return { error: "Ce code de lieu de vote existe déjà" };
  }

  await prisma.lieuDeVote.update({
    where: { id },
    data: {
      code: parsed.data.code,
      nom: parsed.data.nom,
      adresse: parsed.data.adresse || null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entite: "LieuDeVote",
    entiteId: id,
    details: parsed.data,
  });

  revalidatePath("/admin/lieux");
  redirect("/admin/lieux");
}

export async function deleteLieu(id: string) {
  const session = await requireAdmin();

  const bureauxCount = await prisma.bureauVote.count({
    where: { lieuDeVoteId: id },
  });
  if (bureauxCount > 0) {
    throw new Error(
      "Impossible de supprimer un lieu de vote contenant des bureaux de vote",
    );
  }

  await prisma.lieuDeVote.delete({ where: { id } });

  await logAudit({
    userId: session.user.id,
    action: "DELETE",
    entite: "LieuDeVote",
    entiteId: id,
  });

  revalidatePath("/admin/lieux");
}
