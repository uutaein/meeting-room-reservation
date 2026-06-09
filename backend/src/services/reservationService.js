import { validateCreateReservation } from "../validators/reservationValidator.js";
import { saveReservation } from "../repositories/reservationRepository.js";

export function createReservation(input) {
  validateCreateReservation(input);

  const reservation = saveReservation(input);

  return reservation;
}