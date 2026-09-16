import { Badge } from "@/components/ui/badge";

export function ResultatStatusBadge({
  statut,
  labels,
}: {
  statut: "BROUILLON" | "SOUMIS" | null;
  labels: { brouillon: string; soumis: string };
}) {
  if (!statut) return <Badge variant="neutral">—</Badge>;
  if (statut === "BROUILLON") return <Badge variant="warning">{labels.brouillon}</Badge>;
  return <Badge variant="success">{labels.soumis}</Badge>;
}
