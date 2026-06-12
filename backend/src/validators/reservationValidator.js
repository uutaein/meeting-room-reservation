import { getMockTime } from "../routes/testRoutes.js";

const REQUIRED_FIELDS = [
  "roomId",
  "reservationDate",
  "startTime",
  "endTime",
  "ownerName",
  "attendees",
  "purpose",
  "contact"
];

const VALID_ROOM_IDS = ["ROOM_1", "ROOM_2"];

export function validateCreateReservation(input) {
  validateRequiredFields(input);
  validateRoomId(input.roomId);
  validateOwnerName(input.ownerName);
  validatePurpose(input.purpose);
  validateAttendees(input.attendees);
  validateTimeFormat(input.startTime, input.endTime);
  validateTimeOrder(input.startTime, input.endTime);
  validateDuration(input.startTime, input.endTime);
  validateBusinessHours(input.startTime, input.endTime);
  validateContact(input.contact);
  if (!isValidDateFormatAndValue(input.reservationDate)) {
    throwProblem(
      400,
      "ERR_DATE_FORMAT",
      "예약일은 YYYY-MM-DD 형식의 유효한 날짜이어야 합니다."
    );
  }
  validateStartDateTime(input.reservationDate, input.startTime);
}

function validateStartDateTime(reservationDate, startTime) {
  let now = new Date();

  if (process.env.NODE_ENV === 'test') {
    const mockTimeStr = getMockTime();
    if (mockTimeStr) {
      now = new Date(mockTimeStr);
    } else {
      return;
    }
  }

  // KST (UTC +9) 변환 계산
  const tzOffset = 9 * 60 * 60 * 1000;
  const localTime = new Date(now.getTime() + tzOffset);
  const isoStr = localTime.toISOString();
  const todayStr = isoStr.substring(0, 10);
  const currentBaseTimeStr = isoStr.substring(11, 16);

  if (reservationDate < todayStr) {
    throwProblem(
      400,
      "ERR_RESERVATION_START_PASSED",
      "이미 지난 날짜나 시간에는 예약할 수 없습니다."
    );
  }

  if (reservationDate === todayStr && startTime <= currentBaseTimeStr) {
    throwProblem(
      400,
      "ERR_RESERVATION_START_PASSED",
      "이미 지난 날짜나 시간에는 예약할 수 없습니다."
    );
  }
}

export function validateListReservationQuery(query) {
  if (!query.date) {
    throwProblem(
      400,
      "ERR_REQUIRED_FIELD",
      "조회 날짜는 필수입니다."
    );
  }

  if (!isValidDateFormatAndValue(query.date)) {
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

  if (attendees < 1) {
    throwProblem(
      400,
      "ERR_ATTENDEES_RANGE",
      "참석 인원은 1명 이상이어야 합니다."
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
      "예약 시간은 1분 단위여야 합니다."
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
  const value = String(contact).trim();

  if (value.length === 0) {
    throwProblem(
      400,
      "ERR_REQUIRED_FIELD",
      "필수 입력값이 누락되었습니다."
    );
  }

  if (!/^[0-9-]+$/.test(value)) {
    throwProblem(
      400,
      "ERR_CONTACT_FORMAT",
      "연락처는 숫자와 하이픈(-)만 입력할 수 있습니다."
    );
  }
}

export function validateCreateRecurringReservation(input, isSubmit = true) {
  // 1. 반복 제목 필수 검증
  if (!input.recurringTitle || String(input.recurringTitle).trim() === "") {
    throwProblem(400, "ERR_REC_TITLE_REQUIRED", "반복 예약 제목을 입력하세요.");
  }

  // 2. 종료월 필수 검증
  if (!input.endMonth || String(input.endMonth).trim() === "") {
    throwProblem(400, "ERR_REC_END_MONTH_REQUIRED", "반복 종료월을 입력하세요.");
  }

  // 3. 종료월 형식 검증 (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(input.endMonth)) {
    throwProblem(400, "ERR_REC_END_MONTH_FORMAT", "반복 종료월은 YYYY-MM 형식이어야 합니다.");
  }

  const [endYear, endMonthNum] = input.endMonth.split("-").map(Number);
  if (endMonthNum < 1 || endMonthNum > 12) {
    throwProblem(400, "ERR_REC_END_MONTH_FORMAT", "반복 종료월은 YYYY-MM 형식의 유효한 월이어야 합니다.");
  }

  // 4. 시작일 형식 및 필수 검증
  if (!input.reservationDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.reservationDate)) {
    throwProblem(400, "ERR_REQUIRED_FIELD", "시작일이 올바르지 않습니다.");
  }

  if (!isValidDateFormatAndValue(input.reservationDate)) {
    throwProblem(400, "ERR_DATE_FORMAT", "시작일은 YYYY-MM-DD 형식의 유효한 날짜이어야 합니다.");
  }

  // 5. 종료월이 시작일의 월보다 빠른지 검증
  const startYearMonth = input.reservationDate.substring(0, 7); // YYYY-MM
  if (input.endMonth < startYearMonth) {
    throwProblem(400, "ERR_REC_END_MONTH_BEFORE_START", "반복 종료월은 시작월보다 빠를 수 없습니다.");
  }

  // 첫 회차 시작 일시 검증 (미리보기 및 생성 시 모두 적용)
  validateStartDateTime(input.reservationDate, input.startTime);

  if (isSubmit) {
    const tempInput = {
      roomId: input.roomId,
      reservationDate: input.reservationDate,
      startTime: input.startTime,
      endTime: input.endTime,
      ownerName: input.ownerName,
      attendees: input.attendees,
      purpose: input.purpose,
      contact: input.contact
    };
    validateCreateReservation(tempInput);
  } else {
    // 미리보기 시 최소한의 룸/시간 포맷 및 정책 검증 진행
    validateRoomId(input.roomId);
    validateTimeFormat(input.startTime, input.endTime);
    validateTimeOrder(input.startTime, input.endTime);
    validateDuration(input.startTime, input.endTime);
    validateBusinessHours(input.startTime, input.endTime);
  }
}

function isValidDateFormatAndValue(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  if (month < 1 || month > 12) return false;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  
  return true;
}

