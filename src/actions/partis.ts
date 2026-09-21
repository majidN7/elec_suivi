"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { partiPolitiqueSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/actions/lieux";
import type { TypeListe } from "@/generated/prisma/enums";

async function syncParticipation(
  partiId: string,
  typeListe: TypeListe,
  numeroListe: string,
  mandataire: string,
) {
  if (numeroListe && mandataire) {
    await prisma.participationListe.upsert({
      where: { partiId_typeListe: { partiId, typeListe } },
      update: { numeroListe, mandataire },
      create: { partiId, typeListe, numeroListe, mandataire },
    });
  } else {
    await prisma.participationListe.deleteMany({ where: { partiId, typeListe } });
  }
}

export async function createParti(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = partiPolitiqueSchema.safeParse({
    code: formData.get("code"),
    nom: formData.get("nom"),
    couleur: formData.get("couleur"),
    numeroListeLocale: formData.get("numeroListeLocale"),
    mandataireLocale: formData.get("mandataireLocale"),
    numeroListeRegionale: formData.get("numeroListeRegionale"),
    mandataireRegionale: formData.get("mandataireRegionale"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.partiPolitique.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return { error: "Ce code de parti existe déjà" };
  }

  const parti = await prisma.partiPolitique.create({
    data: {
      code: parsed.data.code,
      nom: parsed.data.nom,
      couleur: parsed.data.couleur || null,
    },
  });

  await syncParticipation(
    parti.id,
    "LOCALE",
    parsed.data.numeroListeLocale ?? "",
    parsed.data.mandataireLocale ?? "",
  );
  await syncParticipation(
    parti.id,
    "REGIONALE",
    parsed.data.numeroListeRegionale ?? "",
    parsed.data.mandataireRegionale ?? "",
  );

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entite: "PartiPolitique",
    entiteId: parti.id,
    details: { code: parti.code, nom: parti.nom },
  });

  revalidatePath("/admin/partis");
  redirect("/admin/partis");
}

export async function updateParti(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = partiPolitiqueSchema.safeParse({
    code: formData.get("code"),
    nom: formData.get("nom"),
    couleur: formData.get("couleur"),
    numeroListeLocale: formData.get("numeroListeLocale"),
    mandataireLocale: formData.get("mandataireLocale"),
    numeroListeRegionale: formData.get("numeroListeRegionale"),
    mandataireRegionale: formData.get("mandataireRegionale"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const conflict = await prisma.partiPolitique.findFirst({
    where: { code: parsed.data.code, NOT: { id } },
  });
  if (conflict) {
    return { error: "Ce code de parti existe déjà" };
  }

  await prisma.partiPolitique.update({
    where: { id },
    data: {
      code: parsed.data.code,
      nom: parsed.data.nom,
      couleur: parsed.data.couleur || null,
    },
  });

  await syncParticipation(
    id,
    "LOCALE",
    parsed.data.numeroListeLocale ?? "",
    parsed.data.mandataireLocale ?? "",
  );
  await syncParticipation(
    id,
    "REGIONALE",
    parsed.data.numeroListeRegionale ?? "",
    parsed.data.mandataireRegionale ?? "",
  );

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entite: "PartiPolitique",
    entiteId: id,
    details: parsed.data,
  });

  revalidatePath("/admin/partis");
  redirect("/admin/partis");
}

export async function deleteParti(id: string) {
  const session = await requireAdmin();

  const voixCount = await prisma.resultatVoixParti.count({
    where: { partiId: id },
  });
  if (voixCount > 0) {
    throw new Error(
      "Impossible de supprimer un parti ayant déjà des résultats saisis",
    );
  }

  await prisma.partiPolitique.delete({ where: { id } });

  await logAudit({
    userId: session.user.id,
    action: "DELETE",
    entite: "PartiPolitique",
    entiteId: id,
  });

  revalidatePath("/admin/partis");
}
