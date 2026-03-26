# Family Hart Backend

API Node.js/Express per Family Hart. SQLite, JWT auth, CRUD famiglia, luoghi sicuri, chat, notifiche.

## Setup

```bash
cd backend
npm install
```

Se `better-sqlite3` non si compila:
```bash
npm rebuild better-sqlite3
```

## Database

```bash
# Crea schema
npm run init-db

# Popola dati demo
npm run seed
```

Credenziali demo: `demo@familyhart.it` / `demo123`

## Avvio

```bash
npm run dev
# oppure
npm start
```

API su **http://localhost:3001**

## Endpoint

| Metodo | Path | Auth |
|--------|------|------|
| GET | /health | - |
| POST | /api/auth/login | - |
| POST | /api/auth/logout | ✓ |
| GET | /api/auth/me | ✓ |
| GET | /api/family/members | ✓ |
| POST | /api/family/members | ✓ |
| PATCH | /api/family/members/:id | ✓ |
| DELETE | /api/family/members/:id | ✓ |
| GET | /api/safe-places | ✓ |
| POST | /api/safe-places | ✓ |
| PATCH | /api/safe-places/:id | ✓ |
| DELETE | /api/safe-places/:id | ✓ |
| GET | /api/conversations | ✓ |
| GET | /api/conversations/:id/messages | ✓ |
| POST | /api/conversations/:id/messages | ✓ |
| GET | /api/notifications | ✓ |
| POST | /api/notifications | ✓ |
| PATCH | /api/notifications/:id/read | ✓ |

## Variabili ambiente

Copia `.env.example` in `.env`:

- `PORT` – porta server (default 3001)
- `JWT_SECRET` – chiave JWT
- `DATABASE_PATH` – path database SQLite
