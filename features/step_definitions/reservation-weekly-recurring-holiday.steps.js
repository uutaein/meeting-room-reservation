const assert = require("assert");
const { Given, Then } = require("@cucumber/cucumber");

const holidayData = require("../../frontend/src/data/holidays.json");

Given(/^(\d{4}-\d{2}-\d{2})은 공휴일이다$/, function (dateStr) {
  const isHoliday = holidayData.holidays.some((holiday) => holiday.date === dateStr);

  assert.ok(
    isHoliday,
    `${dateStr}는 공휴일 데이터에 포함되어 있지 않습니다.`
  );
});

Then(/^시스템은 공휴일 제외 날짜 (\d{4}-\d{2}-\d{2})을 표시해야 한다$/, function (dateStr) {
  assert.ok(Array.isArray(this.previewResponseBody.excludedHolidayDates));
  assert.ok(this.previewResponseBody.excludedHolidayDates.includes(dateStr));
});

Then(/^시스템은 생성 예정 날짜 목록에 (\d{4}-\d{2}-\d{2})을 포함하지 않아야 한다$/, function (dateStr) {
  assert.ok(Array.isArray(this.previewResponseBody.occurrences));
  assert.strictEqual(this.previewResponseBody.occurrences.includes(dateStr), false);
});

Then("전체 계산 대상 회차는 5건이어야 한다", function () {
  assert.strictEqual(this.previewResponseBody.totalCount, 5);
});

Then("공휴일 제외 회차는 1건이어야 한다", function () {
  assert.strictEqual(this.previewResponseBody.holidayExcludedCount, 1);
});

Then("생성 가능 회차는 4건이어야 한다", function () {
  assert.strictEqual(this.previewResponseBody.availableCount, 4);
});

Given("2031년 공휴일 데이터가 준비되어 있지 않다", function () {
  assert.strictEqual(
    holidayData.supportedYears.includes(2031),
    false,
    "2031년이 공휴일 데이터 지원 범위에 포함되어 있습니다."
  );
});

Then("주간 반복 예약 미리보기는 실패해야 한다", function () {
  assert.ok(this.previewResponse.status >= 400);
});
