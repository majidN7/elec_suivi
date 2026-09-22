import {
  quotientElectoral,
  siegesPourListe,
  calculerCoherenceVoix,
} from "../../src/lib/seats.ts";

const results = [];
function record(id, status, expected, actual) {
  results.push({ id, status, expected, actual });
  console.log(`[${status}] ${id} — ${actual}`);
}

// ---------- Test 1: voix exprimées / cohérence conforme ----------
{
  const votants = 100;
  const bulletinsNuls = 10;
  const voixPartis = [25, 25, 20, 15, 5];
  const sommeVoixPartis = voixPartis.reduce((a, b) => a + b, 0);
  const { votesExprimes, conforme, ecart } = calculerCoherenceVoix(
    votants,
    bulletinsNuls,
    sommeVoixPartis,
  );
  const ok = votesExprimes === 90 && sommeVoixPartis === 90 && conforme === true && ecart === 0;
  record(
    "Test 1",
    ok ? "PASS" : "FAIL",
    "VE=90, Σ partis=90, Conforme=true",
    `VE=${votesExprimes}, Σ partis=${sommeVoixPartis}, Conforme=${conforme}, Écart=${ecart}`,
  );
}

// ---------- Test 2: cohérence non conforme, écart calculé ----------
{
  const votants = 100;
  const bulletinsNuls = 10;
  const sommeVoixPartis = 85;
  const { votesExprimes, conforme, ecart } = calculerCoherenceVoix(
    votants,
    bulletinsNuls,
    sommeVoixPartis,
  );
  const ok = votesExprimes === 90 && sommeVoixPartis === 85 && conforme === false && ecart === 5;
  record(
    "Test 2",
    ok ? "PASS" : "FAIL",
    "VE=90, Σ partis=85, Conforme=false, Écart=5",
    `VE=${votesExprimes}, Σ partis=${sommeVoixPartis}, Conforme=${conforme}, Écart=${ecart}`,
  );
}

// ---------- Test 3: quotient liste locale (2 sièges) ----------
{
  const inscrits = 60281;
  const sieges = siegesPourListe("LOCALE");
  const q = quotientElectoral(inscrits, sieges);
  const attendu = inscrits / 2;
  const ok = sieges === 2 && q === attendu;
  record(
    "Test 3",
    ok ? "PASS" : "FAIL",
    `Sièges locale=2, Q=${attendu}`,
    `Sièges locale=${sieges}, Q=${q}`,
  );
}

// ---------- Test 4: quotient liste régionale (3 sièges) ----------
{
  const inscrits = 60281;
  const sieges = siegesPourListe("REGIONALE");
  const q = quotientElectoral(inscrits, sieges);
  const attendu = inscrits / 3;
  const ok = sieges === 3 && q === attendu;
  record(
    "Test 4",
    ok ? "PASS" : "FAIL",
    `Sièges régionale=3, Q≈${attendu.toFixed(2)}`,
    `Sièges régionale=${sieges}, Q=${q}`,
  );
}

// ---------- Extra: validations de cohérence (bornes) ----------
{
  const cas = [
    { votants: 0, nuls: 0, sommeVoixPartis: 0, label: "tout à zéro" },
    { votants: 50, nuls: 50, sommeVoixPartis: 0, label: "bulletins nuls = votants" },
  ];
  let allOk = true;
  const details = [];
  for (const c of cas) {
    const { votesExprimes, conforme } = calculerCoherenceVoix(c.votants, c.nuls, c.sommeVoixPartis);
    const expectedVE = c.votants - c.nuls;
    const okCas = votesExprimes === expectedVE && conforme === (expectedVE === c.sommeVoixPartis);
    allOk = allOk && okCas;
    details.push(`${c.label}: VE=${votesExprimes} conforme=${conforme}`);
  }
  record("Test 5 (bornes)", allOk ? "PASS" : "FAIL", "VE et conforme corrects sur cas limites", details.join(" ; "));
}

const failed = results.filter((r) => r.status === "FAIL");
console.log(`\n=== ${results.length - failed.length}/${results.length} tests passés ===`);
if (failed.length > 0) {
  console.log("ÉCHECS:", JSON.stringify(failed, null, 2));
  process.exit(1);
}
