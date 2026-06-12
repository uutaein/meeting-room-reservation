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
      contact,
      status,
      recurring_group_id,
      recurring_title,
      repeat_type,
      repeat_weekday,
      repeat_start_date,
      repeat_end_month
    )
    VALUES (
      @roomId,
      @reservationDate,
      @startTime,
      @endTime,
      @ownerName,
      @attendees,
      @purpose,
      @contact,
      'ACTIVE',
      @recurringGroupId,
      @recurringTitle,
      @repeatType,
      @repeatWeekday,
      @repeatStartDate,
      @repeatEndMonth
    )
  `);

  const result = insert.run({
    roomId: input.roomId,
    reservationDate: input.reservationDate,
    startTime: input.startTime,
    endTime: input.endTime,
    ownerName: input.ownerName,
    attendees: input.attendees,
    purpose: input.purpose,
    contact: input.contact || "",
    recurringGroupId: input.recurringGroupId || null,
    recurringTitle: input.recurringTitle || null,
    repeatType: input.repeatType || null,
    repeatWeekday: input.repeatWeekday || null,
    repeatStartDate: input.repeatStartDate || null,
    repeatEndMonth: input.repeatEndMonth || null
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
        contact,
        status,
        recurring_group_id,
        recurring_title,
        repeat_type,
        repeat_weekday,
        repeat_start_date,
        repeat_end_month,
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
    contact: row.contact,
    status: row.status,
    recurringGroupId: row.recurring_group_id,
    recurringTitle: row.recurring_title,
    repeatType: row.repeat_type,
    repeatWeekday: row.repeat_weekday,
    repeatStartDate: row.repeat_start_date,
    repeatEndMonth: row.repeat_end_month,
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
      contact,
      status,
      recurring_group_id AS recurringGroupId,
      recurring_title AS recurringTitle,
      repeat_type AS repeatType,
      repeat_weekday AS repeatWeekday,
      repeat_start_date AS repeatStartDate,
      repeat_end_month AS repeatEndMonth
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

// PATCH /reservations/{id}/cancel
export function cancelReservationById(id) {
  const db = getDb();

  const result = db
    .prepare(`
      UPDATE reservations
      SET
        status = 'CANCELLED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(id);

  if (result.changes === 0) {
    return null;
  }

  return findReservationById(id);
}

// feature/reservation-update
export function updateReservationById(id, input) {
  const db = getDb();

  const result = db
    .prepare(`
      UPDATE reservations
      SET
        room_id = ?,
        reservation_date = ?,
        start_time = ?,
        end_time = ?,
        owner_name = ?,
        attendees = ?,
        purpose = ?,
        contact = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(
      input.roomId,
      input.reservationDate,
      input.startTime,
      input.endTime,
      input.ownerName,
      input.attendees,
      input.purpose,
      input.contact || "",
      id
    );

  if (result.changes === 0) {
    return null;
  }

  return findReservationById(id);
}

export function existsOverlappingReservationExceptSelf(id, input) {
  const db = getDb();

  const row = db
    .prepare(`
      SELECT 1
      FROM reservations
      WHERE id <> ?
        AND room_id = ?
        AND reservation_date = ?
        AND status = 'ACTIVE'
        AND ? < end_time
        AND ? > start_time
      LIMIT 1
    `)
    .get(
      id,
      input.roomId,
      input.reservationDate,
      input.startTime,
      input.endTime
    );

  return Boolean(row);
}

export function findReservationsByGroupId(groupId) {
  const db = getDb();
  const rows = db
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
        contact,
        status,
        recurring_group_id,
        recurring_title,
        repeat_type,
        repeat_weekday,
        repeat_start_date,
        repeat_end_month,
        created_at,
        updated_at
      FROM reservations
      WHERE recurring_group_id = ?
      ORDER BY reservation_date ASC
    `)
    .all(groupId);

  return rows.map(toReservation);
}

export function updateRecurringReservations(groupId, startDate, input) {
  const db = getDb();
  
  // 트랜잭션 내부에서 개별 업데이트할 수도 있지만, repository 레벨은 단순 쿼리 실행을 지원함.
  // 서비스 레벨에서 트랜잭션을 켜고 여러 번 호출하거나, 여기서 한 번에 업데이트.
  // 이 날짜 이후의 해당 그룹 예약 목록 조회
  const rows = db
    .prepare(`
      SELECT id, reservation_date
      FROM reservations
      WHERE recurring_group_id = ?
        AND reservation_date >= ?
        AND status = 'ACTIVE'
    `)
    .all(groupId, startDate);

  const stmt = db.prepare(`
    UPDATE reservations
    SET
      room_id = ?,
      start_time = ?,
      end_time = ?,
      owner_name = ?,
      attendees = ?,
      purpose = ?,
      contact = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  for (const row of rows) {
    stmt.run(
      input.roomId,
      input.startTime,
      input.endTime,
      input.ownerName,
      input.attendees,
      input.purpose,
      input.contact || "",
      row.id
    );
  }

  return rows.length;
}

export function cancelRecurringReservations(groupId, startDate) {
  const db = getDb();
  
  const result = db
    .prepare(`
      UPDATE reservations
      SET
        status = 'CANCELLED',
        updated_at = CURRENT_TIMESTAMP
      WHERE recurring_group_id = ?
        AND reservation_date >= ?
        AND status = 'ACTIVE'
    `)
    .run(groupId, startDate);

  return result.changes;
}

