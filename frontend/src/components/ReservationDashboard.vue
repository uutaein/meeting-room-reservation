<template>
  <main class="dashboard">
    <header class="dashboard-header">
      <h1>17층 회의실 예약 현황</h1>
      <p class="description">
        기준 날짜를 포함해 선택한 영업일 수만큼 예약 현황을 조회합니다.
      </p>
    </header>

    <section class="filter">
      <div class="filter-item">
        <label for="base-date">조회 기준일</label>
        <input
          id="base-date"
          v-model="baseDate"
          type="date"
          @change="loadReservations"
        />
      </div>

      <div class="filter-item">
        <label for="business-day-count">조회 범위</label>
        <select
          id="business-day-count"
          v-model.number="businessDayCount"
          @change="loadReservations"
        >
          <option :value="5">5영업일</option>
          <option :value="10">10영업일</option>
          <option :value="15">15영업일</option>
          <option :value="20">20영업일</option>
        </select>
      </div>
    </section>

    <section class="period-summary">
      <strong>조회 기간</strong>
      <span>{{ periodRangeText }}</span>
      <span class="summary-count">{{ businessDayCount }}영업일</span>
    </section>

    <section v-if="loading" class="message">
      예약 목록을 불러오는 중입니다.
    </section>

    <section v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </section>

    <section v-else class="day-list">
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
          예약 없음
        </div>

        <table v-else>
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
            <tr
              v-for="reservation in day.reservations"
              :key="reservation.id"
            >
              <td>{{ getRoomName(reservation.roomId) }}</td>
              <td>{{ reservation.startTime }} ~ {{ reservation.endTime }}</td>
              <td>{{ reservation.ownerName }}</td>
              <td>{{ reservation.attendees }}명</td>
              <td>{{ reservation.purpose }}</td>
              <td>{{ reservation.status }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { fetchReservationsByDate } from "../api/reservationApi.js";

const DEFAULT_BUSINESS_DAY_COUNT = 10;

const baseDate = ref(toDateInputValue(new Date()));
const businessDayCount = ref(DEFAULT_BUSINESS_DAY_COUNT);
const dailyReservations = ref([]);
const loading = ref(false);
const errorMessage = ref("");

const periodRangeText = computed(() => {
  if (dailyReservations.value.length === 0) {
    return "";
  }

  const firstDate = dailyReservations.value[0].date;
  const lastDate = dailyReservations.value[dailyReservations.value.length - 1].date;

  return `${firstDate} ~ ${lastDate}`;
});

onMounted(() => {
  loadReservations();
});

async function loadReservations() {
  loading.value = true;
  errorMessage.value = "";
  dailyReservations.value = [];

  try {
    const businessDays = getNextBusinessDays(
      baseDate.value,
      businessDayCount.value
    );

    const results = await Promise.all(
      businessDays.map(async (day) => {
        const reservations = await fetchReservationsByDate(day.date);

        return {
          ...day,
          reservations
        };
      })
    );

    dailyReservations.value = results;
  } catch (error) {
    dailyReservations.value = [];
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

function getNextBusinessDays(dateText, count) {
  const days = [];
  let currentDate = parseLocalDate(dateText);

  while (days.length < count) {
    if (isBusinessDay(currentDate)) {
      days.push({
        date: toDateInputValue(currentDate),
        label: getDayLabel(currentDate)
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  return days;
}

function isBusinessDay(date) {
  const day = date.getDay();

  return day !== 0 && day !== 6;
}

function getDayLabel(date) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return `${dayNames[date.getDay()]}요일`;
}

function addDays(date, days) {
  const copiedDate = new Date(date);
  copiedDate.setDate(copiedDate.getDate() + days);

  return copiedDate;
}

function parseLocalDate(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  max-width: 1080px;
  margin: 40px auto;
  padding: 24px;
  font-family: Arial, sans-serif;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.description {
  margin: 0;
  color: #666;
}

.filter {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.filter-item input,
.filter-item select {
  padding: 8px;
  font-size: 16px;
}

.period-summary {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.summary-count {
  padding: 4px 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #ddd;
  font-size: 13px;
  font-weight: 700;
}

.message {
  padding: 16px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.error {
  padding: 16px;
  border: 1px solid #f1c0c0;
  background: #fff5f5;
  color: #b00020;
  font-weight: 700;
}

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
</style>