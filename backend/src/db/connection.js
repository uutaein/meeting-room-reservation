import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, "../..");
const dataDir = path.join(backendRoot, "data");
const dbPath = path.join(dataDir, "reservation.db");
const schemaPath = path.join(__dirname, "schema.sql");

let db;

export function initDatabase() {
  if (db) {
    return db;
  }

  fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(dbPath);

  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");

  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);

  return db;
}

export function getDb() {
  if (!db) {
    return initDatabase();
  }

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = undefined;
  }
}