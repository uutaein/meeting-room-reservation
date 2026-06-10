const ROOM_LIMITS = {
  ROOM_1: 6,
  ROOM_2: 12
};

export function getRoomSuggestionMessage({
  dailyReservations,
  reservationDate,
  roomId,
  attendees,
  startTime,
  endTime,
  excludeReservationId = null
}) {
  const normalizedDate = String(reservationDate || "").trim();
  const normalizedRoomId = String(roomId || "").trim();
  const attendeeCount = Number(attendees);

  if (!normalizedDate || !normalizedRoomId || !startTime || !endTime) {
    return "";
  }

  if (!Number.isFinite(attendeeCount)) {
    return "";
  }

  const day = Array.isArray(dailyReservations)
    ? dailyReservations.find((item) => item.date === normalizedDate)
    : null;

  if (!day || !Array.isArray(day.reservations)) {
    return "";
  }

  const hasAnyReservationInTimeSlot = day.reservations.some((reservation) => {
    if (excludeReservationId && String(reservation.id) === String(excludeReservationId)) {
      return false;
    }

    return isTimeOverlap(
      startTime,
      endTime,
      reservation.startTime,
      reservation.endTime
    );
  });

  if (hasAnyReservationInTimeSlot) {
    return "";
  }

  if (normalizedRoomId === "ROOM_1" && attendeeCount > ROOM_LIMITS.ROOM_1) {
    return "인원이 많습니다, 가급적 회의실을 선택해주세요";
  }

  if (normalizedRoomId === "ROOM_2" && attendeeCount <= ROOM_LIMITS.ROOM_1) {
    return "인원이 적습니다, 가급적 서고를 선택해주세요";
  }

  return "";
}

function isTimeOverlap(startA, endA, startB, endB) {
  const startMinutesA = toMinutes(startA);
  const endMinutesA = toMinutes(endA);
  const startMinutesB = toMinutes(startB);
  const endMinutesB = toMinutes(endB);

  if (
    startMinutesA === null ||
    endMinutesA === null ||
    startMinutesB === null ||
    endMinutesB === null
  ) {
    return false;
  }

  return startMinutesA < endMinutesB && endMinutesA > startMinutesB;
}

function toMinutes(timeText) {
  const [hourText, minuteText] = String(timeText || "").split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return hour * 60 + minute;
}
