import { getTranslations } from "next-intl/server";
import { createUser } from "@/actions/users";
import { UserForm } from "@/components/user-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewUserPage() {
  const tu = await getTranslations("users");
  const tc = await getTranslations("common");

  return (
    <div>
      <BackLink href="/admin/users" label={tc("back")} />
      <PageHeader title={tu("nouveauUser")} />
      <UserForm action={createUser} requirePassword />
    </div>
  );
}
