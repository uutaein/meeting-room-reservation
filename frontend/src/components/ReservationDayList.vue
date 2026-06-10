<template>
  <div class="day-list">
    <article
      v-for="day in dailyReservations"
      :key="day.date"
      class="day-card"
    >
      <header class="day-header">
        <div class="day-title-container">
          <span class="day-date">{{ formatDateFriendly(day.date) }}</span>
          <span class="day-week-label">{{ day.label }}</span>
        </div>

        <span class="count">
          예약 {{ day.reservations.length }}건
        </span>
      </header>

      <div v-if="day.reservations.length === 0" class="empty">
        이 날은 등록된 예약이 없습니다.
      </div>

      <div v-else class="reservations-container">
        <div
          v-for="reservation in day.reservations"
          :key="reservation.id"
          class="reservation-row-card"
        >
          <!-- 1. 회의실 장소 (크게, 가운데 정렬) -->
          <div class="reservation-room-column">
            <span :class="['room-badge-huge', reservation.roomId.toLowerCase()]">
              {{ getRoomName(reservation.roomId) }}
            </span>
          </div>

          <!-- 2. 핵심 정보 -->
          <div class="reservation-details">
            <!-- 1순위: 목적 -->
            <div class="info-purpose" :title="reservation.purpose">
              {{ reservation.purpose }}
            </div>
            
            <div class="info-meta">
              <span class="meta-time">⏰ {{ reservation.startTime }} ~ {{ reservation.endTime }}</span>
              <span class="meta-owner">👤 {{ reservation.ownerName }}</span>
              <span v-if="reservation.contact" class="meta-contact">📞 {{ reservation.contact }}</span>
            </div>
          </div>

          <!-- 3. 관리 액션 (수정/취소 위아래 배치, 크기 축소) -->
          <div class="reservation-actions-vertical">
            <button
              type="button"
              class="edit-button-mini"
              :disabled="loading || submitting"
              @click="$emit('edit-reservation', day, reservation)"
            >
              수정
            </button>
            <button
              type="button"
              class="cancel-button-mini"
              :disabled="loading || submitting"
              @click="$emit('cancel-reservation', day, reservation)"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  dailyReservations: {
    type: Array,
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
  gap: 24px;
}

.day-card {
  border: 2px solid var(--border);
  background: var(--bg);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
}

.day-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: hsla(260, 15%, 93%, 0.5);
  border-bottom: 2px solid var(--border);
}

.day-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-date {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-h);
}

.day-week-label {
  font-size: 20px;
  font-weight: 700;
  color: hsl(215, 90%, 50%);
  background: hsl(215, 90%, 95%);
  padding: 4px 10px;
  border-radius: 8px;
}

.count {
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}

.empty {
  padding: 40px 20px;
  color: var(--text);
  background: transparent;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.reservations-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.reservation-row-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  transition: all 0.2s;
  gap: 16px;
}

.reservation-row-card:hover {
  background: hsla(260, 10%, 96%, 0.3);
  border-color: var(--accent-border);
}

.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
  min-width: 0;
}

.info-purpose {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-h);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}

.meta-time {
  font-weight: 700;
  color: hsl(265, 80%, 45%);
}

.meta-owner {
  color: var(--text-h);
}

.reservation-room-column {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 100px;
}

.room-badge-huge {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 800;
  text-align: center;
  width: 100%;
}

.room-badge-huge.room_1 {
  background: hsla(200, 85%, 60%, 0.1);
  color: hsl(200, 85%, 40%);
  border: 2px solid hsla(200, 85%, 60%, 0.3);
}

.room-badge-huge.room_2 {
  background: hsla(275, 85%, 60%, 0.1);
  color: hsl(275, 85%, 40%);
  border: 2px solid hsla(275, 85%, 60%, 0.3);
}

.reservation-actions-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.edit-button-mini,
.cancel-button-mini {
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  width: 64px;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.edit-button-mini {
  border: 2px solid var(--accent-border);
  background: transparent;
  color: var(--accent);
}

.edit-button-mini:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-1px);
}

.cancel-button-mini {
  border: 2px solid hsla(0, 80%, 60%, 0.4);
  background: transparent;
  color: hsl(0, 80%, 50%);
}

.cancel-button-mini:hover:not(:disabled) {
  background: hsl(0, 80%, 50%);
  border-color: hsl(0, 80%, 50%);
  color: #fff;
  transform: translateY(-1px);
}

.edit-button-mini:disabled,
.cancel-button-mini:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
