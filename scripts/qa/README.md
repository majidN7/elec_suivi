# Scripts d'exécution du plan de test QA

Scripts Playwright + Prisma qui exécutent contre l'application réelle (serveur
`next dev` démarré, base Postgres migrée) les scénarios du plan de test QA.
Chaque script imprime `[PASS]` / `[FAIL]` / `[NOTE]` par test, puis un JSON
récapitulatif.

Prérequis : `npm run dev` tourne sur `http://localhost:3000`, `DATABASE_URL`
pointe vers une base **jetable** (les scripts suppriment et recréent des
données de test).

```bash
npx tsx -r dotenv/config scripts/qa/seed.mjs              # jeu de données de base (TC-01..04)
npx tsx -r dotenv/config scripts/qa/tc-composite-key.mjs  # TC-01 -> TC-06
npx tsx -r dotenv/config scripts/qa/tn-nominal.mjs        # TN-01 -> TN-06
npx tsx -r dotenv/config scripts/qa/te-edge-cases.mjs     # TE-01 -> TE-15
npx tsx -r dotenv/config scripts/qa/tr-regression.mjs     # TR-01 -> TR-07 (réinitialise la base sur un jeu déterministe)
```

`tr-regression.mjs` vide entièrement la base (bureaux, partis, résultats)
pour repartir d'un jeu de données déterministe : à lancer en dernier, ou dans
une base dédiée.
