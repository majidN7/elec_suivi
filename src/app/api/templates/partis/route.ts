import { requireAdmin } from "@/lib/auth-helpers";

const CSV = `code,nom,couleur
PARTI-A,Parti Alpha,#2563eb
PARTI-B,Parti Beta,#dc2626
`;

export async function GET() {
  await requireAdmin();

  return new Response(CSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modele_partis_politiques.csv"',
    },
  });
}
