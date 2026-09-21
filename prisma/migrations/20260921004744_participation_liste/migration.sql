-- CreateTable
CREATE TABLE "participations_liste" (
    "id" TEXT NOT NULL,
    "partiId" TEXT NOT NULL,
    "typeListe" "TypeListe" NOT NULL,
    "numeroListe" TEXT NOT NULL,
    "mandataire" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participations_liste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participations_liste_partiId_typeListe_key" ON "participations_liste"("partiId", "typeListe");

-- AddForeignKey
ALTER TABLE "participations_liste" ADD CONSTRAINT "participations_liste_partiId_fkey" FOREIGN KEY ("partiId") REFERENCES "partis_politiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

