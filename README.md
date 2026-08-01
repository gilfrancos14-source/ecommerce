# LUXE — E-commerce

Application e-commerce full-stack de vêtements et accessoires premium.

## Architecture

```
ecommerce/
├── client/          # Frontend React + Vite + Tailwind CSS
└── server/          # Backend Node.js + Express + Prisma + PostgreSQL
```

### Stack technique

| Côté | Technologies |
|------|--------------|
| Frontend | React 19, React Router 6, Vite 8, Tailwind CSS 4, Stripe, Recharts |
| Backend | Node.js, Express 4, Prisma, PostgreSQL (Neon), Stripe, Zod |
| Services externes | Brevo (emails), Cloudinary (images), Google OAuth |

### Fonctionnalités

- Authentification : inscription, connexion, JWT (cookie httpOnly), Google OAuth
- Réinitialisation de mot de passe par email (code à 6 chiffres)
- Catalogue produits avec variantes (couleurs, tailles), catégories
- Panier, liste de souhaits, avis clients
- Commande avec modes de livraison et paiement Stripe
- Suivi de commande (statuts : PENDING → CONFIRMED → SHIPPED → DELIVERED)
- Emails transactionnels Brevo (confirmation commande, expédition, livraison)
- Espace admin (dashboard, produits, commandes, utilisateurs, catégories, livraison)

## Prérequis

- Node.js ≥ 20
- npm
- Une base de données PostgreSQL (Neon, Supabase ou locale)
- Un compte Stripe (test ou live)
- Un compte Brevo pour l'envoi d'emails

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone https://github.com/gilfrancos14-source/ecommerce.git
cd ecommerce
```

Installer les dépendances du serveur :

```bash
cd server
npm install
```

Puis celles du client (dans un autre terminal ou en revenant à la racine) :

```bash
cd ../client
npm install
```

### 2. Configurer le serveur

Depuis le dossier `server/`, copier `.env.example` vers `.env` et renseigner les valeurs :

Variables requises :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL (Prisma) |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (sk_test_... ou sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe (whsec_...) |
| `CLIENT_URL` | URL du frontend (ex: `http://localhost:5173`) |

Variables optionnelles :

| Variable | Description |
|----------|-------------|
| `BREVO_API_KEY` | Clé API Brevo (envoi d'emails transactionnels) |
| `BREVO_FROM_EMAIL` | Adresse expéditrice des emails |
| `BREVO_FROM_NAME` | Nom de l'expéditeur |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Hébergement des images produits |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Connexion Google OAuth |
| `PORT` | Port du serveur (défaut : 5000) |

### 3. Configurer le client

Créer `client/.env` avec la clé publique Stripe :

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Migrations et données de test

Depuis le dossier `server/` :

```bash
npx prisma migrate deploy   # appliquer les migrations en base
npx prisma generate         # générer le client Prisma
npm run prisma:seed         # (optionnel) insérer des données de démonstration
```

## Lancer le projet

Il faut **deux terminaux séparés** : un pour le serveur, un pour le client. Lancez toujours le serveur en premier.

### Terminal 1 — Serveur API

```bash
cd server
npm run dev        # démarre avec nodemon sur http://localhost:5000
```

### Terminal 2 — Client

```bash
cd client
npm run dev        # démarre Vite sur http://localhost:5173
```

L'API est disponible sur `http://localhost:5000/api`. Le healthcheck : `GET /api/health`.

## Scripts

### Serveur (`server/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage en développement (nodemon) |
| `npm start` | Démarrage en production |
| `npm test` | Lancer les tests Jest |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Appliquer les migrations en développement |
| `npm run prisma:seed` | Insérer les données de démonstration |

### Client (`client/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production |
| `npm run lint` | Vérification du code (oxlint) |
| `npm run preview` | Prévisualiser le build de production |

## API — Aperçu des routes

Toutes les routes sont préfixées par `/api`.

| Module | Routes |
|--------|--------|
| Auth | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/profile`, `/auth/forgot-password`, `/auth/verify-reset-code`, `/auth/reset-password`, `/auth/change-password` |
| Google OAuth | `/auth/google`, `/auth/google/callback` |
| Utilisateurs | `/users/:id` |
| Produits | `/products`, `/products/featured`, `/products/:slug` |
| Catégories | `/categories` |
| Variantes | `/variants/product/:productId` |
| Panier | `/cart` |
| Commandes | `/orders` |
| Paiement | `/payments/create-intent`, `/payments/webhook` (POST, webhook Stripe) |
| Avis | `/products/:productId/reviews` |
| Wishlist | `/wishlist` |
| Newsletter | `/newsletter` |
| Livraison | `/delivery-methods` |
| Admin | `/admin` |

## Tests

```bash
cd server
npm test
```

Les tests couvrent l'API : healthcheck, authentification (inscription, connexion, protection des routes, reset de mot de passe), produits, catégories et gestion des 404.

## Déploiement

- **API** : un service Node.js (Render, Railway, Fly.io...) avec `npm start` et les variables d'environnement configurées.
- **Frontend** : build statique via `npm run build` (Vercel, Netlify...), avec `CLIENT_URL` pointant vers le domaine de l'API.
- En production, définir `NODE_ENV=production` (cookies sécurisés activés).

## Licence

ISC
