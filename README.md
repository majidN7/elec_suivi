# Suivi Électoral

Application web de saisie et de gestion des résultats électoraux (Next.js, PostgreSQL, Prisma).

## Fonctionnalités

- Hiérarchie **Lieu de vote → Bureaux de vote**.
- Saisie par bureau, **séparément pour la liste locale et la liste régionale** : total des votants, votes rejetés, voix par parti pour chaque liste, avec contrôle automatique (total = somme des voix + rejetés) propre à chaque liste.
- Verrouillage automatique d'un résultat soumis ; chaque liste (locale/régionale) d'un bureau se verrouille et se déverrouille indépendamment, après approbation d'une demande de déverrouillage par un administrateur national.
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

## Docker

L'application et PostgreSQL peuvent être lancés entièrement dans des conteneurs via Docker Compose.

```bash
cp .env.example .env
# renseigner au minimum NEXTAUTH_SECRET, POSTGRES_PASSWORD et SEED_ADMIN_PASSWORD dans .env
docker compose up --build
```

Au démarrage, le conteneur `app` applique automatiquement les migrations (`prisma migrate deploy`) puis crée le compte Administrateur national s'il n'existe pas encore (`prisma db seed`). L'application est ensuite accessible sur http://localhost:3000.

- `docker compose up -d --build` — démarrer en arrière-plan
- `docker compose logs -f app` — suivre les journaux de l'application
- `docker compose down` — arrêter les conteneurs (les données PostgreSQL sont conservées dans le volume `db_data`)
- `docker compose down -v` — arrêter et supprimer aussi les données PostgreSQL

Variables d'environnement lues par `docker-compose.yml` (à définir dans `.env`) :

| Variable | Rôle | Défaut |
|---|---|---|
| `POSTGRES_PASSWORD` | Mot de passe de la base PostgreSQL | `elec_app_dev_pw` |
| `NEXTAUTH_SECRET` | Secret de signature des sessions (**obligatoire**, `openssl rand -base64 32`) | — |
| `NEXTAUTH_URL` | URL publique de l'application | `http://localhost:3000` |
| `SEED_ADMIN_EMAIL` | E-mail du compte Administrateur national créé au démarrage | `admin@elec-suivi.local` |
| `SEED_ADMIN_PASSWORD` | Mot de passe initial de ce compte (à changer après la première connexion) | `ChangeMe123!` |

Pour un déploiement en production, changez impérativement `NEXTAUTH_SECRET`, `POSTGRES_PASSWORD` et `SEED_ADMIN_PASSWORD`, et envisagez de retirer l'exposition du port `5432` dans `docker-compose.yml` si PostgreSQL n'a pas besoin d'être accessible depuis l'hôte.
