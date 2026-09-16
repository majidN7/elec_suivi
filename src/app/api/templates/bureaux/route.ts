import { requireAdmin } from "@/lib/auth-helpers";

const CSV = `code,nom,lieuDeVoteCode,lieuDeVoteNom,inscrits
BV-001,Bureau 1,LV-001,Ecole Al Massira,850
BV-002,Bureau 2,LV-001,Ecole Al Massira,780
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
