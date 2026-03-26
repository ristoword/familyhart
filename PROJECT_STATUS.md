# Family Hart – Project Status

## Fase attuale

**Beta privata attiva (rollout controllato) con base stabile.**  
Sistema pronto per utenti reali con tracking bug e raccolta feedback, senza cambi design/struttura.

**Nota deploy operativo:** Family Hart = deploy autonomo su Railway; Gestione Semplificata = sola vetrina/accesso esterno.

Deploy target confermato:
- Backend Railway da `backend/`
- Frontend Railway da root progetto

---

## Completato

- [x] Auth JWT, sessione, profilo utente (`/api/auth/login`, `/api/auth/me`)
- [x] Famiglia, luoghi sicuri, posizione live, geofence, chat, SOS, notifiche, agenda
- [x] Realtime Socket.io + fallback polling
- [x] WebRTC 1:1 audio/video su signaling socket
- [x] Push notifications Web Push (VAPID + Service Worker)
- [x] Staging setup: env separati, build staging, guida deploy, checklist QA
- [x] Ottimizzazioni stabilità: throttle posizione, fix race socket, cleanup listener
- [x] Logging operativo migliorato: login/activate-beta + eventi SOS/chiamata realtime
- [x] API beta privata minima:
  - `POST /api/auth/activate-beta`
  - `GET/POST /api/beta/invites`
  - `GET/POST /api/beta/users`
  - `PATCH /api/beta/users/:id`
- [x] Preparazione deploy Railway autonoma:
  - separazione URL frontend/API/socket via env
  - CORS pronto per dominio Family Hart + dominio Gestione Semplificata
  - guida `docs/DEPLOY_RAILWAY.md`
  - esempi `.env.production.example` frontend/backend

---

## In corso

- Esecuzione beta privata con utenti reali su staging pubblico
- Raccolta e triage bug/feedback in:
  - `docs/bug-tracking.md`
  - `docs/feedback-beta.md`

---

## Bug reali (attuale)

- Nessun blocker critico registrato nel repository.
- Monitorare in priorita:
  - sync realtime (chat/notifiche)
  - qualità chiamata WebRTC multi-device
  - permessi geo/camera/microfono/push su mobile

---

## Stato stabilità

- Nessun crash noto introdotto da questa fase
- Nessun refactor strutturale applicato
- UI/design invariati
- Fallback backend/socket/push mantenuti

---

## Dove riprendere

1. Eseguire i test beta con utenti reali usando la checklist (`docs/qa-staging-checklist.md`).
2. Registrare ogni problema in `docs/bug-tracking.md` (gravità + stato).
3. Consolidare feedback UX in `docs/feedback-beta.md`.
4. Applicare solo fix mirati ai bug reali emersi.

---

## Prossimo step

**Stabilizzazione feedback beta privata + preparazione evoluzione V2 (controllata).**

