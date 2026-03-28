/**
 * Connessione database SQLite
 */
import Database from 'better-sqlite3';
import { config } from '../config/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { runMigrations } from './migrate.js';
import { runSeedTestUserIfEmpty } from './seedTestUser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(path.join(__dirname, '../../'), config.database.path);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
runMigrations(db);
runSeedTestUserIfEmpty(db);
