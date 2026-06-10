const REQUIRED_FIELDS = [
  "roomId",
  "reservationDate",
  "startTime",
  "endTime",
  "ownerName",
  "attendees",
  "purpose"
];

const VALID_ROOM_IDS = ["ROOM_1", "ROOM_2"];

export function validateCreateReservation(input) {
  validateRequiredFields(input);
  validateRoomId(input.roomId);
  validateOwnerName(input.ownerName);
  validatePurpose(input.purpose);
  validateAttendees(input.attendees);
  validateTimeFormat(input.startTime, input.endTime);
  // validateTimeUnit(input.startTime, input.endTime);
  validateTimeOrder(input.startTime, input.endTime);
  validateDuration(input.startTime, input.endTime);
  validateBusinessHours(input.startTime, input.endTime);
  validateContact(input.contact);
}

export function validateListReservationQuery(query) {
  if (!query.date) {
    throwProblem(
      400,
      "ERR_REQUIRED_FIELD",
      "조회 날짜는 필수입니다."
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(query.date)) {
    throwProblem(
      400,
      "ERR_DATE_FORMAT",
      "조회 날짜는 YYYY-MM-DD 형식이어야 합니다."
    );
  }
}

function validateRequiredFields(input) {
  for (const field of REQUIRED_FIELDS) {
    if (
      input[field] === undefined ||
      input[field] === null ||
      String(input[field]).trim() === ""
    ) {
      throwProblem(
        400,
        "ERR_REQUIRED_FIELD",
        "필수 입력값이 누락되었습니다."
      );
    }
  }
}

function validateRoomId(roomId) {
  if (!VALID_ROOM_IDS.includes(roomId)) {
    throwProblem(
      400,
      "ERR_INVALID_ROOM",
      "존재하지 않는 회의실입니다."
    );
  }
}

function validateOwnerName(ownerName) {
  const value = String(ownerName).trim();

  if (value.length < 2 || value.length > 6) {
    throwProblem(
      400,
      "ERR_OWNER_NAME_LENGTH",
      "예약자명은 2자 이상 6자 이하로 입력해야 합니다."
    );
  }
}

function validatePurpose(purpose) {
  const value = String(purpose).trim();

  if (value.length > 30) {
    throwProblem(
      400,
      "ERR_PURPOSE_LENGTH",
      "회의목적은 30자 이내로 입력해야 합니다."
    );
  }
}

function validateAttendees(attendees) {
  if (!Number.isInteger(attendees)) {
    throwProblem(
      400,
      "ERR_ATTENDEES_INVALID",
      "참석 인원은 정수여야 합니다."
    );
  }

  if (attendees < 1 || attendees > 12) {
    throwProblem(
      400,
      "ERR_ATTENDEES_RANGE",
      "참석 인원은 1명 이상 12명 이하로 입력해야 합니다."
    );
  }
}

function validateTimeFormat(startTime, endTime) {
  const timePattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
    throwProblem(
      400,
      "ERR_TIME_FORMAT",
      "시간은 HH:mm 형식이어야 합니다."
    );
  }
}

function validateTimeUnit(startTime, endTime) {
  const startMinute = getMinute(startTime);
  const endMinute = getMinute(endTime);

  if (!isThirtyMinuteUnit(startMinute) || !isThirtyMinuteUnit(endMinute)) {
    throwProblem(
      400,
      "ERR_TIME_UNIT",
      "예약 시간은 30분 단위여야 합니다."
    );
  }
}

function validateTimeOrder(startTime, endTime) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (end <= start) {
    throwProblem(
      400,
      "ERR_TIME_ORDER",
      "종료시간은 시작시간보다 늦어야 합니다."
    );
  }
}

function validateDuration(startTime, endTime) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const duration = end - start;

  if (duration > 120) {
    throwProblem(
      400,
      "ERR_DURATION_MAX",
      "1회 예약은 최대 2시간까지 가능합니다."
    );
  }
}

function validateBusinessHours(startTime, endTime) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  const businessStart = toMinutes("08:00");
  const businessEnd = toMinutes("20:00");

  if (start < businessStart || end > businessEnd) {
    throwProblem(
      400,
      "ERR_BUSINESS_HOURS",
      "예약 가능 시간은 08:00부터 20:00까지입니다."
    );
  }
}

function toMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getMinute(time) {
  return Number(time.split(":")[1]);
}

function isThirtyMinuteUnit(minute) {
  return minute === 0 || minute === 30;
}

function throwProblem(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.errorCode = code;
  throw error;
}

function validateContact(contact) {
  if (contact === undefined || contact === null || String(contact).trim() === "") {
    return;
  }
  const value = String(contact).trim();
  if (!/^[0-9-]+$/.test(value)) {
    throwProblem(
      400,
      "ERR_CONTACT_FORMAT",
      "연락처는 숫자와 하이픈(-)만 입력할 수 있습니다."
    );
  }
}