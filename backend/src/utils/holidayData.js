import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const holidayDataPath = path.resolve(
  __dirname,
  "../../../frontend/src/data/holidays.json"
);

let cachedHolidayData = null;

export function getHolidayData() {
  if (cachedHolidayData) {
    return cachedHolidayData;
  }

  const raw = fs.readFileSync(holidayDataPath, "utf8");
  cachedHolidayData = JSON.parse(raw);
  return cachedHolidayData;
}

export function assertHolidayDataAvailableForDates(dateTexts) {
  const holidayData = getHolidayData();
  const supportedYears = Array.isArray(holidayData.supportedYears)
    ? holidayData.supportedYears
    : [];

  for (const dateText of dateTexts) {
    const year = Number(String(dateText).slice(0, 4));
    if (!supportedYears.includes(year)) {
      const error = new Error("해당 연도의 대한민국 공휴일 데이터가 준비되지 않아 주간 반복 예약을 처리할 수 없습니다.");
      error.status = 400;
      error.code = "ERR_HOLIDAY_DATA_UNAVAILABLE";
      error.errorCode = "ERR_HOLIDAY_DATA_UNAVAILABLE";
      throw error;
    }
  }
}

export function isHoliday(dateText) {
  const holidayData = getHolidayData();
  return Array.isArray(holidayData.holidays)
    ? holidayData.holidays.some((holiday) => holiday.date === dateText)
    : false;
}
