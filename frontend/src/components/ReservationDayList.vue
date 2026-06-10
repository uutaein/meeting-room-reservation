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
            <td class="col-room">{{ getRoomName(reservation.roomId) }}</td>
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
  table-layout: fixed;
}

th,
td {
  padding: 12px 6px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 14px;
}

th {
  background: #fafafa;
  font-weight: 700;
}

tbody tr:last-child td {
  border-bottom: none;
}

.col-room {
  width: 13%;
}

.col-time {
  width: 21%;
}

.col-owner {
  width: 13%;
}

.col-attendees {
  width: 10%;
}

.col-purpose {
  width: 25%;
}

.col-action {
  width: 18%;
}

.purpose-cell {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
