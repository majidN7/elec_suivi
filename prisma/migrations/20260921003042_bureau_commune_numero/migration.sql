-- Repartir de zéro sur les bureaux et résultats (accord explicite du client) :
-- l'ancien schéma d'identification (code DSIC seul, unique) est remplacé par
-- le couple (commune, numéro) réellement indiqué sur le PV, incompatible
-- avec les données de test existantes.
DELETE FROM "resultats";
DELETE FROM "bureaux_de_vote";

-- DropIndex
DROP INDEX "bureaux_de_vote_code_key";

-- AlterTable
ALTER TABLE "bureaux_de_vote" ADD COLUMN     "commune" TEXT NOT NULL,
ADD COLUMN     "numero" TEXT NOT NULL,
ALTER COLUMN "code" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bureaux_de_vote_commune_numero_key" ON "bureaux_de_vote"("commune", "numero");
