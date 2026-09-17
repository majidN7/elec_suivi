import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { updateUser } from "@/actions/users";
import { UserForm } from "@/components/user-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditUserPage({
  params,
}: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const tc = await getTranslations("common");

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    notFound();
  }

  const action = updateUser.bind(null, id);

  return (
    <div>
      <BackLink href="/admin/users" label={tc("back")} />
      <PageHeader title={`Utilisateur — ${user.name}`} />
      <UserForm
        action={action}
        requirePassword={false}
        defaultValues={{
          name: user.name,
          email: user.email,
          role: user.role,
          actif: user.actif,
        }}
      />
    </div>
  );
}
