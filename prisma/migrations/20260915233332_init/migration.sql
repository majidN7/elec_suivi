-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_NATIONAL', 'AGENT_SAISIE');

-- CreateEnum
CREATE TYPE "ResultatStatut" AS ENUM ('BROUILLON', 'SOUMIS');

-- CreateEnum
CREATE TYPE "UnlockStatut" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT_SAISIE',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lieux_de_vote" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lieux_de_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bureaux_de_vote" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "inscrits" INTEGER,
    "lieuDeVoteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bureaux_de_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partis_politiques" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "couleur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partis_politiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultats" (
    "id" TEXT NOT NULL,
    "bureauVoteId" TEXT NOT NULL,
    "totalVotants" INTEGER NOT NULL,
    "votesRejetes" INTEGER NOT NULL,
    "statut" "ResultatStatut" NOT NULL DEFAULT 'BROUILLON',
    "soumisParId" TEXT,
    "soumisAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resultats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultat_voix_parti" (
    "id" TEXT NOT NULL,
    "resultatId" TEXT NOT NULL,
    "partiId" TEXT NOT NULL,
    "voix" INTEGER NOT NULL,

    CONSTRAINT "resultat_voix_parti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bureauVoteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unlock_requests" (
    "id" TEXT NOT NULL,
    "resultatId" TEXT NOT NULL,
    "demandeParId" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" "UnlockStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "traiteParId" TEXT,
    "motifTraite" TEXT,
    "traiteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unlock_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lieux_de_vote_code_key" ON "lieux_de_vote"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bureaux_de_vote_code_key" ON "bureaux_de_vote"("code");

-- CreateIndex
CREATE INDEX "bureaux_de_vote_lieuDeVoteId_idx" ON "bureaux_de_vote"("lieuDeVoteId");

-- CreateIndex
CREATE UNIQUE INDEX "partis_politiques_code_key" ON "partis_politiques"("code");

-- CreateIndex
CREATE UNIQUE INDEX "resultats_bureauVoteId_key" ON "resultats"("bureauVoteId");

-- CreateIndex
CREATE INDEX "resultat_voix_parti_partiId_idx" ON "resultat_voix_parti"("partiId");

-- CreateIndex
CREATE UNIQUE INDEX "resultat_voix_parti_resultatId_partiId_key" ON "resultat_voix_parti"("resultatId", "partiId");

-- CreateIndex
CREATE INDEX "agent_assignments_bureauVoteId_idx" ON "agent_assignments"("bureauVoteId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_assignments_userId_bureauVoteId_key" ON "agent_assignments"("userId", "bureauVoteId");

-- CreateIndex
CREATE INDEX "unlock_requests_resultatId_idx" ON "unlock_requests"("resultatId");

-- CreateIndex
CREATE INDEX "unlock_requests_statut_idx" ON "unlock_requests"("statut");

-- CreateIndex
CREATE INDEX "audit_logs_entite_entiteId_idx" ON "audit_logs"("entite", "entiteId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "bureaux_de_vote" ADD CONSTRAINT "bureaux_de_vote_lieuDeVoteId_fkey" FOREIGN KEY ("lieuDeVoteId") REFERENCES "lieux_de_vote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats" ADD CONSTRAINT "resultats_bureauVoteId_fkey" FOREIGN KEY ("bureauVoteId") REFERENCES "bureaux_de_vote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats" ADD CONSTRAINT "resultats_soumisParId_fkey" FOREIGN KEY ("soumisParId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultat_voix_parti" ADD CONSTRAINT "resultat_voix_parti_resultatId_fkey" FOREIGN KEY ("resultatId") REFERENCES "resultats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultat_voix_parti" ADD CONSTRAINT "resultat_voix_parti_partiId_fkey" FOREIGN KEY ("partiId") REFERENCES "partis_politiques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_assignments" ADD CONSTRAINT "agent_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_assignments" ADD CONSTRAINT "agent_assignments_bureauVoteId_fkey" FOREIGN KEY ("bureauVoteId") REFERENCES "bureaux_de_vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_requests" ADD CONSTRAINT "unlock_requests_resultatId_fkey" FOREIGN KEY ("resultatId") REFERENCES "resultats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_requests" ADD CONSTRAINT "unlock_requests_demandeParId_fkey" FOREIGN KEY ("demandeParId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_requests" ADD CONSTRAINT "unlock_requests_traiteParId_fkey" FOREIGN KEY ("traiteParId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
