import { getDb } from "../db/connection.js";

export function saveReservation(input) {
  const db = getDb();

  const insert = db.prepare(`
    INSERT INTO reservations (
      room_id,
      reservation_date,
      start_time,
      end_time,
      owner_name,
      attendees,
      purpose,
      status
    )
    VALUES (
      @roomId,
      @reservationDate,
      @startTime,
      @endTime,
      @ownerName,
      @attendees,
      @purpose,
      'ACTIVE'
    )
  `);

  const result = insert.run({
    roomId: input.roomId,
    reservationDate: input.reservationDate,
    startTime: input.startTime,
    endTime: input.endTime,
    ownerName: input.ownerName,
    attendees: input.attendees,
    purpose: input.purpose
  });

  return findReservationById(result.lastInsertRowid);
}

export function findRoomById(roomId) {
  const db = getDb();

  return db
    .prepare(`
      SELECT
        id,
        name,
        capacity,
        is_active
      FROM rooms
      WHERE id = ?
    `)
    .get(roomId);
}

export function findReservationById(id) {
  const db = getDb();

  const row = db
    .prepare(`
      SELECT
        id,
        room_id,
        reservation_date,
        start_time,
        end_time,
        owner_name,
        attendees,
        purpose,
        status,
        created_at,
        updated_at
      FROM reservations
      WHERE id = ?
    `)
    .get(id);

  if (!row) {
    return null;
  }

  return toReservation(row);
}

function toReservation(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    reservationDate: row.reservation_date,
    startTime: row.start_time,
    endTime: row.end_time,
    ownerName: row.owner_name,
    attendees: row.attendees,
    purpose: row.purpose,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function existsOverlappingReservation(input) {
  const db = getDb();

  const row = db
    .prepare(`
      SELECT 1
      FROM reservations
      WHERE room_id = @roomId
        AND reservation_date = @reservationDate
        AND status = 'ACTIVE'
        AND @startTime < end_time
        AND @endTime > start_time
      LIMIT 1
    `)
    .get({
      roomId: input.roomId,
      reservationDate: input.reservationDate,
      startTime: input.startTime,
      endTime: input.endTime
    });

  return Boolean(row);
}

export function findReservationsByDate(date) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id,
      room_id AS roomId,
      reservation_date AS reservationDate,
      start_time AS startTime,
      end_time AS endTime,
      owner_name AS ownerName,
      attendees,
      purpose,
      status
    FROM reservations
    WHERE reservation_date = ?
      AND status = 'ACTIVE'
    ORDER BY start_time ASC, room_id ASC
  `);

  return stmt.all(date);
}

export function deleteAllReservations() {
  const db = getDb();
  const stmt = db.prepare(`
    DELETE FROM reservations
  `);

  stmt.run();
}