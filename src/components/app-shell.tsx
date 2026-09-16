import { getTranslations } from "next-intl/server";
import { NavLinks } from "@/components/nav-links";
import { SignOutButton } from "@/components/sign-out-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Role } from "@/generated/prisma/enums";

export async function AppShell({
  role,
  userName,
  children,
}: {
  role: Role;
  userName: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const tr = await getTranslations("roles");

  const adminItems = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/lieux", label: t("lieux") },
    { href: "/admin/bureaux", label: t("bureaux") },
    { href: "/admin/partis", label: t("partis") },
    { href: "/admin/import", label: t("import") },
    { href: "/admin/users", label: t("users") },
    { href: "/admin/unlock-requests", label: t("unlockRequests") },
    { href: "/admin/audit", label: t("audit") },
  ];

  const agentItems = [{ href: "/saisie", label: t("saisie") }];

  const items = role === "ADMIN_NATIONAL" ? adminItems : agentItems;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col gap-6 border-e border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-base font-bold text-slate-900">{tc("appName")}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {userName} · {tr(role)}
          </p>
        </div>
        <NavLinks items={items} />
        <div className="mt-auto flex flex-col gap-2">
          <LanguageSwitcher />
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6">{children}</main>
    </div>
  );
}
