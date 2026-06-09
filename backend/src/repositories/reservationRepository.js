let sequence = 1;
const reservations = [];

export function saveReservation(input) {
  const now = new Date().toISOString();

  const reservation = {
    id: sequence++,
    roomId: input.roomId,
    reservationDate: input.reservationDate,
    startTime: input.startTime,
    endTime: input.endTime,
    ownerName: input.ownerName,
    attendees: input.attendees,
    purpose: input.purpose,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now
  };

  reservations.push(reservation);

  return reservation;
}