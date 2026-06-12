const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

Given("다음 예약이 등록되어 있다", async function (dataTable) {
  const row = dataTable.hashes()[0];

  const response = await fetch(`${BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      roomId: row.roomId,
      reservationDate: row.reservationDate,
      startTime: row.startTime,
      endTime: row.endTime,
      ownerName: row.ownerName,
      attendees: Number(row.attendees),
      purpose: row.purpose,
      contact: row.contact || "010-1234-5678"
    })
  });

  const body = await response.json();

  assert.strictEqual(
    response.status,
    201,
    `예약 사전 등록 실패: ${JSON.stringify(body)}`
  );

  this.reservation = body;
  this.reservationId = body.id;
});

When("사용자가 해당 예약을 취소하면", async function () {
  this.response = await fetch(`${BASE_URL}/reservations/${this.reservationId}/cancel`, {
    method: "PATCH"
  });

  this.responseBody = await this.response.json();
});

When("사용자가 존재하지 않는 예약을 취소하면", async function () {
  this.response = await fetch(`${BASE_URL}/reservations/999999/cancel`, {
    method: "PATCH"
  });

  this.responseBody = await this.response.json();
});

Given("취소된 예약이 존재한다", async function () {
  const response = await fetch(`${BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      roomId: "ROOM_1",
      reservationDate: "2026-06-10",
      startTime: "10:00",
      endTime: "11:00",
      ownerName: "김태인",
      attendees: 4,
      purpose: "회의준비",
      contact: "010-1234-5678"
    })
  });

  const body = await response.json();

  assert.strictEqual(
    response.status,
    201,
    `예약 사전 등록 실패: ${JSON.stringify(body)}`
  );

  this.reservationId = body.id;

  const cancelResponse = await fetch(`${BASE_URL}/reservations/${this.reservationId}/cancel`, {
    method: "PATCH"
  });

  const cancelBody = await cancelResponse.json();

  assert.strictEqual(
    cancelResponse.status,
    200,
    `예약 사전 취소 실패: ${JSON.stringify(cancelBody)}`
  );
});

When("사용자가 해당 예약을 다시 취소하면", async function () {
  this.response = await fetch(`${BASE_URL}/reservations/${this.reservationId}/cancel`, {
    method: "PATCH"
  });

  this.responseBody = await this.response.json();
});

Given("사용자가 해당 예약을 취소했다", async function () {
  const response = await fetch(`${BASE_URL}/reservations/${this.reservationId}/cancel`, {
    method: "PATCH"
  });

  const body = await response.json();

  assert.strictEqual(
    response.status,
    200,
    `예약 사전 취소 실패: ${JSON.stringify(body)}`
  );
});

When("사용자가 같은 회의실과 같은 시간으로 다시 예약하면", async function (dataTable) {
  const row = dataTable.hashes()[0];

  this.response = await fetch(`${BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      roomId: row.roomId,
      reservationDate: row.reservationDate,
      startTime: row.startTime,
      endTime: row.endTime,
      ownerName: row.ownerName,
      attendees: Number(row.attendees),
      purpose: row.purpose,
      contact: row.contact || "010-1234-5678"
    })
  });

  this.responseBody = await this.response.json();
});

Then("응답 상태코드는 201이어야 한다", function () {
  assert.strictEqual(
    this.response.status,
    201,
    `응답 상태코드 불일치: status=${this.response.status}, body=${JSON.stringify(this.responseBody)}`
  );
});

Then("응답 상태코드는 404이어야 한다", function () {
  assert.strictEqual(
    this.response.status,
    404,
    `응답 상태코드 불일치: status=${this.response.status}, body=${JSON.stringify(this.responseBody)}`
  );
});

Then("응답 상태코드는 409이어야 한다", function () {
  assert.strictEqual(
    this.response.status,
    409,
    `응답 상태코드 불일치: status=${this.response.status}, body=${JSON.stringify(this.responseBody)}`
  );
});

Then("예약 상태는 {string}이어야 한다", function (expectedStatus) {
  const actualStatus =
    this.responseBody.status ||
    this.responseBody.reservation?.status;

  assert.strictEqual(
    actualStatus,
    expectedStatus,
    `예약 상태 불일치: expected=${expectedStatus}, actual=${actualStatus}, body=${JSON.stringify(this.responseBody)}`
  );
});