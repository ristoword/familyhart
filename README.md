# Family Hart ❤️

**La tua famiglia, sempre connessa**

App mobile-first per sicurezza e comunicazione familiare: posizione, chat, SOS, geofence, chiamate. Front-end React + backend Node.js/Express.

---

## Cos'è Family Hart

Family Hart permette alle famiglie di restare connesse attraverso:

- **Posizione** – Visualizza dove sono i membri (reale per utente corrente, simulata per gli altri)
- **Chat** – Messaggi famiglia e privati con messaggi rapidi
- **SOS** – Pulsante emergenza e azioni rapide
- **Geofence** – Luoghi sicuri con notifiche automatiche entrata/uscita
- **Chiamate** – Audio e video reali con WebRTC
- **Gestione famiglia** – Ruoli, permessi, inviti

---

## Stato attuale

- **Front-end** – React mobile-first, stato centrale stabile con fallback
- **Backend** – Express + SQLite + JWT + Socket.io + Web Push
- **Realtime** – Socket.io attivo (chat, SOS, posizione, geofence, agenda, signaling WebRTC)
- **Chiamate** – WebRTC reale 1:1 (audio/video), gruppo V1 ancora limitato
- **Hardening** – Rate limit, CORS/env configurabile, sanitizzazione input base, logging richieste
- **Deploy readiness** – `.env.example` backend/frontend, `.env.staging.example`, health check, blueprint `render.yaml`, guida `docs/DEPLOY_STAGING.md`, checklist `docs/qa-staging-checklist.md`

### URL deploy (placeholder)

Sostituisci dopo il deploy reale:

| Risorsa | URL |
|--------|-----|
| Frontend Family Hart | `https://TUO-FRONTEND-FAMILYHART.up.railway.app` |
| Backend API + Socket | `https://TUO-BACKEND-FAMILYHART.up.railway.app` |
| Gestione Semplificata (vetrina esterna) | `https://gestione-semplificata.example.com` |

Health backend: `GET <backend>/health` e `GET <backend>/api/health`.

---

## Avvio in locale

### 1. Backend

```bash
cd backend
npm install
npm run init-db    # crea schema database
npm run seed       # dati demo
npm run dev        # avvia su http://localhost:3001
```

### 2. Front-end

