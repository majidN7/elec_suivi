import { PrismaClient } from "../../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// wipe everything except users (keep for login)
await prisma.resultatVoixParti.deleteMany({});
await prisma.unlockRequest.deleteMany({});
await prisma.resultat.deleteMany({});
await prisma.participationListe.deleteMany({});
await prisma.partiPolitique.deleteMany({});
await prisma.bureauVote.deleteMany({});
await prisma.lieuDeVote.deleteMany({});
await prisma.auditLog.deleteMany({});

const hash = await bcrypt.hash("TestPass123!", 12);
await prisma.user.upsert({
  where: { email: "qa-admin@test.local" },
  update: { passwordHash: hash, role: "ADMIN_NATIONAL", actif: true },
  create: { name: "QA Admin", email: "qa-admin@test.local", passwordHash: hash, role: "ADMIN_NATIONAL", actif: true },
});
await prisma.user.upsert({
  where: { email: "qa-agent@test.local" },
  update: { passwordHash: hash, role: "AGENT_SAISIE", actif: true },
  create: { name: "QA Agent", email: "qa-agent@test.local", passwordHash: hash, role: "AGENT_SAISIE", actif: true },
});

const lieu = await prisma.lieuDeVote.create({
  data: { code: "LV-QA-1", nom: "Ecole QA Test" },
});

// Bureau n°1 in Dakhla and n°1 in Mijik (TC tests), plus n°2 Dakhla (TN tests)
const bvDakhla1 = await prisma.bureauVote.create({
  data: { numero: "1", commune: "Dakhla", nom: "Ecole QA salle 1", lieuDeVoteId: lieu.id, inscrits: 500 },
});
const bvMijik1 = await prisma.bureauVote.create({
  data: { numero: "1", commune: "Mijik", nom: "Ecole QA Mijik salle 1", lieuDeVoteId: lieu.id, inscrits: 200 },
});
const bvDakhla2 = await prisma.bureauVote.create({
  data: { numero: "2", commune: "Dakhla", nom: "Ecole QA salle 2", lieuDeVoteId: lieu.id, inscrits: 300 },
});

// Partis: A (local+regional), B (local only), C (regional only)
const partiA = await prisma.partiPolitique.create({ data: { code: "PARTI-A", nom: "Parti Alpha Test", couleur: "#2563eb" } });
const partiB = await prisma.partiPolitique.create({ data: { code: "PARTI-B", nom: "Parti Beta Test", couleur: "#dc2626" } });
const partiC = await prisma.partiPolitique.create({ data: { code: "PARTI-C", nom: "Parti Gamma Test", couleur: "#16a34a" } });

await prisma.participationListe.createMany({
  data: [
    { partiId: partiA.id, typeListe: "LOCALE", numeroListe: "1", mandataire: "Mandataire A Local" },
    { partiId: partiA.id, typeListe: "REGIONALE", numeroListe: "1", mandataire: "Mandataire A Regional" },
    { partiId: partiB.id, typeListe: "LOCALE", numeroListe: "2", mandataire: "Mandataire B" },
    { partiId: partiC.id, typeListe: "REGIONALE", numeroListe: "2", mandataire: "Mandataire C" },
  ],
});

console.log(JSON.stringify({
  lieuId: lieu.id,
  bvDakhla1: bvDakhla1.id,
  bvMijik1: bvMijik1.id,
  bvDakhla2: bvDakhla2.id,
  partiA: partiA.id,
  partiB: partiB.id,
  partiC: partiC.id,
}, null, 2));

await prisma.$disconnect();
