import {
  validateCreateReservation,
  validateListReservationQuery,
  validateCreateRecurringReservation
} from "../validators/reservationValidator.js";

import {
  saveReservation,
  findRoomById,
  existsOverlappingReservation,
  findReservationsByDate,
  findReservationById,
  cancelReservationById,
  updateReservationById,
  existsOverlappingReservationExceptSelf,
  updateRecurringReservations,
  cancelRecurringReservations,
  findReservationsByGroupId
} from "../repositories/reservationRepository.js";

import { getDb } from "../db/connection.js";
import { assertHolidayDataAvailableForDates, isHoliday } from "../utils/holidayData.js";

export function createReservation(input) {
  validateCreateReservation(input);
  validateRoomExists(input.roomId);
  validateReservationOverlap(input);

  return saveReservation(input);
}

export function listReservations(query) {
  validateListReservationQuery(query);

  return findReservationsByDate(query.date);
}

function validateRoomExists(roomId) {
  const room = findRoomById(roomId);

  if (!room || room.is_active !== 1) {
    throwProblem(
      400,
      "ERR_INVALID_ROOM",
      "존재하지 않거나 사용할 수 없는 회의실입니다."
    );
  }
}

function validateReservationOverlap(input) {
  if (existsOverlappingReservation(input)) {
    throwProblem(
      409,
      "ERR_RESERVATION_OVERLAP",
      "같은 회의실에 겹치는 예약이 이미 존재합니다."
    );
  }
}

function throwProblem(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.errorCode = code;
  throw error;
}

export function cancelReservation(id) {
  const reservationId = Number(id);

  if (!Number.isInteger(reservationId) || reservationId < 1) {
    throwProblem(
      404,
      "ERR_RESERVATION_NOT_FOUND",
      "존재하지 않는 예약입니다."
    );
  }

  const reservation = findReservationById(reservationId);

  if (!reservation) {
    throwProblem(
      404,
      "ERR_RESERVATION_NOT_FOUND",
      "존재하지 않는 예약입니다."
    );
  }

  if (reservation.status === "CANCELLED") {
    throwProblem(
      409,
      "ERR_ALREADY_CANCELLED",
      "이미 취소된 예약입니다."
    );
  }

  return cancelReservationById(reservationId);
}

// feature/reservation-update
export function updateReservation(id, input) {
  const existingReservation = findReservationById(id);

  if (!existingReservation) {
    const error = new Error("예약을 찾을 수 없습니다.");
    error.statusCode = 404;
    error.code = "ERR_RESERVATION_NOT_FOUND";
    throw error;
  }

  if (existingReservation.status === "CANCELLED") {
    const error = new Error("이미 취소된 예약은 수정할 수 없습니다.");
    error.statusCode = 409;
    error.code = "ERR_CANCELLED_RESERVATION_NOT_EDITABLE";
    throw error;
  }

  validateCreateReservation(input);
  validateRoomExists(input.roomId);

  const hasOverlap = existsOverlappingReservationExceptSelf(id, input);

  if (hasOverlap) {
    const error = new Error("이미 해당 시간에 예약이 존재합니다.");
    error.statusCode = 409;
    error.code = "ERR_RESERVATION_OVERLAP";
    throw error;
  }

  return updateReservationById(id, input);
}

export function previewRecurring(input) {
  validateCreateRecurringReservation(input, false);
  validateRoomExists(input.roomId);

  const dates = getRecurringDates(input.reservationDate, input.endMonth);
  assertHolidayDataAvailableForDates(dates);
  const conflicts = [];
  const occurrences = [];
  const excludedHolidayDates = [];

  for (const date of dates) {
    if (isHoliday(date)) {
      excludedHolidayDates.push(date);
      continue;
    }

    const singleInput = {
      roomId: input.roomId,
      reservationDate: date,
      startTime: input.startTime,
      endTime: input.endTime
    };
    if (existsOverlappingReservation(singleInput)) {
      conflicts.push(date);
    } else {
      occurrences.push(date);
    }
  }

  return {
    totalCount: dates.length,
    occurrences,
    conflicts: conflicts,
    excludedHolidayDates,
    availableCount: occurrences.length,
    holidayExcludedCount: excludedHolidayDates.length
  };
}

