# Deploy autonomo Family Hart su Railway

Obiettivo: deploy indipendente di Family Hart (frontend + backend), con Gestione Semplificata usata solo come vetrina/link esterno.

## Architettura consigliata su Railway

- **Service 1**: `family-hart-api` (Node.js backend, `backend/`)
- **Service 2**: `family-hart-web` (frontend static build da root progetto)
- **Volume**: persistente, collegato al backend per SQLite

## 1) Backend Railway (`family-hart-api`)

1. Crea servizio da repo con **Root Directory**: `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Aggiungi **Volume** e monta `/data`.
5. Imposta env dal file `backend/.env.production.example` (adattando i valori reali).
6. Verifica endpoint:
   - `GET /health`
   - `GET /api/health`

## 2) Frontend Railway (`family-hart-web`)

1. Crea secondo servizio con **Root Directory**: repository root.
2. Build command: `npm install && npm run build`
3. Start command (static hosting): usa il runtime statico Railway o un comando equivalente del template scelto.
4. Imposta env dal file `.env.production.example`:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`
   - `VITE_STUN_URL` / `VITE_TURN_*` se usi TURN

## 3) URL separati (obbligatorio)

- `Frontend public URL`: dominio del servizio web Railway
- `Backend API URL`: dominio del servizio backend Railway
- `Socket URL`: stesso dominio backend (Socket.io su `/socket.io`)

## 4) CORS e domini

Nel backend imposta `CORS_ORIGINS` includendo:

- URL frontend Railway Family Hart
- URL dominio Gestione Semplificata (solo se deve aprire/integrare Family Hart)

Esempio:

`CORS_ORIGINS=https://family-hart.up.railway.app,https://gestione-semplificata.example.com`

## 5) Push / WebRTC / Socket via env

- **Push**: `PUSH_VAPID_PUBLIC_KEY`, `PUSH_VAPID_PRIVATE_KEY`, `PUSH_VAPID_SUBJECT`
- **Socket**: `VITE_SOCKET_URL` (frontend), backend path fisso `/socket.io`
- **WebRTC**: `VITE_STUN_URL`, `VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL`

## 6) Verifica finale post-deploy

- Frontend raggiungibile
- Backend raggiungibile
- Health check backend OK
- Login OK
- Socket connect/disconnect OK
- SOS/chat realtime OK
- WebRTC 1:1 audio/video OK
- Push test OK (HTTPS + permessi browser)

## Note stabilità

- Nessun redesign, nessuna nuova feature: solo configurazione deploy.
- Mantieni fallback esistenti (polling, error handling, permessi negati).
