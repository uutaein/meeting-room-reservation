export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, days) {
  const copiedDate = new Date(date);
  copiedDate.setDate(copiedDate.getDate() + days);
  return copiedDate;
}

export function getDayLabel(date) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${dayNames[date.getDay()]}요일`;
}

export function isBusinessDay(date, holidayData) {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return false;
  }
  const dateStr = toDateInputValue(date);
  if (holidayData && holidayData.holidays) {
    const isHoliday = holidayData.holidays.some((h) => h.date === dateStr);
    if (isHoliday) return false;
  }
  return true;
}

export function getNextBusinessDays(dateText, count, holidayData) {
  const days = [];
  let currentDate = parseLocalDate(dateText);

  while (days.length < count) {
    const year = currentDate.getFullYear();
    if (holidayData && holidayData.supportedYears && !holidayData.supportedYears.includes(year)) {
      const error = new Error("공휴일 데이터를 사용할 수 없는 연도입니다.");
      error.code = "ERR_HOLIDAY_DATA_UNAVAILABLE";
      throw error;
    }

    if (isBusinessDay(currentDate, holidayData)) {
      days.push({
        date: toDateInputValue(currentDate),
        label: getDayLabel(currentDate)
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  return days;
}

export function getMondayOfWeek(date) {
  const copiedDate = new Date(date);
  const day = copiedDate.getDay();
  const diff = copiedDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(copiedDate.setDate(diff));
  return toDateInputValue(monday);
}

export function getFirstBusinessDayOfWeek(date, holidayData) {
  const mondayStr = getMondayOfWeek(date);
  let currentDate = parseLocalDate(mondayStr);

  for (let i = 0; i < 7; i++) {
    const year = currentDate.getFullYear();
    if (holidayData && holidayData.supportedYears && !holidayData.supportedYears.includes(year)) {
      const error = new Error("공휴일 데이터를 사용할 수 없는 연도입니다.");
      error.code = "ERR_HOLIDAY_DATA_UNAVAILABLE";
      throw error;
    }

    if (isBusinessDay(currentDate, holidayData)) {
      return toDateInputValue(currentDate);
    }
    currentDate = addDays(currentDate, 1);
  }

  return mondayStr;
}
