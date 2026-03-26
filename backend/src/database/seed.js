/**
 * Seed database - dati demo coerenti con front-end
 * Credenziali: demo@familyhart.it / demo123
 */
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const FAMILY_ID = 'fam-1';
const USER_ID_1 = '1';
const USER_ID_2 = '2';
const HASH = bcrypt.hashSync('demo123', 10);

db.exec('PRAGMA foreign_keys = ON');

// Famiglia
db.prepare(`
  INSERT OR IGNORE INTO families (id, name) VALUES (?, ?)
`).run(FAMILY_ID, 'Famiglia Rossi');

// Utenti demo (Marco e Laura per test WebRTC tra due browser)
db.prepare(`
  INSERT OR REPLACE INTO users (id, email, password_hash, name, avatar, role_type, family_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(USER_ID_1, 'demo@familyhart.it', HASH, 'Marco', '👨', 'admin', FAMILY_ID);

db.prepare(`
  INSERT OR REPLACE INTO users (id, email, password_hash, name, avatar, role_type, family_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(USER_ID_2, 'laura@familyhart.it', HASH, 'Laura', '👩', 'partner', FAMILY_ID);

// Membri famiglia (Marco=user1, Laura=user2)
const members = [
  { id: '1', userId: USER_ID_1, name: 'Marco', surname: 'Rossi', role: 'Papà', roleType: 'admin', email: 'marco.rossi@email.it', phone: '+39 333 1111111', avatar: '👨', color: '#3B82F6' },
  { id: '2', userId: USER_ID_2, name: 'Laura', surname: 'Rossi', role: 'Mamma', roleType: 'partner', email: 'laura.rossi@email.it', phone: '+39 333 2222222', avatar: '👩', color: '#10B981' },
  { id: '3', userId: null, name: 'Giulia', surname: 'Rossi', role: 'Figlia', roleType: 'child', email: 'giulia.rossi@email.it', phone: '+39 333 3333333', avatar: '👧', color: '#F59E0B' },
  { id: '4', userId: null, name: 'Luca', surname: 'Rossi', role: 'Figlio', roleType: 'child', email: 'luca.rossi@email.it', phone: '+39 333 4444444', avatar: '👦', color: '#EF4444' },
];

const insertMember = db.prepare(`
  INSERT OR REPLACE INTO family_members (id, family_id, user_id, name, surname, role, role_type, email, phone, avatar, account_status, location_sharing_enabled, color)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)
`);

members.forEach((m) => {
  insertMember.run(m.id, FAMILY_ID, m.userId, m.name, m.surname, m.role, m.roleType, m.email, m.phone, m.avatar, m.color);
});

// Luoghi sicuri
const places = [
  { id: 'sp1', name: 'Casa', address: 'Via Garibaldi 8, Milano', lat: 45.4654, lng: 9.1856, radius: 100, notifyEntry: 1, notifyExit: 1 },
  { id: 'sp2', name: 'Scuola', address: 'Liceo Scientifico Galileo, Via Galilei 5', lat: 45.4612, lng: 9.1823, radius: 150, notifyEntry: 1, notifyExit: 1 },
  { id: 'sp3', name: 'Lavoro', address: 'Ufficio - Via Roma 15', lat: 45.4642, lng: 9.19, radius: 80, notifyEntry: 0, notifyExit: 1 },
  { id: 'sp4', name: 'Nonni', address: 'Via Verdi 22, Monza', lat: 45.5845, lng: 9.2744, radius: 120, notifyEntry: 1, notifyExit: 1 },
];

const insertPlace = db.prepare(`
  INSERT OR REPLACE INTO safe_places (id, family_id, name, address, lat, lng, radius, notify_entry, notify_exit)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

places.forEach((p) => {
  insertPlace.run(p.id, FAMILY_ID, p.name, p.address, p.lat, p.lng, p.radius, p.notifyEntry, p.notifyExit);
});

// Associazione membri <-> luoghi
const insertPlaceMember = db.prepare(`
  INSERT OR IGNORE INTO safe_place_members (place_id, member_id) VALUES (?, ?)
`);

db.prepare('DELETE FROM safe_place_members').run();
[['sp1', '1'], ['sp1', '2'], ['sp1', '3'], ['sp1', '4'], ['sp2', '3'], ['sp3', '1'], ['sp4', '3'], ['sp4', '4']].forEach(([placeId, memberId]) => {
  insertPlaceMember.run(placeId, memberId);
});

// Conversazione famiglia
db.prepare(`
  INSERT OR IGNORE INTO conversations (id, family_id, type) VALUES ('family', ?, 'family')
`).run(FAMILY_ID);

// Messaggi chat famiglia
const baseTime = Math.floor(Date.now() / 1000) - 3600;
const messages = [
  { id: 'm1', memberId: '2', text: 'Ragazzi, ricordatevi di fare i compiti! 📚', offset: 0 },
  { id: 'm2', memberId: '1', text: 'Ci penso io stasera 👍', offset: 180 },
  { id: 'm3', memberId: '3', text: 'Io ho finito! 🎉', offset: 360 },
  { id: 'm4', memberId: '4', text: 'Mamma, posso uscire con gli amici?', offset: 13200 },
  { id: 'm5', memberId: '2', text: 'Fino alle 19, niente più tardi! ⏰', offset: 13380 },
];

db.prepare('DELETE FROM messages WHERE conversation_id = ?').run('family');
const insertMsg = db.prepare(`
  INSERT INTO messages (id, conversation_id, member_id, text, created_at) VALUES (?, 'family', ?, ?, ?)
`);

messages.forEach((m) => {
  insertMsg.run(m.id, m.memberId, m.text, baseTime + m.offset);
});

// Notifiche
const notifs = [
  { id: 'n1', type: 'position', title: 'Giulia è arrivata a scuola', message: 'Liceo Scientifico Galileo - 08:45', icon: '🏫', read: 0 },
  { id: 'n2', type: 'position', title: "Marco ha lasciato casa", message: "In viaggio verso l'ufficio - 07:30", icon: '🚗', read: 0 },
  { id: 'n3', type: 'battery', title: 'Luca batteria al 10%', message: 'Considera di ricaricare il dispositivo', icon: '🔋', read: 0 },
  { id: 'n4', type: 'safety', title: 'SOS inviato', message: 'Laura ha richiesto assistenza - 12:05', icon: '🆘', read: 1 },
  { id: 'n5', type: 'chat', title: 'Nuovo messaggio da Marco', message: 'A che ora tornate stasera?', icon: '💬', read: 0 },
];

db.prepare('DELETE FROM notifications').run();
const insertNotif = db.prepare(`
  INSERT INTO notifications (id, family_id, type, title, message, icon, read) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

notifs.forEach((n) => {
  insertNotif.run(n.id, FAMILY_ID, n.type, n.title, n.message, n.icon, n.read);
});

// Ultime posizioni demo membri
db.prepare('DELETE FROM member_locations').run();
const nowSec = Math.floor(Date.now() / 1000);
const insertLocation = db.prepare(`
  INSERT INTO member_locations (id, member_id, latitude, longitude, accuracy, source, recorded_at, battery_level, is_moving)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
[
  { id: 'loc1', memberId: '1', latitude: 45.4642, longitude: 9.19, accuracy: 12, source: 'device', battery: 87, moving: 1 },
  { id: 'loc2', memberId: '2', latitude: 45.4654, longitude: 9.1856, accuracy: 20, source: 'seed', battery: 92, moving: 0 },
  { id: 'loc3', memberId: '3', latitude: 45.4612, longitude: 9.1823, accuracy: 18, source: 'seed', battery: 45, moving: 0 },
  { id: 'loc4', memberId: '4', latitude: 45.4641, longitude: 9.1919, accuracy: 25, source: 'seed', battery: 23, moving: 1 },
].forEach((l, i) => {
  insertLocation.run(l.id, l.memberId, l.latitude, l.longitude, l.accuracy, l.source, nowSec - (i * 120), l.battery, l.moving);
});

// Eventi geofence demo
db.prepare('DELETE FROM geofence_events').run();
const insertGeofenceEvent = db.prepare(`
  INSERT INTO geofence_events (id, member_id, safe_place_id, event_type, created_at)
  VALUES (?, ?, ?, ?, ?)
`);
[
  { id: 'gfe1', memberId: '3', safePlaceId: 'sp2', eventType: 'enter', createdAt: nowSec - 3600 },
  { id: 'gfe2', memberId: '1', safePlaceId: 'sp3', eventType: 'exit', createdAt: nowSec - 3000 },
  { id: 'gfe3', memberId: '4', safePlaceId: 'sp1', eventType: 'enter', createdAt: nowSec - 1800 },
].forEach((e) => {
  insertGeofenceEvent.run(e.id, e.memberId, e.safePlaceId, e.eventType, e.createdAt);
});

// Appuntamenti famiglia
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
db.prepare('DELETE FROM family_appointments').run();
const insertAppointment = db.prepare(`
  INSERT INTO family_appointments (id, family_id, title, description, date, start_time, end_time, location, created_by, assigned_members, category, reminder_enabled, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
[
  { title: 'Visita pediatra', description: 'Controllo Luca', date: today, start: '10:00', end: '10:45', loc: 'Studio Dr. Bianchi', members: ['2', '4'], cat: 'health' },
  { title: 'Riunione scuola', description: 'Colloquio genitori Giulia', date: tomorrow, start: '16:30', end: '17:00', loc: 'Liceo Galileo', members: ['1', '2', '3'], cat: 'school' },
  { title: 'Partita di calcio', description: 'Luca - campionato under 12', date: nextWeek, start: '15:00', end: '16:30', loc: 'Campo sportivo', members: ['4'], cat: 'sport' },
  { title: 'Dentista Marco', description: 'Pulizia dentale', date: tomorrow, start: '09:00', end: '09:30', loc: 'Centro dentistico', members: ['1'], cat: 'health' },
].forEach((a, i) => {
  const id = `apt${Date.now() + i}`;
  const ts = nowSec - 86400 * (3 - i);
  insertAppointment.run(id, FAMILY_ID, a.title, a.description || '', a.date, a.start, a.end, a.loc || '', USER_ID, JSON.stringify(a.members || []), a.cat || 'other', 1, ts, ts);
});

// Eventi famiglia
db.prepare('DELETE FROM family_events').run();
const insertEvent = db.prepare(`
  INSERT INTO family_events (id, family_id, title, description, event_date, start_time, end_time, location, event_type, created_by, participants, is_all_day, reminder_enabled, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
[
  { title: 'Compleanno Nonna', description: 'Festa a casa nonni', date: nextWeek, start: '12:00', end: '18:00', loc: 'Casa nonni', type: 'birthday', participants: ['1', '2', '3', '4'], allDay: 0 },
  { title: 'Cena dai nonni', description: 'Pranzo domenicale', date: nextWeek, start: '12:30', end: '15:00', loc: 'Via Verdi 22', type: 'family', participants: ['1', '2', '3', '4'], allDay: 0 },
  { title: 'Weekend fuori', description: 'Gita in montagna', date: nextWeek, start: '', end: '', loc: 'Val di Fassa', type: 'trip', participants: ['1', '2', '3', '4'], allDay: 1 },
  { title: 'Festa di fine anno', description: 'Scuola Giulia', date: tomorrow, start: '18:00', end: '21:00', loc: 'Liceo Galileo', type: 'school', participants: ['1', '2', '3'], allDay: 0 },
].forEach((e, i) => {
  const id = `evt${Date.now() + i}`;
  const ts = nowSec - 86400 * (4 - i);
  insertEvent.run(id, FAMILY_ID, e.title, e.description || '', e.date, e.start || '', e.end || '', e.loc || '', e.type || 'other', USER_ID, JSON.stringify(e.participants || []), e.allDay ? 1 : 0, 1, ts, ts);
});

console.log('Seed completato.');
console.log('Credenziali: demo@familyhart.it / demo123  oppure  laura@familyhart.it / demo123');
