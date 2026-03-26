# Deploy staging Family Hart

Questa guida descrive un deploy coerente con il progetto attuale (Express + SQLite + Socket.io + Vite static). Gli URL sono **placeholder**: sostituiscili con quelli reali dopo il deploy.

## Backend (Render consigliato)

1. Crea un **Web Service** Node, root directory `backend`.
2. **Build**: `npm install`
3. **Start**: `npm start` (usa `PORT` fornita da Render).
4. **Health check path**: `/health`
5. **Disco persistente**: monta un volume e imposta `DATABASE_PATH` sul path del volume (es. `/data/familyhart.db`). Senza volume, i dati si perdono a ogni deploy.
6. **Variabili ambiente** (minimo):
   - `NODE_ENV=staging`
   - `JWT_SECRET` — stringa lunga casuale
   - `CORS_ORIGINS` — URL del frontend staging (comma-separated se più origini)
   - `CLIENT_URL` — stesso URL del frontend (usato per link e coerenza)
   - `DATABASE_PATH` — path file SQLite sul disco persistente
   - `PUSH_VAPID_PUBLIC_KEY`, `PUSH_VAPID_PRIVATE_KEY`, `PUSH_VAPID_SUBJECT` — per Web Push (HTTPS)
7. Dopo il primo deploy, da shell Render (o locale con `DATABASE_URL`/`DATABASE_PATH` puntato allo stesso DB): `npm run init-db` e `npm run seed` **una tantum** se serve dati demo.

Alternativa **Railway**: stesso `backend/`, start `npm start`, variabili analoghe; aggiungi volume per SQLite.

## Frontend (static hosting)

1. Build: dalla root del repo, `cp .env.staging.example .env.staging`, imposta `VITE_API_URL` e `VITE_SOCKET_URL` all’URL pubblico dell’API (stesso host di solito: Socket.io sullo stesso origin).
2. `npm run build:staging` (oppure `vite build --mode staging`).
3. Servi la cartella `dist/` su **Netlify**, **Cloudflare Pages**, **Render Static Site**, o bucket S3+CloudFront.
4. **HTTPS obbligatorio** per geolocation avanzata, service worker e push.

## Verifica post-deploy

- `GET https://<api>/health` → JSON `{ ok: true, ... }`
- Login da browser con credenziali seed
- Due browser: chat e SOS in tempo reale
- WebRTC: due account diversi, stessa famiglia (vedi README credenziali demo)

## Limiti staging

- SQLite su singolo nodo; non adatto a scalabilità orizzontale senza migrare DB.
- Web Push richiede chiavi VAPID e dominio HTTPS.
- TURN per WebRTC dietro NAT restrittivi va configurato a parte (`VITE_TURN_*`).
