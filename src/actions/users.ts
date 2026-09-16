"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { userSchema, userCreateSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/actions/lieux";

function extractPayload(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    actif: formData.get("actif") === "on",
    bureauIds: formData.getAll("bureauIds"),
  };
}

export async function createUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = userCreateSchema.safeParse({
    ...extractPayload(formData),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Un utilisateur avec cet e-mail existe déjà" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      actif: parsed.data.actif,
      passwordHash,
      assignments: {
        create: parsed.data.bureauIds.map((bureauVoteId) => ({ bureauVoteId })),
      },
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entite: "User",
    entiteId: user.id,
    details: { email: user.email, role: user.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = userSchema.safeParse(extractPayload(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const conflict = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id } },
  });
  if (conflict) {
    return { error: "Un utilisateur avec cet e-mail existe déjà" };
  }

  const password = formData.get("password");
  const passwordHash =
    typeof password === "string" && password.length > 0
      ? await bcrypt.hash(password, 12)
      : undefined;

  if (typeof password === "string" && password.length > 0 && password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        actif: parsed.data.actif,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    await tx.agentAssignment.deleteMany({ where: { userId: id } });
    if (parsed.data.bureauIds.length > 0) {
      await tx.agentAssignment.createMany({
        data: parsed.data.bureauIds.map((bureauVoteId) => ({
          userId: id,
          bureauVoteId,
        })),
      });
    }
  });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entite: "User",
    entiteId: id,
    details: { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();

  if (id === session.user.id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte");
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    throw new Error(
      "Impossible de supprimer un utilisateur ayant déjà soumis des résultats ou traité des demandes",
    );
  }

  await logAudit({
    userId: session.user.id,
    action: "DELETE",
    entite: "User",
    entiteId: id,
  });

  revalidatePath("/admin/users");
}
