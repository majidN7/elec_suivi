import { getTranslations } from "next-intl/server";
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Flag,
  Upload,
  Users,
  Unlock,
  ScrollText,
  Vote,
} from "lucide-react";
import { NavLinks, type NavItem } from "@/components/nav-links";
import { SignOutButton } from "@/components/sign-out-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Role } from "@/generated/prisma/enums";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

  const iconClass = "h-4 w-4";

  const adminItems: NavItem[] = [
    { href: "/admin", label: t("dashboard"), icon: <LayoutDashboard className={iconClass} /> },
    { href: "/admin/lieux", label: t("lieux"), icon: <MapPin className={iconClass} /> },
    { href: "/admin/bureaux", label: t("bureaux"), icon: <Building2 className={iconClass} /> },
    { href: "/admin/partis", label: t("partis"), icon: <Flag className={iconClass} /> },
    { href: "/admin/import", label: t("import"), icon: <Upload className={iconClass} /> },
    { href: "/admin/users", label: t("users"), icon: <Users className={iconClass} /> },
    {
      href: "/admin/unlock-requests",
      label: t("unlockRequests"),
      icon: <Unlock className={iconClass} />,
    },
    { href: "/admin/audit", label: t("audit"), icon: <ScrollText className={iconClass} /> },
  ];

  const agentItems: NavItem[] = [
    { href: "/saisie", label: t("saisie"), icon: <Vote className={iconClass} /> },
  ];

  const items = role === "ADMIN_NATIONAL" ? adminItems : agentItems;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-e border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 px-4 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Vote className="h-4 w-4" />
          </div>
          <h1 className="text-sm font-semibold text-slate-900">{tc("appName")}</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <NavLinks items={items} />
        </div>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {initials(userName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{userName}</p>
              <p className="truncate text-xs text-slate-500">{tr(role)}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <LanguageSwitcher />
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
