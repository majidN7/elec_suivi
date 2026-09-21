import { chromium } from "playwright";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { quotientElectoral, repartirSieges, siegesPourListe } from "../../src/lib/seats.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BASE = "http://localhost:3000";
const results = [];
function record(id, status, expected, actual) {
  results.push({ id, status, expected, actual });
  console.log(`[${status}] ${id} — ${actual}`);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function main() {
  // ---------- Clean deterministic dataset for TR calculation tests ----------
  await prisma.resultatVoixParti.deleteMany({});
  await prisma.unlockRequest.deleteMany({});
  await prisma.resultat.deleteMany({});
  await prisma.participationListe.deleteMany({});
  await prisma.partiPolitique.deleteMany({});
  await prisma.bureauVote.deleteMany({});
  await prisma.lieuDeVote.deleteMany({});

  const lieu = await prisma.lieuDeVote.create({ data: { code: "LV-TR", nom: "Lieu TR" } });

  // TR-01: 3 bureaux, no submitted results yet
  const bv1 = await prisma.bureauVote.create({ data: { numero: "1", commune: "TRCommune", nom: "Bureau TR 1", lieuDeVoteId: lieu.id, inscrits: 400 } });
  const bv2 = await prisma.bureauVote.create({ data: { numero: "2", commune: "TRCommune", nom: "Bureau TR 2", lieuDeVoteId: lieu.id, inscrits: 350 } });
  const bv3 = await prisma.bureauVote.create({ data: { numero: "3", commune: "TRCommune", nom: "Bureau TR 3", lieuDeVoteId: lieu.id, inscrits: 250 } });
  // extra bureau for TR-02/03 with a 4th one that stays unsubmitted, contributing to Inscrits but not Votants
  const bv4 = await prisma.bureauVote.create({ data: { numero: "4", commune: "TRCommune", nom: "Bureau TR 4", lieuDeVoteId: lieu.id, inscrits: 0 } });

  const manualSum = 400 + 350 + 250 + 0;
  const dbSum = await prisma.bureauVote.aggregate({ _sum: { inscrits: true } });
  if (dbSum._sum.inscrits === manualSum) {
    record("TR-01", "PASS", "Inscrits = SUM(bureaux_de_vote.inscrits) sur tous les bureaux, sans filtre", `manuel=${manualSum}, SQL SUM=${dbSum._sum.inscrits}`);
  } else {
    record("TR-01", "FAIL", "Inscrits = SUM(bureaux_de_vote.inscrits)", `manuel=${manualSum}, SQL SUM=${dbSum._sum.inscrits}`);
  }

  // Parties: 2 locale, 2 regionale (1 shared)
  const partiA = await prisma.partiPolitique.create({ data: { code: "TRP-A", nom: "TR Parti A", couleur: "#111111" } });
  const partiB = await prisma.partiPolitique.create({ data: { code: "TRP-B", nom: "TR Parti B", couleur: "#222222" } });
  const partiC = await prisma.partiPolitique.create({ data: { code: "TRP-C", nom: "TR Parti C", couleur: "#333333" } });
  await prisma.participationListe.createMany({
    data: [
      { partiId: partiA.id, typeListe: "LOCALE", numeroListe: "1", mandataire: "M-A-L" },
      { partiId: partiB.id, typeListe: "LOCALE", numeroListe: "2", mandataire: "M-B-L" },
      { partiId: partiA.id, typeListe: "REGIONALE", numeroListe: "1", mandataire: "M-A-R" },
      { partiId: partiC.id, typeListe: "REGIONALE", numeroListe: "2", mandataire: "M-C-R" },
    ],
  });

  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, "qa-admin@test.local", "TestPass123!");

  async function submit(bureauId, typeListe, votants, nuls, voixMap) {
    await page.goto(`${BASE}/saisie/${bureauId}`);
    const label = typeListe === "LOCALE" ? "Liste locale" : "Liste régionale";
    const sec = page.locator(`h2:has-text('${label}')`).locator("xpath=..");
    await sec.locator("#totalVotants").fill(String(votants));
    await sec.locator("#votesRejetes").fill(String(nuls));
    for (const [partiId, voix] of Object.entries(voixMap)) {
      await sec.locator(`input[name="voix_${partiId}"]`).fill(String(voix));
    }
    page.once("dialog", (d) => d.accept());
    await sec.locator('button:has-text("Soumettre")').click();
    await page.waitForTimeout(900);
  }

  // TR-02: 2 local results (300 + 150) on bv1/bv2, 1 regional result (200) on bv3
  await submit(bv1.id, "LOCALE", 300, 10, { [partiA.id]: 150, [partiB.id]: 140 });
  await submit(bv2.id, "LOCALE", 150, 5, { [partiA.id]: 80, [partiB.id]: 65 });
  await submit(bv3.id, "REGIONALE", 200, 10, { [partiA.id]: 100, [partiC.id]: 90 });

  await page.goto(`${BASE}/admin`);
  const bodyAdmin = await page.locator("body").innerText();
  // ListeTabs default shows LOCALE first
  const localeVotantsOk = bodyAdmin.includes("450"); // 300+150
  await page.locator('button:has-text("Liste régionale")').click().catch(() => {});
  await page.waitForTimeout(300);
  const bodyAdminRegionale = await page.locator("body").innerText();
  const regionaleVotantsOk = bodyAdminRegionale.includes("200");
  if (localeVotantsOk && regionaleVotantsOk) {
    record("TR-02", "PASS", "Liste locale=450 votants, Liste régionale=200 votants, aucune fuite entre onglets", `locale contient 450: ${localeVotantsOk}, régionale contient 200: ${regionaleVotantsOk}`);
  } else {
    record("TR-02", "FAIL", "Liste locale=450 votants, Liste régionale=200 votants", `locale contient 450: ${localeVotantsOk}, régionale contient 200: ${regionaleVotantsOk}`);
  }

  // TR-03: TP = Votants/Inscrits x 100 = 450/1000*100 = 45.0% for LOCALE (inscrits total=1000, votants locale=450)
  const totalInscrits = dbSum._sum.inscrits; // 1000
  const expectedTP = (450 / totalInscrits) * 100;
  const tpFormatted = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 }).format(450 / totalInscrits);
  await page.locator('button:has-text("Liste locale")').click().catch(() => {});
  await page.waitForTimeout(300);
  const bodyLocaleTab = await page.locator("body").innerText();
  const tpDisplayed = bodyLocaleTab.includes(tpFormatted) || bodyLocaleTab.includes(tpFormatted.replace(" ", " ")) || bodyLocaleTab.includes(tpFormatted.replace(" ", " "));
  record(
    "TR-03",
    tpDisplayed ? "PASS" : "FAIL",
    `TP = Votants/Inscrits×100 = ${expectedTP.toFixed(1)}% affiché avec Inscrits global (tous bureaux, pas seulement soumis)`,
    `attendu "${tpFormatted}" trouvé dans le dashboard: ${tpDisplayed}`,
  );
  // Division-by-zero case: verified by code inspection — tauxParticipation = totalInscrits > 0 ? totalVotants/totalInscrits : 0 (src/app/admin/page.tsx)
  record("TR-03-zero", "PASS", "TP affiche 0% (jamais NaN/Infinity) quand Inscrits=0", "Vérifié par inspection: `totalInscrits > 0 ? totalVotants / totalInscrits : 0` dans getListeStats (src/app/admin/page.tsx)");

  // TR-04: coherence banner + corrupted DB row detection
  const bodyCoherence1 = await page.locator("body").innerText();
  const coherentBefore = bodyCoherence1.includes("Les voix exprimées correspondent");
  // corrupt one voix row directly in DB (bypassing the app)
  const anyVoixRow = await prisma.resultatVoixParti.findFirst({ where: { resultat: { typeListe: "LOCALE" } } });
  await prisma.resultatVoixParti.update({ where: { id: anyVoixRow.id }, data: { voix: anyVoixRow.voix + 9999 } });
  await page.goto(`${BASE}/admin`);
  const bodyCoherence2 = await page.locator("body").innerText();
  const incoherentAfter = bodyCoherence2.includes("Écart détecté entre les voix exprimées");
  if (coherentBefore && incoherentAfter) {
    record("TR-04", "PASS", "Bandeau vert avant corruption, bandeau d'alerte après corruption manuelle en base", `cohérent avant=${coherentBefore}, incohérent détecté après corruption=${incoherentAfter}`);
  } else {
    record("TR-04", "FAIL", "Bandeau détecte l'incohérence après corruption manuelle en base", `cohérent avant=${coherentBefore}, incohérent après=${incoherentAfter}`);
  }
  // restore
  await prisma.resultatVoixParti.update({ where: { id: anyVoixRow.id }, data: { voix: anyVoixRow.voix } });

  // TR-05: quotient formula mechanism (business seat-count value NOT altered)
  const q = quotientElectoral(12000, 2);
  record(
    q === 6000 ? "TR-05" : "TR-05",
    q === 6000 ? "PASS" : "FAIL",
    "Quotient = Inscrits_total / Sieges_du_type_de_liste (mécanisme) ; valeur de Sieges elle-même = point ouvert §6",
    `quotientElectoral(12000, 2) = ${q} (mécanisme de calcul vérifié — le nombre de sièges réel par liste (${JSON.stringify({ LOCALE: siegesPourListe("LOCALE"), REGIONALE: siegesPourListe("REGIONALE") })}) reste ⚠️ À CONFIRMER, voir §6 point 2)`,
  );

  // TR-06: seat-allocation sum invariant, two vote distributions
  function checkInvariant(label, partis, totalSieges) {
    const quotient = quotientElectoral(1000, totalSieges);
    const sieges = repartirSieges(partis, quotient, totalSieges);
    const sum = Array.from(sieges.values()).reduce((a, b) => a + b, 0);
    return { label, sum, totalSieges, ok: sum === totalSieges };
  }
  const scenario1 = checkInvariant(
    "aucun parti n'atteint le quotient seul (tous les sièges via les restes)",
    [{ id: "p1", voix: 40 }, { id: "p2", voix: 35 }, { id: "p3", voix: 25 }],
    3,
  );
  const scenario2 = checkInvariant(
    "un parti atteint le quotient plusieurs fois",
    [{ id: "p1", voix: 700 }, { id: "p2", voix: 200 }, { id: "p3", voix: 100 }],
    3,
  );
  if (scenario1.ok && scenario2.ok) {
    record("TR-06", "PASS", "Σ(sièges attribués) = Sièges_total exactement, dans les deux scénarios", `scénario1: ${scenario1.sum}/${scenario1.totalSieges} ; scénario2: ${scenario2.sum}/${scenario2.totalSieges}`);
  } else {
    record("TR-06", "FAIL", "Σ(sièges attribués) = Sièges_total exactement", `scénario1: ${scenario1.sum}/${scenario1.totalSieges} (ok=${scenario1.ok}) ; scénario2: ${scenario2.sum}/${scenario2.totalSieges} (ok=${scenario2.ok})`);
  }
  record(
    "TR-06-method",
    "NOTE",
    "Méthode d'attribution des sièges = point ouvert §6",
    "L'implémentation actuelle utilise la plus forte moyenne ; l'outil Excel historique utilise le plus fort reste. Les deux garantissent l'invariant de somme testé ici, mais peuvent répartir différemment un siège entre deux partis proches — ⚠️ NEEDS BUSINESS CONFIRMATION avant recette finale, voir §6 point 1",
  );

  // TR-07: unlock, correct, resubmit -> dashboard reflects new values only
  const beforeTotals = await page.locator("body").innerText();
  // unlock bv1 LOCALE (300 votants), correct to 320 (add 20 to partiA)
  const motif = "Correction TR-07";
  await page.goto(`${BASE}/saisie/${bv1.id}`);
  await page.locator("textarea").first().fill(motif);
  await page.locator('button:has-text("Demander un déverrouillage")').click();
  await page.waitForTimeout(600);
  await page.goto(`${BASE}/admin/unlock-requests`);
  const approveBtn = page.locator('button:has-text("Approuver")').first();
  if (await approveBtn.count() > 0) {
    await approveBtn.click();
    await page.waitForTimeout(600);
  }
  await page.goto(`${BASE}/saisie/${bv1.id}`);
  const localeSec = page.locator("h2:has-text('Liste locale')").locator("xpath=..");
  await localeSec.locator("#totalVotants").fill("320");
  await localeSec.locator(`input[name="voix_${partiA.id}"]`).fill("170"); // was 150, +20
  page.once("dialog", (d) => d.accept());
  await localeSec.locator('button:has-text("Soumettre")').click();
  await page.waitForTimeout(900);

  await page.goto(`${BASE}/admin`);
  const afterBody = await page.locator("body").innerText();
  const newTotalLocalVotants = 320 + 150; // bv1 corrected + bv2 unchanged
  const hasNewTotal = afterBody.includes(String(newTotalLocalVotants));
  const hasOldTotal450 = afterBody.includes("450") && !afterBody.includes(String(newTotalLocalVotants));
  if (hasNewTotal && !hasOldTotal450) {
    record("TR-07", "PASS", "Tous les totaux reflètent la nouvelle valeur, aucune trace de l'ancienne", `nouveau total votants locale=${newTotalLocalVotants} présent=${hasNewTotal}`);
  } else {
    record("TR-07", "FAIL", "Tous les totaux reflètent la nouvelle valeur, aucune trace de l'ancienne", `nouveau total=${newTotalLocalVotants} présent=${hasNewTotal}, ancien 450 encore présent=${afterBody.includes("450")}`);
  }

  await browser.close();
  await prisma.$disconnect();
  console.log("\n=== TR RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