```bash
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173). In dev il proxy inoltra `/api` al backend.

### Porte

- Front-end: **5173** (Vite)
- Backend: **3001** (Express + Socket.io)

### Eventi Socket.io

| Evento | Direzione | Descrizione |
|--------|-----------|-------------|
| `send_message` | Client → Server | Invia messaggio chat (salva + broadcast) |
| `receive_message` | Server → Client | Nuovo messaggio ricevuto |
| `send_sos` | Client → Server | SOS inviato (broadcast famiglia) |
| `receive_sos` | Server → Client | SOS ricevuto |
| `update_location` | Client → Server | Aggiorna posizione (salva + broadcast, throttled) |
| `receive_location_update` | Server → Client | Posizione membro aggiornata |
| `geofence_event` | Client → Server | Evento enter/exit luogo sicuro |
| `receive_geofence_event` | Server → Client | Geofence event ricevuto |
| `receive_notification` | Server → Client | Nuova notifica |
| `appointment_created/updated/deleted` | Server → Client | CRUD appuntamenti |
| `event_created/updated/deleted` | Server → Client | CRUD eventi famiglia |
| `webrtc_call_start/accept/decline/end` | Bidirezionale | Signaling WebRTC |
| `webrtc_offer/answer/ice_candidate` | Bidirezionale | SDP e ICE |

### Endpoint Push

| Endpoint | Metodo | Note |
|----------|--------|------|
| `/api/push/public-key` | GET | Chiave VAPID pubblica |
| `/api/push/subscribe` | POST | Salva subscription browser |
| `/api/push/unsubscribe` | POST | Rimuove subscription |
| `/api/push/test` | POST | Invia notifica test |

### Endpoint Beta Privata

| Endpoint | Metodo | Note |
|----------|--------|------|
| `/api/auth/activate-beta` | POST | Attiva utente con `inviteCode` |
| `/api/beta/invites` | GET/POST | Lista/crea inviti beta (admin) |
| `/api/beta/users` | GET/POST | Lista/crea utenti beta (admin) |
| `/api/beta/users/:id` | PATCH | Aggiorna ruolo/attivazione accesso (admin) |

---

## Credenziali demo

```
Marco:  demo@familyhart.it    / demo123
Laura:  laura@familyhart.it   / demo123
```

Per testare le chiamate WebRTC: apri due browser (o finestre incognito), accedi con Marco e Laura, avvia una chiamata da uno verso l'altro.

---

## Cosa è reale / simulato

| Modulo       | Reale                                  | Simulato                      |
|-------------|----------------------------------------|-------------------------------|
| Auth        | Login, logout, sessione JWT            | -                             |
| Famiglia    | CRUD membri                            | Inviti (solo locale)          |
| Luoghi sicuri | CRUD luoghi                          | -                             |
| Chat        | Messaggi persistiti + Socket.io real-time | -                             |
| Notifiche   | Elenco, segna letta, Socket.io realtime, Web Push base | Push native mobile avanzate |
| Posizione   | GPS utente + persistenza server + Socket.io live + polling fallback | - |
| Geofence events | Persistenza server + Socket.io live + polling fallback | - |
| Appuntamenti   | CRUD, persistenza server, Socket.io real-time | -                  |
| Eventi famiglia| CRUD, persistenza server, Socket.io real-time | -                  |
| SOS         | Pulsante + Socket.io broadcast famiglia | -                             |
| Chiamate    | WebRTC 1:1 audio/video reale, signaling socket | Gruppo WebRTC avanzato (SFU/MCU) |

---

## Struttura

```
├── src/                 # Front-end React
│   ├── api/             # Client API (auth, family, chat, …)
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── store/           # AppContext, locationStore
│   ├── types/
│   └── utils/
├── backend/             # API Node.js/Express + Socket.io
│   ├── src/
│   │   ├── config/
│   │   ├── realtime/    # socket.js, emitter.js
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── data/            # SQLite database
└── ...
```

---

## Note

- **Design** – Non modificare layout e stile
- **Mobile-first** – Mantenere priorità mobile
- **better-sqlite3** – Se il build fallisce: `cd backend && npm rebuild better-sqlite3`
- **Proxy** – In dev Vite inoltra `/api` e `/socket.io` a `localhost:3001`
- **WebRTC** – HTTPS richiesto in produzione (localhost ok in dev). STUN in `src/config/webrtc.js`, TURN da configurare per prod
- **Web Push** – Richiede VAPID keys backend e service worker (`public/sw.js`), HTTPS in staging/produzione

## Configurazione ENV

### Locale (sviluppo)

1. Copia `backend/.env.example` in `backend/.env`
2. Copia `.env.example` in `.env` (frontend)
3. Imposta almeno:
   - Backend: `JWT_SECRET`, `CORS_ORIGINS`, `PUSH_VAPID_PUBLIC_KEY`, `PUSH_VAPID_PRIVATE_KEY`
   - Frontend: `VITE_API_URL`, `VITE_SOCKET_URL` (vuoti in dev = proxy Vite)

### Staging

**Backend**

1. Copia `backend/.env.staging.example` in `backend/.env.staging` oppure definisci le stesse variabili sul provider (Render/Railway).
2. Imposta `CORS_ORIGINS` con l’URL esatto del frontend (HTTPS), `CLIENT_URL` coerente, `DATABASE_PATH` su file SQLite su **disco persistente** in hosting.
3. Avvio locale con file staging: `cd backend && npm run start:staging` (`NODE_ENV=staging` carica `.env.staging`).

**Frontend**

1. Copia `.env.staging.example` in `.env.staging` nella root del progetto.
2. Imposta `VITE_API_URL` e `VITE_SOCKET_URL` all’URL pubblico dell’API (di solito stesso host; niente slash finale).
3. Build: `npm run build:staging` → output in `dist/`, da servire come sito statico (HTTPS).

Dettaglio deploy (Render static + web service, volumi SQLite, seed iniziale): **`docs/DEPLOY_STAGING.md`**.

### Production (Railway, deploy autonomo)

**Backend**

1. Usa `backend/.env.production.example` come base.
2. Imposta env su Railway (`family-hart-api`) con:
   - `CLIENT_URL` = URL frontend Family Hart
   - `CORS_ORIGINS` = URL frontend Family Hart + eventuale dominio Gestione Semplificata
   - `DATABASE_PATH` su volume (es. `/data/familyhart.db`)
3. Start: `npm start` (root `backend/`).

**Frontend**

1. Usa `.env.production.example` come base.
2. Imposta:
   - `VITE_API_URL` = URL backend Family Hart
   - `VITE_SOCKET_URL` = URL backend Family Hart
   - `VITE_STUN_URL`/`VITE_TURN_*` per WebRTC in produzione
3. Build: `npm run build`.

Guida completa: **`docs/DEPLOY_RAILWAY.md`**

## Deploy (riepilogo)

| Componente | Approccio tipico |
|------------|------------------|
| Backend | Render Web Service o Railway, root `backend/`, start `npm start`, health `/health` |
| Frontend | Netlify / Cloudflare Pages / Render Static da `dist/` |
| DB | SQLite su volume montato; `init-db` / `seed` una tantum dopo primo deploy |

File di riferimento: `render.yaml` (blueprint da adattare).

### Deploy Railway passo-passo (consigliato)

1. Crea servizio `family-hart-api` (root `backend`, start `npm start`).
2. Collega volume persistente al backend e punta `DATABASE_PATH` al volume.
3. Crea servizio `family-hart-web` per il frontend (build `npm run build`).
4. Imposta env frontend (`VITE_API_URL`, `VITE_SOCKET_URL`, WebRTC env).
5. Imposta env backend (`CORS_ORIGINS`, push VAPID, JWT, beta access).
6. Verifica:
   - healthcheck backend
   - login
   - socket
   - push
   - WebRTC

## Test rapidi

- **Socket realtime**: login da 2 browser, invia chat/sos e verifica update live
- **WebRTC**: chiamata Marco ↔ Laura (audio/video) e verifica accept/decline
- **Push**: autorizza notifiche browser, poi `POST /api/push/test` autenticato

### Test multi-device (staging)

1. Stesso URL frontend su due browser (o desktop + mobile).
2. Due account della stessa famiglia (credenziali demo).
3. Seguire `docs/qa-staging-checklist.md` e registrare esito e note.

### Istruzioni tester beta privata

1. Accedi con credenziali assegnate dal team beta.
2. Esegui i flussi principali (login, chat, SOS, posizione, geofence, appuntamenti, eventi, chiamate).
3. Se ricevi invito beta, usa `POST /api/auth/activate-beta` con `{ email, password, inviteCode }`.
4. Registra bug in `docs/bug-tracking.md` e feedback in `docs/feedback-beta.md`.
5. Segnala sempre: dispositivo, browser, orario, azione fatta, risultato atteso vs ottenuto.

### Test socket / WebRTC / push in staging

- **Socket**: dopo login, in DevTools → Network → WS verso `wss://<api>/socket.io/...`
- **WebRTC**: due client connessi; se ICE fallisce, configurare TURN (`VITE_TURN_*`) nel `.env.staging`
- **Push**: HTTPS + permesso notifiche; chiavi VAPID sul backend; verifica subscription in Application → Service Workers

## Limiti V1

- Chiamate gruppo WebRTC: non ancora production-grade full mesh/SFU
- Push: Web Push base (non native iOS/Android bridge)
- Nessuna cifratura custom avanzata oltre standard WebRTC/HTTPS/JWT
- **Staging**: SQLite single-node; URL e volumi vanno configurati sul provider (vedi limiti in `docs/DEPLOY_STAGING.md`)

## Cosa segnalare in beta

- Errori login/onboarding o accesso famiglia
- Ritardi/duplicazioni realtime (chat, SOS, notifiche, agenda)
- Problemi geolocalizzazione/geofence/push (permessi negati, fallback)
- Problemi WebRTC (handshake, audio/video, chiusura chiamata)
- Crash/freeze UI o comportamenti incoerenti multi-dispositivo

## Prossimi step consigliati

**Stabilizzazione feedback beta privata + preparazione V2 controllata** (vedi `PROJECT_STATUS.md`)
