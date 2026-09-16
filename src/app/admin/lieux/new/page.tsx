import { getTranslations } from "next-intl/server";
import { createLieu } from "@/actions/lieux";
import { LieuForm } from "@/components/lieu-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewLieuPage() {
  const t = await getTranslations("geo");
  const tc = await getTranslations("common");

  return (
    <div>
      <BackLink href="/admin/lieux" label={tc("back")} />
      <PageHeader title={t("nouveauLieu")} />
      <LieuForm action={createLieu} />
    </div>
  );
}