export function createRecurringReservation(input) {
  validateCreateRecurringReservation(input);
  validateRoomExists(input.roomId);

  const dates = getRecurringDates(input.reservationDate, input.endMonth);
  assertHolidayDataAvailableForDates(dates);
  const conflicts = [];
  const occurrences = [];
  const excludedHolidayDates = [];

  for (const date of dates) {
    if (isHoliday(date)) {
      excludedHolidayDates.push(date);
      continue;
    }

    const singleInput = {
      roomId: input.roomId,
      reservationDate: date,
      startTime: input.startTime,
      endTime: input.endTime
    };
    if (existsOverlappingReservation(singleInput)) {
      conflicts.push(date);
    } else {
      occurrences.push(date);
    }
  }

  if (!input.createAvailableOnly && conflicts.length > 0) {
    throwProblem(
      409,
      "ERR_RESERVATION_OVERLAP",
      "같은 회의실에 겹치는 예약이 이미 존재합니다."
    );
  }

  if (occurrences.length === 0) {
    return [];
  }

  const db = getDb();
  const createdReservations = [];

  const runInsertTransaction = db.transaction(() => {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    
    const [startYear, startMonth, startDay] = input.reservationDate.split("-").map(Number);
    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    const repeatWeekday = dayNames[startDateObj.getDay()];

    for (const date of occurrences) {
      const singleReservationInput = {
        roomId: input.roomId,
        reservationDate: date,
        startTime: input.startTime,
        endTime: input.endTime,
        ownerName: input.ownerName,
        attendees: Number(input.attendees),
        purpose: input.purpose,
        contact: input.contact,
        recurringGroupId: groupId,
        recurringTitle: null,
        repeatType: "WEEKLY",
        repeatWeekday: repeatWeekday,
        repeatStartDate: input.reservationDate,
        repeatEndMonth: input.endMonth
      };
      const created = saveReservation(singleReservationInput);
      createdReservations.push(created);
    }
  });

  runInsertTransaction();

  return createdReservations;
}

export function updateRecurring(groupId, input) {
  const existing = findReservationsByGroupId(groupId);
  if (!existing || existing.length === 0) {
    throwProblem(404, "ERR_RESERVATION_NOT_FOUND", "예약을 찾을 수 없습니다.");
  }

  const firstReservation = existing[0];
  if (firstReservation.purpose !== input.purposeConfirm) {
    throwProblem(400, "ERR_REC_PURPOSE_CONFIRM_MISMATCH", "입력한 회의 목적이 반복 예약 회의 목적과 일치하지 않습니다.");
  }

  const tempInput = {
    roomId: input.roomId,
    reservationDate: input.startDate || firstReservation.reservationDate,
    startTime: input.startTime,
    endTime: input.endTime,
    ownerName: input.ownerName,
    attendees: input.attendees,
    purpose: input.purpose,
    contact: input.contact
  };
  validateCreateReservation(tempInput);
  validateRoomExists(input.roomId);

  const db = getDb();
  let updatedCount = 0;

  const runUpdateTransaction = db.transaction(() => {
    const targetReservations = existing.filter(r => r.status === "ACTIVE" && r.reservationDate >= input.startDate);
    
    for (const r of targetReservations) {
      const checkInput = {
        roomId: input.roomId,
        reservationDate: r.reservationDate,
        startTime: input.startTime,
        endTime: input.endTime
      };
      if (existsOverlappingReservationExceptSelf(r.id, checkInput)) {
        throwProblem(409, "ERR_RESERVATION_OVERLAP", "이미 해당 시간에 예약이 존재합니다.");
      }
    }

    updatedCount = updateRecurringReservations(groupId, input.startDate, input);
  });

  runUpdateTransaction();

  return { updatedCount };
}

export function cancelRecurring(groupId, input) {
  const existing = findReservationsByGroupId(groupId);
  if (!existing || existing.length === 0) {
    throwProblem(404, "ERR_RESERVATION_NOT_FOUND", "예약을 찾을 수 없습니다.");
  }

  const firstReservation = existing[0];
  if (firstReservation.purpose !== input.purposeConfirm) {
    throwProblem(400, "ERR_REC_PURPOSE_CONFIRM_MISMATCH", "입력한 회의 목적이 반복 예약 회의 목적과 일치하지 않습니다.");
  }

  const db = getDb();
  let cancelledCount = 0;

  const runCancelTransaction = db.transaction(() => {
    cancelledCount = cancelRecurringReservations(groupId, input.startDate);
  });

  runCancelTransaction();

  return { cancelledCount };
}

export function getRecurringDates(startDateStr, endMonthStr) {
  const [startYear, startMonth, startDay] = startDateStr.split("-").map(Number);
  const [endYear, endMonthNum] = endMonthStr.split("-").map(Number);

  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonthNum, 0);

  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
    
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return dates;
}

export function getRecurringReservations(groupId) {
  return findReservationsByGroupId(groupId);
}

