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

  const [user, bureaux] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: { assignments: true },
    }),
    prisma.bureauVote.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, nom: true },
    }),
  ]);

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
        bureaux={bureaux}
        requirePassword={false}
        defaultValues={{
          name: user.name,
          email: user.email,
          role: user.role,
          actif: user.actif,
          bureauIds: user.assignments.map((a) => a.bureauVoteId),
        }}
      />
    </div>
  );
}
