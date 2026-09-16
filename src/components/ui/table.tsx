import { Card } from "@/components/ui/card";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </Card>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50/60">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-slate-50/80">{children}</tr>;
}

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle text-slate-700 ${className}`}>{children}</td>;
}
