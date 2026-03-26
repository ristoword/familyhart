/**
 * Migrazioni additive SQLite (idempotenti)
 */
import { ensureBaseSchema } from './schema.js';

export function runMigrations(db) {
  ensureBaseSchema(db);
  const cols = db.prepare('PRAGMA table_info(users)').all();
  const hasBeta = cols.some((c) => c.name === 'beta_access_status');
  if (!hasBeta) {
    db.exec(`ALTER TABLE users ADD COLUMN beta_access_status TEXT NOT NULL DEFAULT 'beta_tester'`);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS beta_invites (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at INTEGER NOT NULL,
      used_by_user_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      created_by_user_id TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_beta_invites_status ON beta_invites(status);
    CREATE INDEX IF NOT EXISTS idx_beta_invites_email ON beta_invites(email);
  `);
}
