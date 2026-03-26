# QA Staging — Family Hart

Usa questa checklist dopo ogni deploy su staging. Compila **Esito** (OK / KO / N/A) e **Note**.

| # | Test | Risultato atteso | Esito | Note |
|---|------|------------------|-------|------|
| 1 | Login | Accesso con utente valido, redirect dashboard | | |
| 2 | Logout | Sessione chiusa, redirect login | | |
| 3 | Dashboard | Gruppo e membri visibili, nessun errore bloccante | | |
| 4 | Membri famiglia | Lista coerente con backend | | |
| 5 | Safe places | Lista luoghi, CRUD base | | |
| 6 | Posizione live | GPS utente e ultima posizione membri (polling + socket se attivo) | | |
| 7 | Geofence | Evento enter/exit visibile (socket o refresh) | | |
| 8 | Chat realtime | Messaggio da browser A appare su B senza refresh manuale | | |
| 9 | SOS realtime | SOS da A notificato su B | | |
| 10 | Notifiche in-app | Nuova voce in elenco con socket | | |
| 11 | Appuntamenti realtime | Creazione/modifica riflessa su altro client | | |
| 12 | Eventi famiglia realtime | Creazione/modifica riflessa su altro client | | |
| 13 | Chiamata audio WebRTC | Connessione stabile 1:1 | | |
| 14 | Videochiamata base | Video visibile entrambi i lati | | |
| 15 | Push (browser) | Test endpoint `/api/push/test` o notifica reale | | |

## Ambiente

- **URL frontend staging**: _______________________
- **URL backend staging**: _______________________
- **Browser / device**: _______________________

## Multi-device

- [ ] Due browser diversi (es. Chrome + Firefox)
- [ ] Desktop + mobile (stesso staging URL)
- [ ] Due sessioni contemporanee (utenti diversi stessa famiglia)

## Regressioni da evitare

- Auth JWT, famiglia, GPS, geofence, chat, SOS, appuntamenti, eventi, socket, WebRTC, push non devono regressare rispetto alla baseline locale.

## Bug noti (da risolvere prima di produzione)

| ID | Descrizione | Priorità |
|----|-------------|----------|
| | | |
