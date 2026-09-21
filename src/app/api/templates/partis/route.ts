import { requireAdmin } from "@/lib/auth-helpers";

const CSV = `code,nom,couleur,numeroListeLocale,mandataireLocale,numeroListeRegionale,mandataireRegionale
الحمامة,حزب التجمع الوطني للأحرار,#2563eb,1,ممدو الشين,6,ملك حرمة الله
غصن الزيتون,حزب جبهة القوى الديمقراطية,#dc2626,18,عبد العزيز التويس,,
الأسد,الحزب المغربي الحر,#0ea5e9,,,8,هدى السباعي
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
