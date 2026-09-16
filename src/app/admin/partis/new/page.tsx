import { getTranslations } from "next-intl/server";
import { createParti } from "@/actions/partis";
import { PartiForm } from "@/components/parti-form";

export default async function NewPartiPage() {
  const tp = await getTranslations("partis");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{tp("nouveauParti")}</h1>
      <PartiForm action={createParti} />
    </div>
  );
}
