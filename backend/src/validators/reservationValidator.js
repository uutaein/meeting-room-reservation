export function validateCreateReservation(input) {
  const requiredFields = [
    "roomId",
    "reservationDate",
    "startTime",
    "endTime",
    "ownerName",
    "attendees",
    "purpose"
  ];

  for (const field of requiredFields) {
    if (
      input[field] === undefined ||
      input[field] === null ||
      input[field] === ""
    ) {
      throwProblem(400, "ERR_REQUIRED_FIELD", "필수 입력값이 누락되었습니다.");
    }
  }
}

function throwProblem(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
}