import {
  validateCreateReservation,
  validateListReservationQuery
} from "../validators/reservationValidator.js";

import {
  saveReservation,
  findRoomById,
  existsOverlappingReservation,
  findReservationsByDate
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