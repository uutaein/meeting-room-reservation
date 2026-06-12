const assert = require("assert");
const { Given, When, Then } = require("@cucumber/cucumber");

const API_BASE_URL = "http://localhost:3000";

const roomNameToId = {
  "회의실 1": "ROOM_1",
  "회의실 2": "ROOM_2"
};

// 1. 기존 예약이 없다 스텝 (정규식 사용, 인자 11개 수신)
Given(
  /^회의실 1에 (\d+)-(\d+)-(\d+)부터 (\d+)-(\d+)-(\d+)까지 매주 (\S+) (\d+):(\d+)부터 (\d+):(\d+)까지 기존 예약이 없다$/,
  function (y1, m1, d1, y2, m2, d2, weekday, sh, smin, eh, emin) {
    // Hooks에서 reset하므로 패스
  }
);

// 2. 주간 반복 예약 생성
When("사용자가 아래 정보로 주간 반복 예약을 생성한다", async function (dataTable) {
  const rows = dataTable.raw();
  const input = {};
  for (const [key, value] of rows) {
    input[key.trim()] = String(value ?? "").trim();
  }

  const requestBody = {
    roomId: roomNameToId[input["회의실"]],
    reservationDate: input["시작일"],
    startTime: input["시작시간"],
    endTime: input["종료시간"],
    endMonth: input["종료월"],
    ownerName: input["예약자명"],
    attendees: Number(input["참석인원"]),
    purpose: input["회의목적"],
    contact: input["연락처"],
    createAvailableOnly: false
  };

  this.lastRequestBody = requestBody;

  const response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  this.response = response;
  this.responseBody = await response.json();
});

Then("주간 반복 예약 생성은 성공해야 한다", function () {
  assert.strictEqual(this.response.status, 201);
});

Then("생성된 반복 예약 회차는 {int}건이어야 한다", function (expectedCount) {
  assert.ok(this.responseBody.reservations);
  assert.strictEqual(this.responseBody.reservations.length, expectedCount);
});

Then("반복 예약 회차는 아래 날짜에 생성되어야 한다", function (dataTable) {
  const expectedDates = dataTable.hashes().map(h => h["예약일"]);
  const actualDates = this.responseBody.reservations.map(r => r.reservationDate);
  
  assert.strictEqual(actualDates.length, expectedDates.length);
  for (let i = 0; i < expectedDates.length; i++) {
    assert.strictEqual(actualDates[i], expectedDates[i]);
  }
});

Given("사용자가 주간 반복 예약 생성을 선택했다", function () {
  this.isRecurringSelected = true;
});

// 3. 시작일 변경 시 (정규식)
When(/^사용자가 시작일을 ([\d-]+)로 선택한다$/, function (dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  this.calculatedWeekday = dayNames[date.getDay()];
});

Then("반복 요일 기본값은 수요일이어야 한다", function () {
  assert.strictEqual(this.calculatedWeekday, "수요일");
});

// 4. 시작일과 종료월 입력 (정규식, 조사 [을를] 대응)
When(/^사용자가 시작일 ([\d-]+)와 종료월 ([\d-]+)[을를] 입력한다$/, async function (startDate, endMonth) {
  // Preview API 호출
  const previewResponse = await fetch(`${API_BASE_URL}/reservations/recurring/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      roomId: "ROOM_1",
      reservationDate: startDate,
      startTime: "09:00",
      endTime: "10:00",
      endMonth: endMonth,
      ownerName: "김철수",
      attendees: 5,
      purpose: "주간 정례회의",
      contact: "010-1234-5678"
    })
  });
  
  this.previewResponse = previewResponse;
  this.previewResponseBody = await previewResponse.json();

  // Create API 호출 (실패 시나리오 검증용)
  const createResponse = await fetch(`${API_BASE_URL}/reservations/recurring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      roomId: "ROOM_1",
      reservationDate: startDate,
      startTime: "09:00",
      endTime: "10:00",
      endMonth: endMonth,
      ownerName: "김철수",
      attendees: 5,
      purpose: "주간 정례회의",
      contact: "010-1234-5678"
    })
  });

  this.response = createResponse;
  this.responseBody = await createResponse.json();
});

