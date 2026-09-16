import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function logAudit(params: {
  userId: string | null;
  action: string;
  entite: string;
  entiteId?: string | null;
  details?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entite: params.entite,
      entiteId: params.entiteId ?? null,
      details: params.details,
    },
  });
}
