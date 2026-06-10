<template>
  <div class="day-list">
    <article
      v-for="day in dailyReservations"
      :key="day.date"
      class="day-card"
    >
      <header class="day-header">
        <div>
          <h2>{{ day.label }}</h2>
          <span class="date">{{ day.date }}</span>
        </div>

        <span class="count">
          {{ day.reservations.length }}건
        </span>
      </header>

      <div v-if="day.reservations.length === 0" class="empty">
        예약이 없습니다.
      </div>

      <table v-else>
        <thead>
          <tr>
            <th>회의실</th>
            <th>시간</th>
            <th>예약자</th>
            <th>인원</th>
            <th>목적</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reservation in day.reservations"
            :key="reservation.id"
          >
            <td>{{ getRoomName(reservation.roomId) }}</td>
            <td>{{ reservation.startTime }} ~ {{ reservation.endTime }}</td>
            <td>{{ reservation.ownerName }}</td>
            <td>{{ reservation.attendees }}명</td>
            <td>{{ reservation.purpose }}</td>
            <td class="action-cell">
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
</script>

<style scoped>
.day-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-card {
  border: 1px solid #ddd;
  background: #fff;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.day-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.date {
  color: #555;
  font-weight: 700;
}

.count {
  padding: 4px 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #ddd;
  font-size: 14px;
  font-weight: 700;
}

.empty {
  padding: 16px;
  color: #666;
  background: #fafafa;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

th {
  background: #fafafa;
}

tbody tr:last-child td {
  border-bottom: none;
}

.action-cell {
  text-align: left;
  white-space: nowrap;
}

.edit-button,
.cancel-button {
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
}

.edit-button {
  border: 1px solid #0056b3;
  background: #fff;
  color: #0056b3;
  margin-right: 6px;
}

.edit-button:hover:not(:disabled) {
  background: #0056b3;
  color: #fff;
}

.cancel-button {
  border: 1px solid #dc2626;
  background: #fff;
  color: #dc2626;
}

.cancel-button:hover:not(:disabled) {
  background: #dc2626;
  color: #fff;
}

.edit-button:disabled,
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
