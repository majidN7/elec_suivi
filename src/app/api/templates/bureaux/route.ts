import { requireAdmin } from "@/lib/auth-helpers";

const CSV = `numero,commune,nom,lieuDeVoteCode,lieuDeVoteNom,inscrits,code
1,Dakhla,Ecole Al Massira salle 1,LV-001,Ecole Al Massira,850,
2,Dakhla,Ecole Al Massira salle 2,LV-001,Ecole Al Massira,780,
`;

export async function GET() {
  await requireAdmin();

  return new Response(CSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modele_bureaux_de_vote.csv"',
    },
  });
}
