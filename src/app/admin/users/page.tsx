import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/actions/users";
import { DeleteButton } from "@/components/delete-button";

export default async function UsersPage() {
  const tu = await getTranslations("users");
  const tr = await getTranslations("roles");
  const tc = await getTranslations("common");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { assignments: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{tu("title")}</h1>
        <Link
          href="/admin/users/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {tu("nouveauUser")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{tu("nom")}</th>
              <th className="px-4 py-3">{tu("email")}</th>
              <th className="px-4 py-3">{tu("role")}</th>
              <th className="px-4 py-3">{tu("bureauxAssignes")}</th>
              <th className="px-4 py-3">{tu("actif")}</th>
              <th className="px-4 py-3">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-slate-500">{user.email}</td>
                <td className="px-4 py-3">{tr(user.role)}</td>
                <td className="px-4 py-3">{user._count.assignments}</td>
                <td className="px-4 py-3">
                  {user.actif ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      {tc("yes")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {tc("no")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm text-slate-600 hover:underline"
                    >
                      {tc("edit")}
                    </Link>
                    <DeleteButton
                      action={deleteUser.bind(null, user.id)}
                      confirmMessage={`Supprimer l'utilisateur "${user.name}" ?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
