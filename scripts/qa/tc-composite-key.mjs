import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BASE = "http://localhost:3000";
const results = [];

function record(id, status, expected, actual, note = "") {
  results.push({ id, status, expected, actual, note });
  console.log(`[${status}] ${id} — ${note || actual}`);
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
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page, "qa-admin@test.local", "TestPass123!");
  console.log("Logged in as admin. URL:", page.url());

  // fetch seeded ids
  const bvDakhla1 = await prisma.bureauVote.findUnique({ where: { commune_numero: { commune: "Dakhla", numero: "1" } } });
  const bvMijik1 = await prisma.bureauVote.findUnique({ where: { commune_numero: { commune: "Mijik", numero: "1" } } });
  const lieu = await prisma.lieuDeVote.findFirst();

  // ---------- TC-01 ----------
  if (bvDakhla1 && bvMijik1 && bvDakhla1.id !== bvMijik1.id) {
    record("TC-01", "PASS", "2 enregistrements distincts", `Dakhla#1 id=${bvDakhla1.id}, Mijik#1 id=${bvMijik1.id}`);
  } else {
    record("TC-01", "FAIL", "2 enregistrements distincts", "bureaux manquants ou identiques");
  }

  // ---------- TC-02: duplicate creation ----------
  await page.goto(`${BASE}/admin/bureaux/new`);
  await page.fill("#numero", "1");
  await page.fill("#commune", "Dakhla");
  await page.fill("#nom", "Bureau Duplicate Test");
  await page.selectOption("#lieuDeVoteId", lieu.id);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(800);
  const errText = await page.locator("text=Un bureau avec ce numéro existe déjà dans cette commune").count();
  if (errText > 0) {
    record("TC-02", "PASS", "Erreur explicite, création refusée", "Message d'erreur affiché, pas de redirection");
  } else {
    record("TC-02", "FAIL", "Erreur explicite, création refusée", `Message non trouvé. URL actuelle: ${page.url()}`);
  }
  const countAfterDup = await prisma.bureauVote.count({ where: { commune: "Dakhla", numero: "1" } });
  if (countAfterDup !== 1) {
    record("TC-02-db", "FAIL", "1 seul enregistrement (Dakhla,1) en base", `${countAfterDup} trouvés`);
  }

  // TC-02 bis: rename collision on update
  const bvDakhla2 = await prisma.bureauVote.findUnique({ where: { commune_numero: { commune: "Dakhla", numero: "2" } } });
  await page.goto(`${BASE}/admin/bureaux/${bvDakhla2.id}`);
  await page.fill("#numero", "1"); // try renaming Dakhla#2 to Dakhla#1 (collision)
  await page.click('button[type="submit"]');
  await page.waitForTimeout(800);
  const errTextUpd = await page.locator("text=Un bureau avec ce numéro existe déjà dans cette commune").count();
  if (errTextUpd > 0) {
    record("TC-02-update", "PASS", "Renommage vers couple déjà pris refusé", "Message d'erreur affiché en modification");
  } else {
    record("TC-02-update", "FAIL", "Renommage vers couple déjà pris refusé", `URL actuelle: ${page.url()}`);
  }
  // restore original numero for bvDakhla2 in case it got saved incorrectly (defensive, shouldn't have happened)
  const check2 = await prisma.bureauVote.findUnique({ where: { id: bvDakhla2.id } });
  if (check2.numero !== "2") {
    console.log("WARNING: bvDakhla2 numero changed unexpectedly:", check2.numero);
  }

  // ---------- TC-03: isolation between homonymous bureaux ----------
  const partiA = await prisma.partiPolitique.findUnique({ where: { code: "PARTI-A" } });
  const partiB = await prisma.partiPolitique.findUnique({ where: { code: "PARTI-B" } });

  async function submitLocal(bureauId, totalVotants, votesRejetes, voixA, voixB) {
    const existingCheck = await prisma.resultat.findUnique({
      where: { bureauVoteId_typeListe: { bureauVoteId: bureauId, typeListe: "LOCALE" } },
    });
    if (existingCheck?.statut === "SOUMIS") {
      console.log(`submitLocal: ${bureauId} already SOUMIS, skipping UI submission (idempotent rerun)`);
      return;
    }
    await page.goto(`${BASE}/saisie/${bureauId}`);
    // Locale card is first ListeResultatCard on the page
    const localeSection = page.locator("h2:has-text('Liste locale')").locator("xpath=..");
    await localeSection.locator("#totalVotants").fill(String(totalVotants));
    await localeSection.locator("#votesRejetes").fill(String(votesRejetes));
    await localeSection.locator(`input[name="voix_${partiA.id}"]`).fill(String(voixA));
    await localeSection.locator(`input[name="voix_${partiB.id}"]`).fill(String(voixB));
    page.once("dialog", (d) => d.accept());
    await localeSection.locator('button:has-text("Soumettre")').click();
    await page.waitForTimeout(900);
  }

  await submitLocal(bvDakhla1.id, 300, 10, 150, 140); // 150+140+10=300
  await submitLocal(bvMijik1.id, 80, 0, 40, 40); // 40+40+0=80

  const rDakhla1 = await prisma.resultat.findUnique({ where: { bureauVoteId_typeListe: { bureauVoteId: bvDakhla1.id, typeListe: "LOCALE" } } });
  const rMijik1 = await prisma.resultat.findUnique({ where: { bureauVoteId_typeListe: { bureauVoteId: bvMijik1.id, typeListe: "LOCALE" } } });

  if (rDakhla1?.statut === "SOUMIS" && rDakhla1.totalVotants === 300 && rMijik1?.statut === "SOUMIS" && rMijik1.totalVotants === 80 && rDakhla1.bureauVoteId !== rMijik1.bureauVoteId) {
    record("TC-03", "PASS", "Chaque résultat rattaché au bon bureauVoteId, agrégat 380", `Dakhla=300, Mijik=80, total=${rDakhla1.totalVotants + rMijik1.totalVotants}`);
  } else {
    record("TC-03", "FAIL", "Chaque résultat rattaché au bon bureauVoteId, agrégat 380", JSON.stringify({ rDakhla1, rMijik1 }));
  }

  // ---------- TC-04: search behavior ----------
  await page.goto(`${BASE}/saisie?q=1`);
  const rowsCount1 = await page.locator("tbody tr").count();
  if (rowsCount1 === 2) {
    record("TC-04a", "PASS", "2 bureaux (numéro seul non discriminant)", `${rowsCount1} lignes`);
  } else {
    record("TC-04a", "FAIL", "2 bureaux (numéro seul non discriminant)", `${rowsCount1} lignes`);
  }

  await page.goto(`${BASE}/saisie?${new URLSearchParams({ q: "1 - Dakhla" })}`);
  const rowsDakhla = await page.locator("tbody tr").count();
  const rowsDakhlaText = await page.locator("tbody tr").allTextContents();
  if (rowsDakhla === 1 && rowsDakhlaText[0]?.includes("Dakhla")) {
    record("TC-04b", "PASS", "1 seul bureau (Dakhla)", rowsDakhlaText[0]);
  } else {
    record("TC-04b", "FAIL", "1 seul bureau (Dakhla)", `${rowsDakhla} lignes: ${JSON.stringify(rowsDakhlaText)}`);
  }

  await page.goto(`${BASE}/saisie?${new URLSearchParams({ q: "1 - Mijik" })}`);
  const rowsMijik = await page.locator("tbody tr").count();
  const rowsMijikText = await page.locator("tbody tr").allTextContents();
  if (rowsMijik === 1 && rowsMijikText[0]?.includes("Mijik")) {
    record("TC-04c", "PASS", "1 seul bureau (Mijik)", rowsMijikText[0]);
  } else {
    record("TC-04c", "FAIL", "1 seul bureau (Mijik)", `${rowsMijik} lignes: ${JSON.stringify(rowsMijikText)}`);
  }

  // ---------- TC-05 / TC-06: bulk CSV import upsert ----------
  const communes = ["CommuneA", "CommuneB", "CommuneC", "CommuneD", "CommuneE"];
  const numeros = Array.from({ length: 11 }, (_, i) => String(i + 1));
  function buildCsv(inscritsBase) {
    const header = "numero,commune,nom,lieuDeVoteCode,lieuDeVoteNom,inscrits";
    const rows = [];
    let idx = 0;
    for (const commune of communes) {
      for (const numero of numeros) {
        idx++;
        rows.push(`${numero},${commune},Bureau CSV ${commune} ${numero},LV-QA-CSV,Lieu QA CSV,${inscritsBase + idx}`);
      }
    }
    return [header, ...rows].join("\n");
  }

  const csvPath1 = path.join(os.tmpdir(), "qa_tc05.csv");
  fs.writeFileSync(csvPath1, buildCsv(100));

  await page.goto(`${BASE}/admin/import`);
  const bureauForm = page.locator("form").first();
  await bureauForm.locator('input[type="file"]').setInputFiles(csvPath1);
  await bureauForm.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);
  const importedText = await page.locator("text=lignes importées avec succès").first().textContent().catch(() => null);

  const csvBureauxCount = await prisma.bureauVote.count({ where: { commune: { in: communes } } });
  const dupCheck = await prisma.$queryRawUnsafe(
    `SELECT commune, numero, COUNT(*) as cnt FROM bureaux_de_vote WHERE commune = ANY($1) GROUP BY commune, numero HAVING COUNT(*) > 1`,
    communes,
  );
  if (csvBureauxCount === 55 && dupCheck.length === 0) {
    record("TC-05", "PASS", "55 bureaux créés, aucun doublon (commune,numero)", `${csvBureauxCount} bureaux, ${dupCheck.length} doublons — UI: ${importedText}`);
  } else {
    record("TC-05", "FAIL", "55 bureaux créés, aucun doublon (commune,numero)", `${csvBureauxCount} bureaux, ${dupCheck.length} doublons — UI: ${importedText}`);
  }

  // TC-06: re-import same identities with modified inscrits
  const csvPath2 = path.join(os.tmpdir(), "qa_tc06.csv");
  fs.writeFileSync(csvPath2, buildCsv(900)); // different inscrits values, same (commune, numero) identities

  await page.goto(`${BASE}/admin/import`);
  const bureauForm2 = page.locator("form").first();
  await bureauForm2.locator('input[type="file"]').setInputFiles(csvPath2);
  await bureauForm2.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);

  const csvBureauxCountAfter = await prisma.bureauVote.count({ where: { commune: { in: communes } } });
  const sampleUpdated = await prisma.bureauVote.findUnique({ where: { commune_numero: { commune: "CommuneA", numero: "1" } } });
  if (csvBureauxCountAfter === 55 && sampleUpdated?.inscrits === 901) {
    record("TC-06", "PASS", "55 enregistrements mis à jour, pas dupliqués, inscrits pris en compte", `count=${csvBureauxCountAfter}, CommuneA-1 inscrits=${sampleUpdated?.inscrits}`);
  } else {
    record("TC-06", "FAIL", "55 enregistrements mis à jour, pas dupliqués, inscrits pris en compte", `count=${csvBureauxCountAfter}, CommuneA-1 inscrits=${sampleUpdated?.inscrits}`);
  }

  await browser.close();
  await prisma.$disconnect();
  console.log("\n=== RESULTS SO FAR ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
