# CRM2 — Instructions pour Claude

## Contexte du projet

Application CRM full-stack : Next.js 15 + PostgreSQL + NextAuth.js + Tailwind CSS.
Développement local terminé (Phases 1–4 complètes avec mock data Zustand).

## Stack technique retenue

- **Base de données :** PostgreSQL dans Docker (sur VPS Hostinger)
- **ORM :** Prisma
- **Auth :** NextAuth.js (sessions stockées en PostgreSQL)
- **DB UI :** Adminer (container Docker léger)
- **Pas de Supabase** — décision prise pour éviter les coûts de licence
- **Hébergement :** VPS Hostinger (Docker + Traefik existants)
- **CI/CD :** GitHub → GitHub Actions → SSH → rebuild Docker

## État d'avancement

### ✅ Terminé
- Phase 1 : Contacts CRUD
- Phase 2 : Products CRUD
- Phase 3 : Pipeline kanban drag & drop (@dnd-kit)
- Phase 4 : Facturation — devis + factures + PDF (jsPDF)
- Dashboard + Analytics avec données live des stores Zustand

### Roadmap dans l'ordre

**Étape 1 — Base de données + Auth (à faire en local d'abord)**
- Installer Prisma, définir le schéma (contacts, products, deals, deal_lines, invoices, invoice_lines, quotes, quote_lines)
- Lancer PostgreSQL en Docker local pour les tests
- Remplacer les stores Zustand par des API routes Next.js + Prisma
- Installer NextAuth.js, créer page login, protéger les routes (middleware)

**Étape 2 — GitHub**
- Créer repo GitHub (public OK, `.env.local` dans `.gitignore`)
- Pusher le code

**Étape 3 — GitHub Actions**
- `.github/workflows/deploy.yml` : push sur `main` → SSH → rebuild Docker → restart CRM
- Secrets : SSH_HOST, SSH_USER, SSH_KEY

**Étape 4 — Déploiement Hostinger**
- Ajouter dans `/root/docker-compose.yml` : services `postgres`, `adminer`, `crm`
- CRM : crmstud.duale.fr
- Adminer : adminer.srv1161197.hstgr.cloud
- Traefik gère SSL automatiquement
- Cron de sauvegarde PostgreSQL

## Serveur Hostinger

- IP : 72.61.197.14
- User : root
- Hostname : srv1161197.hstgr.cloud
- n8n tourne sur : n8n.srv1161197.hstgr.cloud
- OS : Ubuntu 24.04, Docker installé, Traefik actif
- Connexion SSH via Python paramiko (sshpass non disponible)
- **Documentation complète du serveur** : https://app.notion.com/p/3795b86a8bb4804d978acc47e3ccbb42

## Règles de développement

- Auth bypassée pour dev local : `src/middleware.ts` retourne `NextResponse.next()` sans condition
- Zustand + `.filter()` dans les selectors = infinite loop → utiliser `useMemo` après avoir sélectionné le tableau complet
- PDF : ne pas utiliser `toLocaleString("fr-FR")` pour les nombres → utiliser `fmt()` dans `src/lib/pdf.ts`
- Redémarrer le serveur : Bash tool avec `run_in_background: true`, ne pas ouvrir une nouvelle fenêtre PowerShell

## Commandes utiles

```powershell
# Démarrer le serveur de dev
pnpm dev

# Build
pnpm build

# Vider le cache Next.js
Remove-Item -Recurse -Force .next
```
