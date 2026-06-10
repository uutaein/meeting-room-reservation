import {
  validateCreateReservation,
  validateListReservationQuery
} from "../validators/reservationValidator.js";

import {
  saveReservation,
  findRoomById,
  existsOverlappingReservation,
  findReservationsByDate,
  findReservationById,
  cancelReservationById,
  updateReservationById,
  existsOverlappingReservationExceptSelf
} from "../repositories/reservationRepository.js";

export function createReservation(input) {
  validateCreateReservation(input);
  validateRoomCapacity(input.roomId, input.attendees);
  validateReservationOverlap(input);

  return saveReservation(input);
}

export function listReservations(query) {
  validateListReservationQuery(query);

  return findReservationsByDate(query.date);
}

function validateRoomCapacity(roomId, attendees) {
  const room = findRoomById(roomId);

  if (!room || room.is_active !== 1) {
    throwProblem(
      400,
      "ERR_INVALID_ROOM",
      "존재하지 않거나 사용할 수 없는 회의실입니다."
    );
  }

  if (attendees > room.capacity) {
    throwProblem(
      400,
      "ERR_CAPACITY_EXCEEDED",
      "참석 인원이 회의실 정원을 초과했습니다."
    );
  }
}

function validateReservationOverlap(input) {
  if (existsOverlappingReservation(input)) {
    throwProblem(
      409,
      "ERR_RESERVATION_OVERLAP",
      "같은 회의실에 겹치는 예약이 이미 존재합니다."
    );
  }
}

function throwProblem(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.errorCode = code;
  throw error;
}

export function cancelReservation(id) {
  const reservationId = Number(id);

  if (!Number.isInteger(reservationId) || reservationId < 1) {
    throwProblem(
      404,
      "ERR_RESERVATION_NOT_FOUND",
      "존재하지 않는 예약입니다."
    );
  }

  const reservation = findReservationById(reservationId);

  if (!reservation) {
    throwProblem(
      404,
      "ERR_RESERVATION_NOT_FOUND",
      "존재하지 않는 예약입니다."
    );
  }

  if (reservation.status === "CANCELLED") {
    throwProblem(
      409,
      "ERR_ALREADY_CANCELLED",
      "이미 취소된 예약입니다."
    );
  }

  return cancelReservationById(reservationId);
}

// feature/reservation-update
export function updateReservation(id, input) {
  const existingReservation = findReservationById(id);

  if (!existingReservation) {
    const error = new Error("예약을 찾을 수 없습니다.");
    error.statusCode = 404;
    error.code = "ERR_RESERVATION_NOT_FOUND";
    throw error;
  }

  if (existingReservation.status === "CANCELLED") {
    const error = new Error("이미 취소된 예약은 수정할 수 없습니다.");
    error.statusCode = 409;
    error.code = "ERR_CANCELLED_RESERVATION_NOT_EDITABLE";
    throw error;
  }

  validateCreateReservation(input);
  validateRoomCapacity(input.roomId, input.attendees);

  const hasOverlap = existsOverlappingReservationExceptSelf(id, input);

  if (hasOverlap) {
    const error = new Error("이미 해당 시간에 예약이 존재합니다.");
    error.statusCode = 409;
    error.code = "ERR_RESERVATION_OVERLAP";
    throw error;
  }

  return updateReservationById(id, input);
}