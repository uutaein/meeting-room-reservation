PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  reservation_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  attendees INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (room_id) REFERENCES rooms(id),

  CHECK (status IN ('ACTIVE', 'CANCELLED')),
  CHECK (attendees >= 1 AND attendees <= 12)
);

CREATE INDEX IF NOT EXISTS idx_reservations_date_room_time
ON reservations (reservation_date, room_id, start_time, end_time);

INSERT OR IGNORE INTO rooms (id, name, capacity, is_active)
VALUES
  ('ROOM_1', '회의실 1', 6, 1),
  ('ROOM_2', '회의실 2', 12, 1);

CREATE TRIGGER IF NOT EXISTS trg_reservation_no_overlap_insert
BEFORE INSERT ON reservations
WHEN NEW.status = 'ACTIVE'
BEGIN
  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM reservations r
        WHERE r.room_id = NEW.room_id
          AND r.reservation_date = NEW.reservation_date
          AND r.status = 'ACTIVE'
          AND NEW.start_time < r.end_time
          AND NEW.end_time > r.start_time
      )
      THEN RAISE(ABORT, 'ERR_RESERVATION_OVERLAP')
    END;
END;
-- feature/reservation-update
CREATE TRIGGER prevent_overlap_update
BEFORE UPDATE
ON reservations
WHEN NEW.status = 'ACTIVE'
BEGIN

  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM reservations
        WHERE id <> NEW.id
          AND room_id = NEW.room_id
          AND reservation_date = NEW.reservation_date
          AND status = 'ACTIVE'
          AND NEW.start_time < end_time
          AND NEW.end_time > start_time
      )
      THEN RAISE(ABORT, 'ERR_RESERVATION_OVERLAP')
    END;

END;