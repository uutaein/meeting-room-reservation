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

      <table v-else>
        <thead>
          <tr>
            <th class="col-room">회의실</th>
            <th class="col-time">시간</th>
            <th class="col-owner">예약자</th>
            <th class="col-attendees">인원</th>
            <th class="col-purpose">목적</th>
            <th class="col-action">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reservation in day.reservations"
            :key="reservation.id"
          >
            <td class="col-room">
              <span :class="['room-badge', reservation.roomId.toLowerCase()]">
                {{ getRoomName(reservation.roomId) }}
              </span>
            </td>
            <td class="col-time">{{ reservation.startTime }} ~ {{ reservation.endTime }}</td>
            <td class="col-owner">{{ reservation.ownerName }}</td>
            <td class="col-attendees">{{ reservation.attendees }}명</td>
            <td class="col-purpose purpose-cell" :title="reservation.purpose">
              {{ reservation.purpose }}
            </td>
            <td class="col-action action-cell">
              <button
                type="button"
                class="edit-button"
                :disabled="loading || submitting"
                @click="$emit('edit-reservation', day, reservation)"
              >
                수정
              </button>
              <button
                type="button"
                class="cancel-button"
                :disabled="loading || submitting"
                @click="$emit('cancel-reservation', day, reservation)"
              >
                취소
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
    return "회의실 1";
  }

  if (roomId === "ROOM_2") {
    return "회의실 2";
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

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: 18px 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 17px;
  font-weight: 600;
}

th {
  background: hsla(260, 10%, 96%, 0.5);
  font-weight: 700;
  color: var(--text-h);
  font-size: 16px;
}

tbody tr:last-child td {
  border-bottom: none;
}

.col-room {
  width: 15%;
}

.col-time {
  width: 22%;
}

.col-owner {
  width: 12%;
}

.col-attendees {
  width: 10%;
}

.col-purpose {
  width: 23%;
}

.col-action {
  width: 18%;
}

.room-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
}

.room-badge.room_1 {
  background: hsla(200, 85%, 60%, 0.1);
  color: hsl(200, 85%, 40%);
  border: 2px solid hsla(200, 85%, 60%, 0.3);
}

.room-badge.room_2 {
  background: hsla(275, 85%, 60%, 0.1);
  color: hsl(275, 85%, 40%);
  border: 2px solid hsla(275, 85%, 60%, 0.3);
}

.purpose-cell {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: var(--text-h);
}

.action-cell {
  text-align: left;
  white-space: nowrap;
}

.edit-button,
.cancel-button {
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.edit-button {
  border: 2px solid var(--accent-border);
  background: transparent;
  color: var(--accent);
  margin-right: 8px;
}

.edit-button:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-1px);
}

.cancel-button {
  border: 2px solid hsla(0, 80%, 60%, 0.4);
  background: transparent;
  color: hsl(0, 80%, 50%);
}

.cancel-button:hover:not(:disabled) {
  background: hsl(0, 80%, 50%);
  border-color: hsl(0, 80%, 50%);
  color: #fff;
  transform: translateY(-1px);
}

.edit-button:disabled,
.cancel-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
</style>
