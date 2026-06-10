<template>
  <main class="dashboard">
    <header class="dashboard-header">
      <div>
        <h1>17층 회의실 예약 현황</h1>
        <p class="description">
          기준 날짜를 포함해 선택한 영업일 수만큼 예약 현황을 조회합니다.
        </p>
      </div>

      <button class="primary-button" type="button" @click="openCreateModal">
        예약 등록
      </button>
    </header>

    <p v-if="successMessage" class="success">
      {{ successMessage }}
    </p>

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
              <td>{{ reservation.status }}</td>
                <td>
                <button
                  type="button"
                  class="cancel-button"
                  @click="handleCancelReservation(day, reservation)"
                >
                  취소
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>

    <div
      v-if="isCreateModalOpen"
      class="modal-backdrop"
      @click.self="closeCreateModal"
    >
      <section class="modal">
        <header class="modal-header">
          <h2>회의실 예약 등록</h2>
          <button
            class="icon-button"
            type="button"
            aria-label="예약 등록 창 닫기"
            @click="closeCreateModal"
          >
            ×
          </button>
        </header>

        <form class="reservation-form" @submit.prevent="submitReservation">
          <div class="form-row">
            <div class="form-field">
              <label for="room-id">회의실</label>
              <select id="room-id" v-model="form.roomId" required>
                <option value="ROOM_1">회의실 1 / 6명</option>
                <option value="ROOM_2">회의실 2 / 12명</option>
              </select>
            </div>

            <div class="form-field">
              <label for="reservation-date">예약일</label>
              <input
                id="reservation-date"
                v-model="form.reservationDate"
                type="date"
                required
              />
            </div>

            <div class="form-field">
              <label for="attendees">참석 인원</label>
              <input
                id="attendees"
                v-model.number="form.attendees"
                type="number"
                min="1"
                max="12"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="start-time">시작 시간</label>
              <input
                id="start-time"
                v-model="form.startTime"
                type="time"
                min="08:00"
                max="20:00"
                step="1800"
                required
              />
            </div>

            <div class="form-field">
              <label for="end-time">종료 시간</label>
              <input
                id="end-time"
                v-model="form.endTime"
                type="time"
                min="08:00"
                max="20:00"
                step="1800"
                required
              />
            </div>

            <div class="form-field">
              <label for="owner-name">예약자명</label>
              <input
                id="owner-name"
                v-model.trim="form.ownerName"
                type="text"
                minlength="2"
                maxlength="6"
                required
              />
            </div>
          </div>

          <div class="form-field">
            <label for="purpose">회의 목적</label>
            <input
              id="purpose"
              v-model.trim="form.purpose"
              type="text"
              maxlength="30"
              required
            />
          </div>

          <p v-if="formErrorMessage" class="error">
            {{ formErrorMessage }}
          </p>

          <div class="modal-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="submitting"
              @click="closeCreateModal"
            >
              취소
            </button>

            <button class="primary-button" type="submit" :disabled="submitting">
              {{ submitting ? "등록 중..." : "등록" }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  createReservation,
  fetchReservationsByDate,
  cancelReservation
} from "../api/reservationApi.js";

const DEFAULT_BUSINESS_DAY_COUNT = 10;

const today = toDateInputValue(new Date());

const baseDate = ref(today);
const businessDayCount = ref(DEFAULT_BUSINESS_DAY_COUNT);
const dailyReservations = ref([]);
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const formErrorMessage = ref("");
const successMessage = ref("");
const isCreateModalOpen = ref(false);

const form = reactive({
  roomId: "ROOM_1",
  reservationDate: today,
  startTime: "10:00",
  endTime: "11:00",
  ownerName: "",
  attendees: 1,
  purpose: ""
});

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

function openCreateModal() {
  formErrorMessage.value = "";
  successMessage.value = "";
  form.reservationDate = baseDate.value;
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  if (submitting.value) {
    return;
  }

  formErrorMessage.value = "";
  isCreateModalOpen.value = false;
}

async function submitReservation() {
  submitting.value = true;
  formErrorMessage.value = "";
  successMessage.value = "";

  try {
    await createReservation({
      roomId: form.roomId,
      reservationDate: form.reservationDate,
      startTime: form.startTime,
      endTime: form.endTime,
      ownerName: form.ownerName,
      attendees: form.attendees,
      purpose: form.purpose
    });

    successMessage.value = "예약이 등록되었습니다.";
    baseDate.value = form.reservationDate;
    isCreateModalOpen.value = false;

    resetFormAfterSubmit();
    await loadReservations();
  } catch (error) {
    formErrorMessage.value = error.message;
  } finally {
    submitting.value = false;
  }
}

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

function resetFormAfterSubmit() {
  form.roomId = "ROOM_1";
  form.reservationDate = baseDate.value;
  form.startTime = "10:00";
  form.endTime = "11:00";
  form.ownerName = "";
  form.attendees = 1;
  form.purpose = "";
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

// feature/vue-reservation-cancel
async function handleCancelReservation(day, reservation) {
  const confirmed = window.confirm(
    `${day.date} ${reservation.startTime}~${reservation.endTime} ${getRoomName(
      reservation.roomId
    )} 예약을 취소하시겠습니까?`
  );

  if (!confirmed) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await cancelReservation(reservation.id);

    successMessage.value = "예약이 취소되었습니다.";

    await loadReservations();
  } catch (error) {
    errorMessage.value = error.message || "예약 취소에 실패했습니다.";
  } finally {
    loading.value = false;
  }
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
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
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

.success {
  margin: 0 0 16px;
  padding: 12px;
  border: 1px solid #b7e4c7;
  background: #f0fff4;
  color: #1b7f3a;
  font-weight: 700;
}

.error {
  margin: 16px 0 0;
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

.primary-button,
.secondary-button {
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #222;
  background: #222;
  color: #fff;
}

.secondary-button {
  border: 1px solid #ccc;
  background: #fff;
  color: #222;
}

.primary-button:disabled,
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 0 0 / 45%);
  z-index: 1000;
}

.modal {
  width: min(760px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  border: 1px solid #ddd;
  background: #fff;
  box-shadow: 0 12px 40px rgb(0 0 0 / 20%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
}

.icon-button {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.form-field input,
.form-field select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
}
</style>