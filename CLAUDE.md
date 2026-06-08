# CRM2 — Instructions pour Claude

## Contexte du projet

Application CRM full-stack : Next.js 15 + PostgreSQL + NextAuth.js + Tailwind CSS.
Migration Zustand → Prisma + API routes terminée. Déploiement Hostinger opérationnel via Docker, Traefik et GitHub Actions.

## Stack technique retenue

- **Base de données :** PostgreSQL dans Docker (sur VPS Hostinger)
- **ORM :** Prisma 5.22.0 (pas Prisma 7 — breaking changes incompatibles)
- **Auth :** NextAuth.js v4.24.14 (credentials provider, JWT, bcryptjs)
- **DB UI :** Adminer (container Docker léger)
- **Pas de Supabase** — décision prise pour éviter les coûts de licence
- **Hébergement :** VPS Hostinger (Docker + Traefik existants)
- **CI/CD :** GitHub → GitHub Actions → SSH → `git pull` + rebuild Docker + redémarrage du container CRM

## État d'avancement

### ✅ Étape 1 — Base de données + Auth (terminé)
- Prisma 5.22.0 installé, schéma complet (contacts, products, deals, deal_lines, invoices, invoice_lines, quotes, quote_lines, users)
- PostgreSQL sur Hostinger utilisé en local via SSH tunnel (`ssh -L 5432:localhost:5432 root@72.61.197.14 -N -f`)
- Tous les stores Zustand remplacés par API routes Next.js + Prisma
- NextAuth.js installé, page login, middleware de protection des routes
- Seed exécuté : admin robin@duale.fr / admin123, 10 contacts, 7 produits, 10 deals, 6 factures

### ✅ Étape 2 — GitHub (terminé)
- Repo : https://github.com/RobinDuale/CRM-Studeria
- `.env.local` et `.env.production` dans `.gitignore`
- `.env` (non-sensible) committé

### ✅ Étape 3 — GitHub Actions (terminé)
- Fichier `.github/workflows/deploy.yml` créé, committé et poussé
- Secrets GitHub Actions configurés :
  - `SSH_HOST` = 72.61.197.14
  - `SSH_USER` = root
  - `SSH_KEY` = clé SSH privée locale autorisée sur le serveur
- Dernier déploiement GitHub Actions réussi après relance du run `27132131095`

### ✅ Étape 4 — Déploiement Hostinger (terminé)
- docker-compose.yml sur le serveur mis à jour avec services `postgres`, `adminer`, `crm`
- `/root/crm/.env.production.local` créé sur le serveur (non committé)
- **Dernier commit technique de déploiement** : `ed43b49` — skip deploy migrations when none exist
- Build Docker serveur réussi et container CRM démarré
- CRM : https://crmstud.duale.fr
- Vérification HTTP publique : `https://crmstud.duale.fr` répond `200 OK` et sert la page de login
- Adminer : adminer.srv1161197.hstgr.cloud

## Historique des erreurs Docker corrigées
1. ~~Sidebar importait `@/lib/supabase/client`~~ → remplacé par NextAuth `signOut`
2. ~~`QuoteLine` importé depuis `@prisma/client` (pas encore généré au build)~~ → remplacé par `@/lib/types`
3. ~~`/app/public` not found~~ → dossier `public/.gitkeep` créé et committé
4. ~~`prisma generate` manquant dans le Dockerfile~~ → ajouté (`RUN pnpm prisma generate` avant `RUN pnpm build`)
5. ~~Prisma ne trouvait pas OpenSSL dans l'image Alpine~~ → ajouté `RUN apk add --no-cache openssl`
6. ~~`npx prisma migrate deploy` installait Prisma 7 et ne trouvait pas `prisma/schema.prisma` dans le container runtime~~ → dossier `prisma` copié dans l'image finale et commande pinée sur `prisma@5.22.0`
7. ~~`migrate deploy` échouait car aucun dossier `prisma/migrations` n'existe et la base n'est pas vide~~ → étape de migration rendue conditionnelle dans GitHub Actions

