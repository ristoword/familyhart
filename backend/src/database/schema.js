/**
 * Schema SQLite base (idempotente: CREATE IF NOT EXISTS).
 * Usato all'avvio (db.js) e dallo script init.js.
 */
export function ensureBaseSchema(db) {
  db.exec(`
  -- Utenti (login)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '👤',
    role_type TEXT NOT NULL DEFAULT 'admin',
    family_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Famiglie
  CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Membri famiglia (legati a user o standalone)
  CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    user_id TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    surname TEXT DEFAULT '',
    role TEXT DEFAULT 'Membro',
    role_type TEXT NOT NULL DEFAULT 'child',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '👤',
    account_status TEXT DEFAULT 'active',
    location_sharing_enabled INTEGER DEFAULT 1,
    color TEXT DEFAULT '#6B7280',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(family_id, user_id)
  );

  -- Luoghi sicuri (geofence)
  CREATE TABLE IF NOT EXISTS safe_places (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    radius INTEGER NOT NULL DEFAULT 100,
    notify_entry INTEGER DEFAULT 1,
    notify_exit INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Associazione membri <-> luoghi sicuri
  CREATE TABLE IF NOT EXISTS safe_place_members (
    place_id TEXT NOT NULL REFERENCES safe_places(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    PRIMARY KEY (place_id, member_id)
  );

  -- Conversazioni (family = gruppo famiglia, altrimenti privata tra 2 membri)
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    type TEXT NOT NULL DEFAULT 'family',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Messaggi
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES family_members(id),
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Notifiche/Avvisi
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT DEFAULT '',
    icon TEXT DEFAULT '📢',
    read INTEGER DEFAULT 0,
    member_id TEXT REFERENCES family_members(id),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_family ON notifications(family_id);
  CREATE INDEX IF NOT EXISTS idx_safe_places_family ON safe_places(family_id);
  CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);

  -- Posizioni membri (storico)
  CREATE TABLE IF NOT EXISTS member_locations (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    source TEXT NOT NULL DEFAULT 'device',
    recorded_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    battery_level INTEGER,
    is_moving INTEGER
  );

  -- Eventi geofence (entry/exit)
  CREATE TABLE IF NOT EXISTS geofence_events (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    safe_place_id TEXT NOT NULL REFERENCES safe_places(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_locations_member_time ON member_locations(member_id, recorded_at DESC);
  CREATE INDEX IF NOT EXISTS idx_geofence_events_member_time ON geofence_events(member_id, created_at DESC);

  -- Appuntamenti famiglia
  CREATE TABLE IF NOT EXISTS family_appointments (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    start_time TEXT DEFAULT '',
    end_time TEXT DEFAULT '',
    location TEXT DEFAULT '',
    created_by TEXT REFERENCES family_members(id),
    assigned_members TEXT DEFAULT '[]',
    category TEXT DEFAULT 'other',
    reminder_enabled INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Eventi famiglia
  CREATE TABLE IF NOT EXISTS family_events (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    event_date TEXT NOT NULL,
    start_time TEXT DEFAULT '',
    end_time TEXT DEFAULT '',
    location TEXT DEFAULT '',
    event_type TEXT DEFAULT 'other',
    created_by TEXT REFERENCES family_members(id),
    participants TEXT DEFAULT '[]',
    is_all_day INTEGER DEFAULT 0,
    reminder_enabled INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_appointments_family_date ON family_appointments(family_id, date);
  CREATE INDEX IF NOT EXISTS idx_events_family_date ON family_events(family_id, event_date);

  -- Storico chiamate WebRTC
  CREATE TABLE IF NOT EXISTS call_logs (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    caller_id TEXT REFERENCES family_members(id),
    callee_ids TEXT DEFAULT '[]',
    call_type TEXT NOT NULL DEFAULT 'audio',
    outcome TEXT NOT NULL DEFAULT 'completed',
    duration_seconds INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_call_logs_family ON call_logs(family_id);

  -- Web Push subscriptions
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id TEXT,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(family_id, endpoint)
  );
  CREATE INDEX IF NOT EXISTS idx_push_subscriptions_family ON push_subscriptions(family_id);
`);
}
