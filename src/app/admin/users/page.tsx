import { getTranslations } from "next-intl/server";
import { Users as UsersIcon, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/actions/users";
import { DeleteButton } from "@/components/delete-button";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function UsersPage() {
  const tu = await getTranslations("users");
  const tr = await getTranslations("roles");
  const tc = await getTranslations("common");
  const te = await getTranslations("empty");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PageHeader
        title={tu("title")}
        action={
          <ButtonLink href="/admin/users/new" icon={Plus}>
            {tu("nouveauUser")}
          </ButtonLink>
        }
      />

      {users.length === 0 ? (
        <Card>
          <EmptyState icon={UsersIcon} title={te("usersTitle")} />
        </Card>
      ) : (
        <Table>
          <Thead>
            <Th>{tu("nom")}</Th>
            <Th>{tu("role")}</Th>
            <Th>{tu("actif")}</Th>
            <Th>{tc("actions")}</Th>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                      {initials(user.name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge variant={user.role === "ADMIN_NATIONAL" ? "brand" : "neutral"}>
                    {tr(user.role)}
                  </Badge>
                </Td>
                <Td>
                  <Badge variant={user.actif ? "success" : "neutral"}>
                    {user.actif ? tc("yes") : tc("no")}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-4">
                    <EditLink href={`/admin/users/${user.id}`} label={tc("edit")} />
                    <DeleteButton
                      action={deleteUser.bind(null, user.id)}
                      confirmMessage={`Supprimer l'utilisateur "${user.name}" ?`}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
