const assert = require("assert");
const { Given, When, Then } = require("@cucumber/cucumber");

const API_BASE_URL = "http://localhost:3000";

const roomNameToId = {
  "회의실 1": "ROOM_1",
  "회의실 2": "ROOM_2"
};

Given("{word} {int}의 정원은 {int}명이다", function (roomType, roomNumber, capacity) {
  this.rooms = this.rooms ?? {};

  const roomName = `${roomType} ${roomNumber}`;
  const roomId = roomNameToId[roomName];

  assert.ok(roomId, `알 수 없는 회의실입니다: ${roomName}`);

  this.rooms[roomId] = {
    name: roomName,
    capacity
  };
});

Given(
  "{int}-{int}-{int} {int}:{int}부터 {int}:{int}까지 {word} {int}에 기존 예약이 없다",
  function (
    year,
    month,
    day,
    startHour,
    startMinute,
    endHour,
    endMinute,
    roomType,
    roomNumber
  ) {
    const roomName = `${roomType} ${roomNumber}`;
    const roomId = roomNameToId[roomName];

    assert.ok(roomId, `알 수 없는 회의실입니다: ${roomName}`);

    this.emptySlot = {
      reservationDate: `${year}-${pad(month)}-${pad(day)}`,
      startTime: `${pad(startHour)}:${pad(startMinute)}`,
      endTime: `${pad(endHour)}:${pad(endMinute)}`,
      roomId
    };
  }
);

When("사용자가 아래 정보로 예약을 생성한다", async function (dataTable) {
  const input = toObject(dataTable);

  const requestBody = {
    roomId: roomNameToId[input["회의실"]],
    reservationDate: input["예약일"],
    startTime: input["시작시간"],
    endTime: input["종료시간"],
    ownerName: input["예약자명"],
    attendees: Number(input["참석인원"]),
    purpose: input["회의목적"]
  };

  this.requestBody = requestBody;

  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  this.response = response;
  this.responseBody = await response.json();
});

Then("예약 생성은 성공해야 한다", function () {
  assert.strictEqual(this.response.status, 201);
});

Then("예약 상태는 {string} 여야 한다", function (expectedStatus) {
  assert.strictEqual(this.responseBody.status, expectedStatus);
});

Then(
  "예약 현황에서 {word} {int}의 {int}:{int}~{int}:{int} 예약이 조회되어야 한다",
  function (
    roomType,
    roomNumber,
    startHour,
    startMinute,
    endHour,
    endMinute
  ) {
    const roomName = `${roomType} ${roomNumber}`;
    const expectedRoomId = roomNameToId[roomName];

    assert.strictEqual(this.responseBody.roomId, expectedRoomId);
    assert.strictEqual(this.responseBody.startTime, `${pad(startHour)}:${pad(startMinute)}`);
    assert.strictEqual(this.responseBody.endTime, `${pad(endHour)}:${pad(endMinute)}`);
    assert.strictEqual(this.responseBody.status, "ACTIVE");
  }
);

function toObject(dataTable) {
  const rows = dataTable.raw();
  const result = {};

  for (const [key, value] of rows) {
    result[key.trim()] = String(value ?? "").trim();
  }

  return result;
}

function pad(value) {
  return String(value).padStart(2, "0");
}