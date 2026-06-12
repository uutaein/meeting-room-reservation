<template>
  <div class="day-list">
    <article
      v-for="day in dailyReservations"
      :key="day.date"
      :class="['day-card', { 'is-today': isToday(day.date), 'is-past-day': isPastDay(day.date) }]"
    >
      <header class="day-header">
        <div class="day-title-container">
          <span class="day-date">{{ formatDateFriendly(day.date) }}</span>
          <span class="day-week-label">{{ day.label }}</span>
          <span v-if="isToday(day.date)" class="today-label">오늘</span>
        </div>

        <span class="count">예약 {{ day.reservations.length }}건</span>
      </header>

      <div v-if="day.reservations.length === 0" class="empty">
        등록된 예약이 없습니다.
      </div>

      <div v-else class="reservations-container">
        <article
          v-for="reservation in day.reservations"
          :key="reservation.id"
          :class="['reservation-card', { 'is-past': isPast(day.date, reservation.startTime) }]"
        >
          <div :class="['room-block', roomClass(reservation.roomId)]">
            <span class="room-indicator" aria-hidden="true"></span>
            <span class="room-name">{{ getRoomName(reservation.roomId) }}</span>
          </div>

          <div class="time-block">
            <span class="time-value">
              {{ reservation.startTime }} <span class="time-separator">–</span> {{ reservation.endTime }}
            </span>
          </div>

          <div class="reservation-content">
            <div class="reservation-title" :title="reservation.purpose">
              <span v-if="isPast(day.date, reservation.startTime)" class="sr-only">(시작 시간 지남)</span>
              <span v-if="reservation.recurringGroupId" class="recurring-badge">반복</span>
              {{ reservation.purpose }}
            </div>

            <div class="reservation-meta">
              <span class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" />
                </svg>
                <span>{{ reservation.ownerName }}</span>
              </span>

              <span class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.5 3.5 10 8 7.8 9.8a15.5 15.5 0 0 0 6.4 6.4L16 14l4.5 2.5-.8 4A2 2 0 0 1 17.8 22C9.1 21.5 2.5 14.9 2 6.2a2 2 0 0 1 1.5-1.9l4-.8Z" />
                </svg>
                <span>{{ reservation.contact }}</span>
              </span>
            </div>
          </div>

          <div class="reservation-actions">
            <button
              type="button"
              class="update-button"
              :disabled="loading || submitting || reservation.isPreview || isPast(day.date, reservation.startTime)"
              :title="reservation.isPreview ? '가상 데이터입니다.' : (isPast(day.date, reservation.startTime) ? '지난 예약은 수정할 수 없습니다.' : '')"
              @click="$emit('edit-reservation', day, reservation)"
            >
              수정
            </button>
            <button
              type="button"
              class="cancel-button"
              :disabled="loading || submitting || reservation.isPreview || isPast(day.date, reservation.startTime)"
              :title="reservation.isPreview ? '가상 데이터입니다.' : (isPast(day.date, reservation.startTime) ? '지난 예약은 취소할 수 없습니다.' : '')"
              @click="$emit('cancel-reservation', day, reservation)"
            >
              취소
            </button>
          </div>
        </article>
      </div>
    </article>
  </div>
</template>

