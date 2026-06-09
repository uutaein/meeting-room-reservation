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