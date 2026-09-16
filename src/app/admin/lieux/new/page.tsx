import { getTranslations } from "next-intl/server";
import { createLieu } from "@/actions/lieux";
import { LieuForm } from "@/components/lieu-form";

export default async function NewLieuPage() {
  const t = await getTranslations("geo");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t("nouveauLieu")}</h1>
      <LieuForm action={createLieu} />
    </div>
  );
}