<script setup>
const props = defineProps({
  dailyReservations: {
    type: Array,
    required: true
  },
  currentDate: {
    type: String,
    required: true
  },
  currentTime: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

defineEmits(["edit-reservation", "cancel-reservation"]);

function getRoomName(roomId) {
  if (roomId === "ROOM_1") {
    return "서고";
  }

  if (roomId === "ROOM_2") {
    return "회의실";
  }

  return roomId;
}

function roomClass(roomId) {
  return roomId ? roomId.toLowerCase() : "";
}

function isToday(dateStr) {
  return dateStr === props.currentDate;
}

function isPastDay(dateStr) {
  return dateStr < props.currentDate;
}

function isPast(dateStr, startTimeStr) {
  if (!props.currentTime) return false;
  const targetDateTime = `${dateStr} ${startTimeStr}`;
  return targetDateTime < props.currentTime;
}

function formatDateFriendly(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}
</script>

<style scoped>
.day-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-card {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.day-card.is-today {
  border-color: rgba(245, 158, 11, 0.38);
  box-shadow: 0 9px 28px rgba(245, 158, 11, 0.1);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, #fbfcfe 0%, #f6f8fb 100%);
}

.day-card.is-today .day-header {
  border-bottom-color: rgba(245, 158, 11, 0.2);
  background: linear-gradient(135deg, #fffdf7 0%, #fff6dc 100%);
}

.day-card.is-today .reservations-container {
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.36), rgba(255, 255, 255, 0));
}

.day-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.day-date {
  color: #172033;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.day-week-label {
  padding: 3px 8px;
  border-radius: 999px;
  background: #eaf2ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 750;
}

.today-label {
  padding: 3px 8px;
  border: 1px solid rgba(245, 158, 11, 0.24);
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 12px;
  font-weight: 800;
}

.count {
  flex-shrink: 0;
  padding: 4px 9px;
  border-radius: 999px;
  background: #6d4aff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 750;
  box-shadow: 0 4px 10px rgba(109, 74, 255, 0.18);
}

.day-card.is-today .count {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.22);
}

.empty {
  padding: 24px 16px;
  color: #64748b;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.reservations-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 7px;
}

.reservation-card {
  display: grid;
  grid-template-columns: 80px 132px minmax(0, 1fr) 52px;
  align-items: stretch;
  min-height: 64px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.reservation-card:hover {
  border-color: rgba(109, 74, 255, 0.3);
  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.07);
  transform: translateY(-1px);
}

.room-block {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-right: 1px solid rgba(148, 163, 184, 0.14);
}

.room-indicator {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
}

.room-name {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.room-block.room_1 {
  background: linear-gradient(135deg, #eef8ff 0%, #e2f3ff 100%);
  color: #0875a5;
}

.room-block.room_1 .room-indicator {
  background: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
}

.room-block.room_2 {
  background: linear-gradient(135deg, #f7f0ff 0%, #eee3ff 100%);
  color: #7638ad;
}

.room-block.room_2 .room-indicator {
  background: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.12);
}

.time-block {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border-right: 1px solid rgba(148, 163, 184, 0.14);
  background: #fbfcfe;
}

.time-value {
  color: #172033;
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.time-separator {
  color: #94a3b8;
  font-weight: 600;
}

.reservation-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 8px 14px;
  text-align: left;
}

.reservation-title {
  overflow: hidden;
  color: #111827;
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -0.025em;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.reservation-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
  color: #64748b;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.meta-item span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.reservation-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  border-left: 1px solid rgba(148, 163, 184, 0.14);
  background: #fbfcfe;
}

.update-button,
.cancel-button {
  min-height: 23px;
  padding: 2px 4px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition: background-color 0.18s, border-color 0.18s, color 0.18s;
}

.update-button {
  border: 1px solid rgba(109, 74, 255, 0.28);
  background: rgba(109, 74, 255, 0.06);
  color: #6240e8;
}

.update-button:hover:not(:disabled) {
  border-color: rgba(109, 74, 255, 0.45);
  background: rgba(109, 74, 255, 0.13);
}

.cancel-button {
  border: 1px solid rgba(239, 68, 68, 0.24);
  background: rgba(239, 68, 68, 0.04);
  color: #dc2626;
}

.cancel-button:hover:not(:disabled) {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
}

.update-button:disabled,
.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

@media (min-width: 900px) and (max-width: 1200px) and (min-height: 1200px) {
  .day-card {
    scroll-snap-align: start;
    scroll-snap-stop: normal;
  }

  .day-list {
    gap: 20px;
  }

  .day-header {
    padding: 20px 23px;
  }

  .day-title-container {
    gap: 13px;
  }

  .day-date {
    font-size: 28px;
  }

  .day-week-label,
  .today-label {
    padding: 7px 17px;
    font-size: 20px;
  }

  .count {
    padding: 10px 20px;
    font-size: 20px;
  }

  .reservations-container {
    gap: 8px;
    padding: 9px;
  }

  .reservation-card {
    grid-template-columns: 134px 220px minmax(0, 1fr) 87px;
    min-height: 107px;
    border-radius: 20px;
  }

  .room-block {
    gap: 10px;
    padding: 13px;
  }

  .room-indicator {
    width: 10px;
    height: 10px;
  }

  .room-name {
    font-size: 23px;
  }

  .time-block {
    padding: 13px 17px;
  }

  .time-value {
    font-size: 27px;
  }

  .reservation-content {
    gap: 12px;
    padding: 13px 23px;
  }

  .reservation-title {
    font-size: 27px;
  }

  .reservation-meta {
    gap: 30px;
  }

  .meta-item {
    gap: 8px;
    font-size: 18px;
  }

  .meta-icon {
    width: 22px;
    height: 22px;
  }

  .reservation-actions {
    gap: 10px;
    padding: 10px;
  }

  .update-button,
  .cancel-button {
    min-height: 38px;
    font-size: 18px;
    padding: 4px 8px;
    border-radius: 12px;
  }
}

@media (max-width: 760px) {
  .reservation-card {
    grid-template-columns: 72px minmax(0, 1fr) 48px;
    min-height: 74px;
  }

  .room-block {
    grid-row: 1 / span 2;
  }

  .time-block {
    grid-column: 2;
    justify-content: flex-start;
    padding: 8px 10px 2px;
    border-right: 0;
    background: #ffffff;
  }

  .reservation-content {
    grid-column: 2;
    padding: 2px 10px 8px;
  }

  .reservation-title {
    font-size: 14px;
  }

  .reservation-meta {
    gap: 10px;
  }

  .reservation-actions {
    grid-column: 3;
    grid-row: 1 / span 2;
  }
}
.recurring-badge {
  display: inline-block;
  padding: 2px 6px;
  background: #2563eb;
  color: #ffffff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  margin-right: 6px;
  vertical-align: middle;
}
.reservation-card.is-past {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  box-shadow: none !important;
  opacity: 0.55 !important;
  filter: grayscale(100%) contrast(0.85);
  pointer-events: auto;
}

.reservation-card.is-past:hover {
  transform: none !important;
  border-color: #cbd5e1 !important;
  box-shadow: none !important;
}

.reservation-card.is-past .room-block {
  background: #cbd5e1 !important;
  color: #475569 !important;
}

.reservation-card.is-past .room-indicator {
  background: #94a3b8 !important;
  box-shadow: none !important;
}

.reservation-card.is-past .time-block {
  background: #f1f5f9 !important;
}

.reservation-card.is-past .time-value {
  color: #475569 !important;
}

.reservation-card.is-past .reservation-title {
  color: #475569 !important;
  text-decoration: line-through !important;
}

.reservation-card.is-past .reservation-actions {
  background: #f1f5f9 !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.day-card.is-past-day {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.12);
  opacity: 0.7;
}

.day-card.is-past-day .day-header {
  border-bottom-color: rgba(148, 163, 184, 0.12);
  background: #f1f5f9;
}

.day-card.is-past-day .day-date {
  color: #64748b;
}

.day-card.is-past-day .day-week-label {
  background: #e2e8f0;
  color: #64748b;
}

.day-card.is-past-day .count {
  background: #94a3b8;
}
</style>