Then("시스템은 예상 생성 건수 {int}건을 표시해야 한다", function (expectedCount) {
  assert.strictEqual(this.previewResponseBody.totalCount, expectedCount);
});

Then("시스템은 생성 예정 날짜 목록을 표시해야 한다", function () {
  assert.ok(this.previewResponseBody.occurrences);
});

Then(/^생성 예정 날짜에는 ([\d-]+)이 포함되어야 한다$/, function (expectedDate) {
  assert.ok(this.previewResponseBody.occurrences.includes(expectedDate));
});

// 5. 미리보기 확인 (정규식)
When(
  /^사용자가 회의실 1에 ([\d-]+)부터 종료월 ([\d-]+)까지 매주 (\S+) (\d+):(\d+)부터 (\d+):(\d+)까지 주간 반복 예약을 미리 확인한다$/,
  async function (startDate, endMonth, weekday, sh, smin, eh, emin) {
    const startTime = `${String(sh).padStart(2, "0")}:${String(smin).padStart(2, "0")}`;
    const endTime = `${String(eh).padStart(2, "0")}:${String(emin).padStart(2, "0")}`;

    const response = await fetch(`${API_BASE_URL}/reservations/recurring/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        roomId: "ROOM_1",
        reservationDate: startDate,
        startTime: startTime,
        endTime: endTime,
        endMonth: endMonth,
        ownerName: "김철수",
        attendees: 5,
        purpose: "주간 정례회의",
        contact: "010-1234-5678"
      })
    });
    
    this.previewResponse = response;
    this.previewResponseBody = await response.json();
  }
);

Then(/^시스템은 충돌 날짜 ([\d-]+)를 표시해야 한다$/, function (conflictDate) {
  assert.ok(this.previewResponseBody.conflicts.includes(conflictDate));
});

When("사용자가 충돌 날짜를 확인하고 가능한 날짜만 생성한다", async function () {
  const requestBody = {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "09:00",
    endTime: "10:00",
    endMonth: "2026-07",
    ownerName: "김철수",
    attendees: 5,
    purpose: "주간 정례회의",
    contact: "010-1234-5678",
    createAvailableOnly: true
  };

  const response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  this.response = response;
  this.responseBody = await response.json();
});

Then(/^([\d-]+) 예약은 생성되지 않아야 한다$/, async function (dateStr) {
  const response = await fetch(`${API_BASE_URL}/reservations?date=${dateStr}`);
  const data = await response.json();
  
  const actualReservations = data.reservations || [];
  const hasRecurring = actualReservations.some(r => r.recurringGroupId);
  assert.strictEqual(hasRecurring, false);
});

When("사용자가 회의 목적 없이 주간 반복 예약을 생성한다", async function () {
  const requestBody = {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "09:00",
    endTime: "10:00",
    endMonth: "2026-07",
    ownerName: "김철수",
    attendees: 5,
    contact: "010-1234-5678"
  };

  const response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  this.response = response;
  this.responseBody = await response.json();
});

Then("주간 반복 예약 생성은 실패해야 한다", function () {
  assert.ok(this.response.status >= 400);
});

Then("오류 코드는 {string} 이어야 한다", function (expectedCode) {
  const body = this.responseBody || this.previewResponseBody || {};
  assert.strictEqual(body.code, expectedCode);
});

When("사용자가 반복 종료월 없이 주간 반복 예약을 생성한다", async function () {
  const requestBody = {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "09:00",
    endTime: "10:00",
    endMonth: "",
    ownerName: "김철수",
    attendees: 5,
    purpose: "주간 정례회의",
    contact: "010-1234-5678"
  };

  const response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  this.response = response;
  this.responseBody = await response.json();
});

When(/^사용자가 반복 종료월 "([^"]+)"을 입력한다$/, async function (endMonth) {
  const requestBody = {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "09:00",
    endTime: "10:00",
    endMonth: endMonth,
    ownerName: "김철수",
    attendees: 5,
    purpose: "주간 정례회의",
    contact: "010-1234-5678"
  };

  const response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  this.response = response;
  this.responseBody = await response.json();
});

// 충돌 예약 생성 헬퍼 (인자 11개 수신)
Given(
  /^회의실 1에 ([\d-]+)부터 ([\d-]+)까지 매주 (\S+) (\d+):(\d+)부터 (\d+):(\d+)까지 ACTIVE 예약이 있다$/,
  async function (startStr, endMonth, weekday, sh, smin, eh, emin) {
    const [startYear, startMonth, startDay] = startStr.split("-").map(Number);
    const [endYear, endMonthNum] = endMonth.split("-").map(Number);

    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    const endDateObj = new Date(endYear, endMonthNum, 0);

    const currentDateObj = new Date(startDateObj);
    while (currentDateObj <= endDateObj) {
      const yyyy = currentDateObj.getFullYear();
      const mm = String(currentDateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(currentDateObj.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const requestBody = {
        roomId: "ROOM_1",
        reservationDate: dateStr,
        startTime: `${String(sh).padStart(2, "0")}:${String(smin).padStart(2, "0")}`,
        endTime: `${String(eh).padStart(2, "0")}:${String(emin).padStart(2, "0")}`,
        ownerName: "기존자",
        attendees: 2,
        purpose: "기존예약",
        contact: "010-9999-9999"
      };

      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(requestBody)
      });
      assert.strictEqual(response.status, 201);

      currentDateObj.setDate(currentDateObj.getDate() + 7);
    }
  }
);

// 6. 주간 반복 예약 생성 (정규식)
When(
  /^사용자가 회의실 1에 ([\d-]+)부터 종료월 ([\d-]+)까지 매주 (\S+) (\d+):(\d+)부터 (\d+):(\d+)까지 주간 반복 예약을 생성한다$/,
  async function (startDate, endMonth, weekday, sh, smin, eh, emin) {
    const startTime = `${String(sh).padStart(2, "0")}:${String(smin).padStart(2, "0")}`;
    const endTime = `${String(eh).padStart(2, "0")}:${String(emin).padStart(2, "0")}`;

    const response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        roomId: "ROOM_1",
        reservationDate: startDate,
        startTime: startTime,
        endTime: endTime,
        endMonth: endMonth,
        ownerName: "김철수",
        attendees: 5,
        purpose: "주간 정례회의",
        contact: "010-1234-5678"
      })
    });
    
    this.response = response;
    this.responseBody = await response.json();
  }
  );

Given(/^회의 목적이 "([^"]+)"인 주간 반복 예약이 존재한다$/, async function (purpose) {
  const requestBody = {
    roomId: "ROOM_1",
    reservationDate: "2026-06-15",
    startTime: "09:00",
    endTime: "10:00",
    endMonth: "2026-07",
    ownerName: "김철수",
    attendees: 5,
    purpose: purpose,
    contact: "010-1234-5678"
  };

  const response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  assert.strictEqual(response.status, 201);
  const data = await response.json();
  this.createdRecurringGroup = data.reservations;
  this.recurringGroupId = data.reservations[0].recurringGroupId;
});

When(/^사용자가 반복 예약 수정을 위해 목적 확인값 "([^"]+)"를 입력한다$/, async function (purposeConfirm) {
  const response = await fetch(`${API_BASE_URL}/reservations/recurring/${this.recurringGroupId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      purposeConfirm: purposeConfirm,
      startDate: "2026-06-15",
      roomId: "ROOM_1",
      startTime: "10:00",
      endTime: "11:00",
      ownerName: "김철수",
      attendees: 5,
      purpose: "수정된 주간회의",
      contact: "010-1234-5678"
    })
  });

  this.response = response;
  this.responseBody = await response.json();
});

Then("반복 예약 수정은 실패해야 한다", function () {
  assert.ok(this.response.status >= 400);
});

When(/^사용자가 반복 예약 취소를 위해 목적 확인값 "([^"]+)"를 입력한다$/, async function (purposeConfirm) {
  const response = await fetch(`${API_BASE_URL}/reservations/recurring/${this.recurringGroupId}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      purposeConfirm: purposeConfirm,
      startDate: "2026-06-15"
    })
  });

  this.response = response;
  this.responseBody = await response.json();
});

Then("반복 예약 취소는 실패해야 한다", function () {
  assert.ok(this.response.status >= 400);
});
