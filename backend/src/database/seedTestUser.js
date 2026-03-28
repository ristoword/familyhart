/**
 * Seed utente demo: stesso flusso auth di login (authService.js):
 * - email con trim + toLowerCase come findByEmail in login
 * - password_hash con bcryptjs.hashSync(plain, 10), verifica con compareSync prima dell'INSERT
 */
import bcrypt from 'bcryptjs';

// Allineato a login: email.trim().toLowerCase()
const DEMO_EMAIL = 'demo@familyhart.it'.trim().toLowerCase();
const DEMO_PASSWORD = '123456';
const BCRYPT_ROUNDS = 10;
const FAMILY_ID = 'fam-seed-test';
const USER_ID = 'user-seed-demo';

function usersTableExists(db) {
  return !!db.prepare(
    "SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'",
  ).get();
}

export function runSeedTestUserIfEmpty(db) {
  if (!usersTableExists(db)) return;

  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(DEMO_EMAIL)) {
    console.log('USER EXISTS');
    return;
  }

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, BCRYPT_ROUNDS);
  if (!bcrypt.compareSync(DEMO_PASSWORD, passwordHash)) {
    throw new Error('seed: bcrypt compare fallita dopo hashSync (incoerenza auth)');
  }

  db.prepare('INSERT OR IGNORE INTO families (id, name) VALUES (?, ?)').run(
    FAMILY_ID,
    'Famiglia demo',
  );

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, avatar, role_type, family_id, beta_access_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    USER_ID,
    DEMO_EMAIL,
    passwordHash,
    'Demo',
    '👤',
    'admin',
    FAMILY_ID,
    'beta_tester',
  );

  console.log('USER CREATED');
}
