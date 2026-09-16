import { requireAdmin } from "@/lib/auth-helpers";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AppShell role={session.user.role} userName={session.user.name}>
      {children}
    </AppShell>
  );
}
