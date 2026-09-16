import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/actions/users";
import { UserForm } from "@/components/user-form";

export default async function NewUserPage() {
  const tu = await getTranslations("users");
  const bureaux = await prisma.bureauVote.findMany({
    orderBy: { code: "asc" },
    select: { id: true, code: true, nom: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{tu("nouveauUser")}</h1>
      <UserForm action={createUser} bureaux={bureaux} requirePassword />
    </div>
  );
}
