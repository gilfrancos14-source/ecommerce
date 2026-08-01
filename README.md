# LUXE — E-commerce

Application e-commerce full-stack de vêtements et accessoires premium.

## Description du projet

LUXE est une boutique en ligne complète qui permet à un visiteur de parcourir un catalogue de produits (avec variantes : couleurs, tailles), de les ajouter à son panier et à sa liste de souhaits, puis de passer commande et payer en ligne via Stripe.

Le projet se compose de deux applications :

- **`client/`** — une application React (SPA) qui gère l'interface utilisateur : pages publiques (accueil, catalogue, fiches produit), pages client (panier, commandes, compte) et un espace d'administration.
- **`server/`** — une API REST Express qui expose les données et la logique métier : authentification, produits, panier, commandes, paiements, avis, administration. Les données sont stockées dans PostgreSQL via Prisma.

L'application est pensée pour être exploitable de bout en bout : de l'inscription d'un client jusqu'à la livraison de sa commande, avec un tableau de bord pour l'administrateur.

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

## Comment ça fonctionne

### Parcours client

1. **Navigation** — un visiteur consulte le catalogue (`/products`), les catégories et les fiches produit. Les images sont servies depuis Cloudinary.
2. **Panier** — il ajoute des produits (ou des variantes) à son panier. Le panier est stocké en base et lié au compte utilisateur.
3. **Commande** — le client renseigne son adresse de livraison, choisit un mode de livraison (la livraison devient gratuite au-delà d'un seuil), puis arrive sur le paiement.
4. **Paiement Stripe** — le serveur calcule le total et crée un `PaymentIntent` Stripe (`POST /api/payments/create-intent`). Le client le confirme avec Stripe Elements. La commande n'est créée qu'après confirmation du paiement.
5. **Confirmation du paiement** — le serveur vérifie le statut du `PaymentIntent` à la création de la commande, et un webhook (`POST /api/payments/webhook`) confirme le règlement et passe la commande en `CONFIRMED`.
6. **Suivi de commande** — l'administrateur peut expédier puis livrer la commande. Chaque changement de statut (confirmation, expédition, livraison) déclenche un email transactionnel Brevo au client.
7. **Emails** — Brevo envoie : confirmation de commande, notification d'expédition, notification de livraison et code de réinitialisation de mot de passe.

### Parcours administrateur

L'espace admin (`/admin`, réservé aux comptes avec le rôle `ADMIN`) permet de :

- suivre les statistiques (ventes, chiffre d'affaires, alertes de stock) via un dashboard Recharts
- gérer les produits, leurs variantes et les catégories (avec upload d'images via Cloudinary)
- gérer les commandes : changement de statut, expédition (numéro de suivi, transporteur), livraison
- gérer les utilisateurs (attribution du rôle) et les modes de livraison

### Flux d'authentification

- **Inscription / connexion** : le serveur génère un JWT stocké dans un **cookie httpOnly** (sécurisé en production) — le token n'est jamais exposé au JavaScript.
- **Google OAuth** : connexion via Google OAuth 2.0 (routes `/api/auth/google`).
- **Mot de passe oublié** : l'utilisateur reçoit un code à 6 chiffres par email (Brevo), le vérifie, puis obtient un token de réinitialisation temporaire pour définir un nouveau mot de passe.

### Structure d'un appel API

Le client appelle le serveur via une instance axios (`client/src/utils/api.js`) qui inclut automatiquement les cookies. Le serveur valide chaque requête avec **Zod**, protège les routes avec un middleware JWT (`protect`), et limite le débit (`express-rate-limit`) pour prévenir les abus. Les erreurs sont normalisées par un handler central (`server/src/middleware/errorHandler.js`).

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
