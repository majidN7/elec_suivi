-- CreateEnum
CREATE TYPE "TypeListe" AS ENUM ('LOCALE', 'REGIONALE');

-- DropIndex
DROP INDEX "resultats_bureauVoteId_key";

-- AlterTable
ALTER TABLE "resultats" ADD COLUMN     "typeListe" "TypeListe" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "resultats_bureauVoteId_typeListe_key" ON "resultats"("bureauVoteId", "typeListe");

