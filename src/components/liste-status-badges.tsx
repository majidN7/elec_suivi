import { Badge } from "@/components/ui/badge";

type ResultatStatut = "BROUILLON" | "SOUMIS";

export function ListeStatusBadges({
  resultats,
  labels,
}: {
  resultats: { typeListe: "LOCALE" | "REGIONALE"; statut: ResultatStatut }[];
  labels: { locale: string; regionale: string; brouillon: string; soumis: string };
}) {
  const statutFor = (type: "LOCALE" | "REGIONALE") =>
    resultats.find((r) => r.typeListe === type)?.statut;

  const badge = (type: "LOCALE" | "REGIONALE", label: string) => {
    const statut = statutFor(type);
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-slate-400">{label} :</span>
        {!statut && <Badge variant="neutral">—</Badge>}
        {statut === "BROUILLON" && <Badge variant="warning">{labels.brouillon}</Badge>}
        {statut === "SOUMIS" && <Badge variant="success">{labels.soumis}</Badge>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      {badge("LOCALE", labels.locale)}
      {badge("REGIONALE", labels.regionale)}
    </div>
  );
}
