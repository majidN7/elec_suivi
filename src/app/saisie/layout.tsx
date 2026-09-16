import { requireSession } from "@/lib/auth-helpers";
import { AppShell } from "@/components/app-shell";

export default async function SaisieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <AppShell role={session.user.role} userName={session.user.name}>
      {children}
    </AppShell>
  );
}
