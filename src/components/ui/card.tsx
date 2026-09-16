export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02] ${className}`}
    >
      {children}
    </div>
  );
}
