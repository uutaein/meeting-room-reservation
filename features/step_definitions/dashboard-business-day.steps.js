const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

let utils;
let holidayData;

async function loadModules() {
  if (!utils) {
    utils = await import("../../frontend/src/utils/businessDayUtils.js");
  }
  if (!holidayData) {
    holidayData = require("../../frontend/src/data/holidays.json");
  }
}

Given("2026년 대한민국 공휴일 데이터셋이 등록되어 있다", async function () {
  await loadModules();
  assert.ok(holidayData.supportedYears.includes(2026));
});

When("기준일을 {string}로 설정하고 {int}영업일을 조회한다", async function (baseDateText, count) {
  await loadModules();
  this.baseDateText = baseDateText;
  this.count = count;
  try {
    this.resultDays = utils.getNextBusinessDays(baseDateText, count, holidayData);
    this.error = null;
  } catch (err) {
    this.error = err;
  }
});

Then("조회된 영업일 목록은 아래와 같아야 한다", function (dataTable) {
  const expectedList = dataTable.raw().map(row => row[0]);
  const actualList = this.resultDays.map(d => d.date);
  assert.deepStrictEqual(actualList, expectedList);
});

Given("2026년부터 2030년까지 지원되는 공휴일 데이터셋이 등록되어 있다", async function () {
  await loadModules();
  assert.deepStrictEqual(holidayData.supportedYears, [2026, 2027, 2028, 2029, 2030]);
});

Then("{string} 오류가 발생해야 한다", function (expectedErrorCode) {
  assert.ok(this.error, "오류가 발생해야 하지만 발생하지 않았습니다.");
  assert.strictEqual(this.error.code, expectedErrorCode);
});

Given("이번 주 월요일 날짜가 {string} 이며 현재 날짜가 {string} 이다", function (mondayDate, currentDate) {
  this.mondayDate = mondayDate;
  this.currentDate = currentDate;
});

Given("이전에 사용자가 수동으로 선택한 날짜의 주차가 {string} 이다", function (manualWeek) {
  this.manualSelectionWeek = manualWeek === "null" ? null : manualWeek;
});

Given("현재 기준일이 {string} 이다", function (currentBaseDate) {
  this.currentBaseDate = currentBaseDate;
});

When("주간 롤오버 보정을 실행한다", async function () {
  await loadModules();
  const currentWeekMonday = this.mondayDate;
  
  this.nextBaseDate = this.currentBaseDate || this.mondayDate;
  if (this.manualSelectionWeek !== currentWeekMonday) {
    const mockNow = utils.parseLocalDate(this.currentDate);
    this.nextBaseDate = utils.getFirstBusinessDayOfWeek(mockNow, holidayData);
    this.manualSelectionWeek = null;
  }
});

Then("기준일은 이번 주의 첫 영업일인 {string}로 자동 변경되어야 한다", function (expectedDate) {
  assert.strictEqual(this.nextBaseDate, expectedDate);
});

Then("수동 변경 주차 정보는 초기화되어야 한다", function () {
  assert.strictEqual(this.manualSelectionWeek, null);
});

Then("기준일은 {string}로 그대로 유지되어야 한다", function (expectedDate) {
  assert.strictEqual(this.nextBaseDate, expectedDate);
});

Given("테스트 서버의 현재 시각이 {string}로 모킹되어 있다", async function (mockTime) {
  const API_BASE_URL = "http://localhost:3000";
  const response = await fetch(`${API_BASE_URL}/test/set-time`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({ time: mockTime })
  });
  
  const responseBody = await response.json();
  assert.strictEqual(response.status, 200, `시각 모킹 실패: ${JSON.stringify(responseBody)}`);
});
