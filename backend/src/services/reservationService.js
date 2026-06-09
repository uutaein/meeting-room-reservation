import { validateCreateReservation } from "../validators/reservationValidator.js";
import { saveReservation, findRoomById } from "../repositories/reservationRepository.js";

export function createReservation(input) {
  validateCreateReservation(input);
  validateRoomCapacity(input.roomId, input.attendees);

  const reservation = saveReservation(input);

  return reservation;
}

function validateRoomCapacity(roomId, attendees) {
  const room = findRoomById(roomId);

  if (!room || room.is_active !== 1) {
    throwProblem(400, "ERR_INVALID_ROOM", "존재하지 않거나 사용할 수 없는 회의실입니다.");
  }

  if (attendees > room.capacity) {
    throwProblem(
      400,
      "ERR_CAPACITY_EXCEEDED",
      "참석 인원이 회의실 정원을 초과했습니다."
    );
  }
}

function throwProblem(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
}