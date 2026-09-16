import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateParti } from "@/actions/partis";
import { PartiForm } from "@/components/parti-form";

export default async function EditPartiPage({
  params,
}: PageProps<"/admin/partis/[id]">) {
  const { id } = await params;

  const parti = await prisma.partiPolitique.findUnique({ where: { id } });
  if (!parti) {
    notFound();
  }

  const action = updateParti.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Parti — {parti.nom}
      </h1>
      <PartiForm action={action} defaultValues={parti} />
    </div>
  );
}
