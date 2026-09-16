import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateUser } from "@/actions/users";
import { UserForm } from "@/components/user-form";

export default async function EditUserPage({
  params,
}: PageProps<"/admin/users/[id]">) {
  const { id } = await params;

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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Utilisateur — {user.name}
      </h1>
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
