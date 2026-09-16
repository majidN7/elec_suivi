import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/actions/users";
import { UserForm } from "@/components/user-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewUserPage() {
  const tu = await getTranslations("users");
  const tc = await getTranslations("common");
  const bureaux = await prisma.bureauVote.findMany({
    orderBy: { code: "asc" },
    select: { id: true, code: true, nom: true },
  });

  return (
    <div>
      <BackLink href="/admin/users" label={tc("back")} />
      <PageHeader title={tu("nouveauUser")} />
      <UserForm action={createUser} bureaux={bureaux} requirePassword />
    </div>
  );
}
