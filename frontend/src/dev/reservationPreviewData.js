// Set this to false after the layout review.
export const RESERVATION_PREVIEW_ENABLED = import.meta.env.DEV && true;

const PREVIEW_BUSINESS_DAY_COUNT = 5;

const PREVIEW_TEMPLATES = [
  {
    roomId: "ROOM_2",
    startTime: "09:00",
    endTime: "09:50",
    purpose: "주간 업무 공유",
    ownerName: "김민준",
    contact: "010-2481-5036",
    attendees: 8
  },
  {
    roomId: "ROOM_1",
    startTime: "10:10",
    endTime: "10:45",
    purpose: "프로젝트 일정 점검",
    ownerName: "이서연",
    contact: "010-7364-1128",
    attendees: 4
  },
  {
    roomId: "ROOM_2",
    startTime: "11:00",
    endTime: "12:00",
    purpose: "고객사 화상 미팅",
    ownerName: "박지훈",
    contact: "010-5912-8740",
    attendees: 7
  },
  {
    roomId: "ROOM_1",
    startTime: "13:20",
    endTime: "14:00",
    purpose: "디자인 리뷰",
    ownerName: "최유진",
    contact: "010-4083-6251",
    attendees: 5
  },
  {
    roomId: "ROOM_2",
    startTime: "14:30",
    endTime: "15:30",
    purpose: "분기 운영 계획 회의",
    ownerName: "정도윤",
    contact: "010-8627-3495",
    attendees: 10
  },
  {
    roomId: "ROOM_1",
    startTime: "16:10",
    endTime: "17:00",
    purpose: "신규 기능 검토",
    ownerName: "한지우",
    contact: "010-1759-6824",
    attendees: 6
  }
];

export function applyReservationPreviewData(dailyReservations) {
  if (!RESERVATION_PREVIEW_ENABLED) {
    return dailyReservations;
  }

  return dailyReservations.map((day, dayIndex) => {
    if (dayIndex >= PREVIEW_BUSINESS_DAY_COUNT) {
      return day;
    }

    const targetCount = dayIndex % 2 === 0 ? 6 : 5;
    const missingCount = Math.max(0, targetCount - day.reservations.length);
    const previewReservations = Array.from({ length: missingCount }, (_, index) =>
      createPreviewReservation(day, dayIndex, index, day.reservations.length)
    );

    return {
      ...day,
      reservations: [...day.reservations, ...previewReservations].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      )
    };
  });
}

function createPreviewReservation(day, dayIndex, previewIndex, existingCount) {
  const template = PREVIEW_TEMPLATES[(dayIndex + previewIndex) % PREVIEW_TEMPLATES.length];

  return {
    ...template,
    id: `PREVIEW-${day.date}-${existingCount + previewIndex}`,
    reservationDate: day.date,
    isPreview: true
  };
}
