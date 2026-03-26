/**
 * Inizializzazione database SQLite - schema tabelle
 */
import Database from 'better-sqlite3';
import { config } from '../config/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { ensureBaseSchema } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(path.join(__dirname, '../../'), config.database.path);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
ensureBaseSchema(db);
db.close();
console.log('Database inizializzato:', dbPath);