## Architecture des pages (pattern Server → Client)

Chaque page dashboard suit ce pattern :
- `page.tsx` : Server Component, `export const dynamic = "force-dynamic"`, fetch Prisma, `JSON.parse(JSON.stringify(rows))` pour sérialiser les dates, passe les données au client
- `*-client.tsx` : Client Component (`"use client"`), gère l'UI et les appels API fetch

## Fichiers clés

- `src/lib/types.ts` : types TypeScript partagés (Contact, Product, Deal, Invoice, Quote, etc.)
- `src/lib/prisma.ts` : singleton PrismaClient
- `src/lib/auth.ts` : config NextAuth (credentials provider + JWT callbacks)
- `src/middleware.ts` : protection des routes via NextAuth middleware
- `src/types/next-auth.d.ts` : augmentation des types Session et JWT pour inclure `user.id`
- `prisma/schema.prisma` : schéma Prisma 5 avec `url = env("DATABASE_URL")`
- `prisma/seed.ts` : seed idempotent avec `upsert`
- `Dockerfile` : multi-stage build, installe OpenSSL, inclut `pnpm prisma generate` avant `pnpm build`, copie `public`, `prisma`, `.next/standalone` et `.next/static` dans l'image runtime
- `.github/workflows/deploy.yml` : CI/CD GitHub Actions → SSH → `git pull` → `docker compose build crm` → `docker compose up -d crm` → migrations Prisma conditionnelles

## Serveur Hostinger

- IP : 72.61.197.14
- User : root
- Hostname : srv1161197.hstgr.cloud
- n8n tourne sur : n8n.srv1161197.hstgr.cloud
- OS : Ubuntu 24.04, Docker installé, Traefik actif
- Connexion SSH via Python paramiko (sshpass non disponible)
- docker-compose.yml principal : `/root/docker-compose.yml`
- Code CRM : `/root/crm/`
- Env prod : `/root/crm/.env.production.local`
- URL CRM : https://crmstud.duale.fr
- DNS CRM : `crmstud.duale.fr` pointe vers `72.61.197.14`
- **Documentation complète du serveur** : https://app.notion.com/p/3795b86a8bb4804d978acc47e3ccbb42

## Règles de développement

- `@prisma/client` n'exporte pas les types de modèles avant `prisma generate` → importer depuis `@/lib/types` à la place
- `export const dynamic = "force-dynamic"` obligatoire sur toutes les pages dashboard (sinon Next.js essaie de les pré-rendre statiquement et plante)
- Prisma 7 cassé (url non supportée dans schema.prisma) → rester sur Prisma 5.22.0
- Auth bypassée pour dev local : `src/middleware.ts` avec NextAuth middleware (pas de bypass manuel)
- PDF : ne pas utiliser `toLocaleString("fr-FR")` → utiliser `fmt()` dans `src/lib/pdf.ts`
- Redémarrer le serveur : Bash tool avec `run_in_background: true`, ne pas ouvrir une nouvelle fenêtre PowerShell
- SSH tunnel pour dev local contre la DB Hostinger : `ssh -L 5432:localhost:5432 root@72.61.197.14 -N -f`

## Commandes utiles

```powershell
# Démarrer le serveur de dev
pnpm dev

# Build local
pnpm build

# Build Docker local
docker build -t crm2-local .

# Vider le cache Next.js
Remove-Item -Recurse -Force .next

# SSH tunnel vers la DB Hostinger (pour prisma db push / seed en local)
ssh -L 5432:localhost:5432 root@72.61.197.14 -N -f

# Seed de la base
pnpm prisma db push
pnpm seed
```

```python
# Rebuild sur Hostinger
# cd /root/crm && git pull origin main
# cd /root && docker compose build crm > /tmp/crm_build.log 2>&1
# docker compose up -d crm
# if [ -d /root/crm/prisma/migrations ] && [ "$(ls -A /root/crm/prisma/migrations)" ]; then docker compose exec -T crm npx prisma@5.22.0 migrate deploy --schema=prisma/schema.prisma; fi
```
