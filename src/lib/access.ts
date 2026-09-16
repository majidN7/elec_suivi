import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";

export async function assertBureauAccess(
  userId: string,
  role: Role,
  bureauVoteId: string,
) {
  if (role === "ADMIN_NATIONAL") return;

  const assignment = await prisma.agentAssignment.findUnique({
    where: { userId_bureauVoteId: { userId, bureauVoteId } },
  });

  if (!assignment) {
    notFound();
  }
}
