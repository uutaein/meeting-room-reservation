const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

function getReservationList(body) {
  if (Array.isArray(body)) {
    return body;
  }

  if (Array.isArray(body.reservations)) {
    return body.reservations;
  }

  return [];
}

Given("다음 예약들이 등록되어 있다", async function (dataTable) {
  const rows = dataTable.hashes();

  for (const row of rows) {
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
        purpose: row.purpose
      })
    });

    const body = await response.json();

    assert.strictEqual(
      response.status,
      201,
      `예약 사전 등록 실패: ${JSON.stringify(body)}`
    );
  }
});

Given("등록된 예약이 없다", function () {
  // features/support/hooks.js에서 Scenario마다 /test/reset을 호출하고 있다면 no-op으로 충분하다.
});

When("사용자가 {string} 날짜의 예약 목록을 조회하면", async function (date) {
  this.response = await fetch(`${BASE_URL}/reservations?date=${date}`);
  this.responseBody = await this.response.json();
});

When("사용자가 날짜 없이 예약 목록을 조회하면", async function () {
  this.response = await fetch(`${BASE_URL}/reservations`);
  this.responseBody = await this.response.json();
});

Then("응답 상태코드는 200이어야 한다", function () {
  assert.strictEqual(
    this.response.status,
    200,
    `응답 상태코드 불일치: status=${this.response.status}, body=${JSON.stringify(this.responseBody)}`
  );
});

Then("응답 상태코드는 400이어야 한다", function () {
  assert.strictEqual(
    this.response.status,
    400,
    `응답 상태코드 불일치: status=${this.response.status}, body=${JSON.stringify(this.responseBody)}`
  );
});
Then("예약 목록은 2건이어야 한다", function () {
  const reservations = getReservationList(this.responseBody);
  assert.strictEqual(reservations.length, 2);
});

Then("예약 목록은 0건이어야 한다", function () {
  const reservations = getReservationList(this.responseBody);
  assert.strictEqual(reservations.length, 0);
});

Then("예약 목록은 시작 시간 오름차순이어야 한다", function () {
  const reservations = getReservationList(this.responseBody);
  const startTimes = reservations.map((reservation) => reservation.startTime);

  const sortedStartTimes = [...startTimes].sort();

  assert.deepStrictEqual(startTimes, sortedStartTimes);
});

Then("오류 코드는 {string}이어야 한다", function (expectedErrorCode) {
  assert.strictEqual(this.responseBody.errorCode, expectedErrorCode);
});