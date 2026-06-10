import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

let response;
let responseBody;
let existingReservation;
let targetReservation;

Given("기존 예약이 등록되어 있다", async function () {
  existingReservation = await createReservation({
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "10:00",
    endTime: "11:00",
    ownerName: "김태인",
    attendees: 3,
    purpose: "기존 회의"
  });
});

Given("기존 예약이 취소되어 있다", async function () {
  existingReservation = await createReservation({
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "10:00",
    endTime: "11:00",
    ownerName: "김태인",
    attendees: 3,
    purpose: "취소 대상 회의"
  });

  await cancelReservation(existingReservation.id);
});

Given("같은 회의실에 기존 예약이 등록되어 있다", async function () {
  existingReservation = await createReservation({
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "10:00",
    endTime: "11:00",
    ownerName: "김태인",
    attendees: 3,
    purpose: "이미 잡힌 회의"
  });
});

Given("수정 대상 예약이 등록되어 있다", async function () {
  targetReservation = await createReservation({
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "11:00",
    endTime: "12:00",
    ownerName: "이수정",
    attendees: 2,
    purpose: "수정 대상 회의"
  });
});

Given("회의실 1에 기존 예약이 등록되어 있다", async function () {
  existingReservation = await createReservation({
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "10:00",
    endTime: "11:00",
    ownerName: "김태인",
    attendees: 3,
    purpose: "정원 검증 회의"
  });
});

When("사용자가 예약 정보를 수정한다", async function () {
  await updateReservation(existingReservation.id, {
    roomId: "ROOM_2",
    reservationDate: "2026-06-15",
    startTime: "13:00",
    endTime: "14:00",
    ownerName: "김태인",
    attendees: 5,
    purpose: "수정된 회의"
  });
});

When("사용자가 존재하지 않는 예약을 수정한다", async function () {
  await updateReservation(999999, {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "10:00",
    endTime: "11:00",
    ownerName: "김태인",
    attendees: 3,
    purpose: "존재하지 않는 예약 수정"
  });
});

When("사용자가 해당 예약을 수정한다", async function () {
  await updateReservation(existingReservation.id, {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "13:00",
    endTime: "14:00",
    ownerName: "김태인",
    attendees: 3,
    purpose: "취소된 예약 수정 시도"
  });
});

When("사용자가 수정 대상 예약을 기존 예약 시간과 겹치게 수정한다", async function () {
  await updateReservation(targetReservation.id, {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "10:30",
    endTime: "11:30",
    ownerName: "이수정",
    attendees: 2,
    purpose: "겹치는 시간으로 수정"
  });
});

When("사용자가 같은 시간으로 목적만 수정한다", async function () {
  await updateReservation(existingReservation.id, {
    roomId: existingReservation.roomId,
    reservationDate: existingReservation.reservationDate,
    startTime: existingReservation.startTime,
    endTime: existingReservation.endTime,
    ownerName: existingReservation.ownerName,
    attendees: existingReservation.attendees,
    purpose: "목적만 수정된 회의"
  });
});

When("사용자가 참석 인원을 7명으로 수정한다", async function () {
  await updateReservation(existingReservation.id, {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "10:00",
    endTime: "11:00",
    ownerName: "김태인",
    attendees: 7,
    purpose: "정원 초과 수정"
  });
});

Then("응답 상태 코드는 {int}이다", function (expectedStatusCode) {
  assert.equal(response.status, expectedStatusCode);
});

Then("오류 코드는 {string}이다", function (expectedErrorCode) {
  assert.equal(getErrorCode(responseBody), expectedErrorCode);
});

Then("수정된 예약 정보가 반환된다", function () {
  const reservation = getReservationFromBody(responseBody);

  assert.equal(reservation.roomId, "ROOM_2");
  assert.equal(reservation.reservationDate, "2026-06-15");
  assert.equal(reservation.startTime, "13:00");
  assert.equal(reservation.endTime, "14:00");
  assert.equal(reservation.ownerName, "김태인");
  assert.equal(reservation.attendees, 5);
  assert.equal(reservation.purpose, "수정된 회의");
  assert.equal(reservation.status, "ACTIVE");
});

Then("수정된 목적이 반환된다", function () {
  const reservation = getReservationFromBody(responseBody);

  assert.equal(reservation.purpose, "목적만 수정된 회의");
  assert.equal(reservation.roomId, "ROOM_1");
  assert.equal(reservation.reservationDate, "2026-06-15");
  assert.equal(reservation.startTime, "10:00");
  assert.equal(reservation.endTime, "11:00");
});

async function createReservation(input) {
  const createResponse = await fetch(`${API_BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const body = await createResponse.json();

  if (!createResponse.ok) {
    throw new Error(
      `테스트 예약 생성 실패: ${createResponse.status} ${JSON.stringify(body)}`
    );
  }

  return getReservationFromBody(body);
}

async function updateReservation(id, input) {
  response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  responseBody = await response.json();
}

async function cancelReservation(id) {
  const cancelResponse = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
    method: "PATCH"
  });

  const body = await cancelResponse.json();

  if (!cancelResponse.ok) {
    throw new Error(
      `테스트 예약 취소 실패: ${cancelResponse.status} ${JSON.stringify(body)}`
    );
  }

  return getReservationFromBody(body);
}

function getReservationFromBody(body) {
  return body.reservation || body.data || body;
}

function getErrorCode(body) {
  return body.code || body.errorCode || body.error?.code;
}