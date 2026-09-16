# Suivi Électoral

Application web de saisie et de gestion des résultats électoraux (Next.js, PostgreSQL, Prisma).

## Fonctionnalités

- Hiérarchie **Lieu de vote → Bureaux de vote**.
- Saisie par bureau : total des votants, votes rejetés, voix par parti, avec contrôle automatique (total = somme des voix + rejetés).
- Verrouillage automatique d'un résultat soumis ; correction possible uniquement après approbation d'une demande de déverrouillage par un administrateur national.
- Référentiels (bureaux, partis) gérables manuellement ou par import CSV/Excel en masse, avec modèle téléchargeable.
- Gestion des utilisateurs et des rôles : **Administrateur national** et **Agent de saisie** (assigné à un ou plusieurs bureaux).
- Journal d'audit de toutes les actions sensibles.
- Tableau de bord national agrégé (voix par parti, taux de participation, progression de la saisie).
- Interface bilingue français / arabe (avec support RTL).

## Prérequis

- Node.js 20+
- PostgreSQL 14+

## Installation

```bash
npm install
cp .env.example .env
# renseigner DATABASE_URL et NEXTAUTH_SECRET dans .env
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Le seed crée un compte **Administrateur national** :
- e-mail : `SEED_ADMIN_EMAIL` (par défaut `admin@elec-suivi.local`)
- mot de passe : `SEED_ADMIN_PASSWORD` (par défaut `ChangeMe123!`, à changer immédiatement après la première connexion)

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — démarrage en production
- `npx prisma migrate dev` — nouvelle migration en développement
- `npx prisma db seed` — (re)créer le compte administrateur national
