<template>
  <main class="dashboard">
    <h1>17층 회의실 예약 현황</h1>

    <section class="filter">
      <label for="reservation-date">조회 날짜</label>
      <input
        id="reservation-date"
        v-model="selectedDate"
        type="date"
        @change="loadReservations"
      />
    </section>

    <section v-if="loading">
      예약 목록을 불러오는 중입니다.
    </section>

    <section v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </section>

    <section v-else-if="reservations.length === 0" class="empty">
      해당 날짜의 예약이 없습니다.
    </section>

    <section v-else class="reservation-list">
      <table>
        <thead>
          <tr>
            <th>회의실</th>
            <th>시간</th>
            <th>예약자</th>
            <th>인원</th>
            <th>목적</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in reservations" :key="reservation.id">
            <td>{{ getRoomName(reservation.roomId) }}</td>
            <td>{{ reservation.startTime }} ~ {{ reservation.endTime }}</td>
            <td>{{ reservation.ownerName }}</td>
            <td>{{ reservation.attendees }}명</td>
            <td>{{ reservation.purpose }}</td>
            <td>{{ reservation.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { fetchReservationsByDate } from "../api/reservationApi.js";

const selectedDate = ref("2026-06-10");
const reservations = ref([]);
const loading = ref(false);
const errorMessage = ref("");

onMounted(() => {
  loadReservations();
});

async function loadReservations() {
  loading.value = true;
  errorMessage.value = "";

  try {
    reservations.value = await fetchReservationsByDate(selectedDate.value);
  } catch (error) {
    reservations.value = [];
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

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
.dashboard {
  max-width: 960px;
  margin: 40px auto;
  padding: 24px;
  font-family: Arial, sans-serif;
}

.filter {
  margin-bottom: 24px;
}

.filter label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.filter input {
  padding: 8px;
  font-size: 16px;
}

.error {
  color: #b00020;
  font-weight: 700;
}

.empty {
  padding: 24px;
  border: 1px solid #ddd;
  background: #fafafa;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background: #f5f5f5;
}
</style>