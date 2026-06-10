<template>
  <main class="dashboard">
    <header class="dashboard-header-simple">
      <button class="primary-button-huge" type="button" @click="openCreateModal">
        ➕ 새 예약 등록하기 (여기를 누르세요)
      </button>
    </header>

    <p v-if="successMessage" class="success">
      {{ successMessage }}
    </p>

    <ReservationFilter
      v-model:baseDate="baseDate"
      v-model:businessDayCount="businessDayCount"
      :loading="loading"
      :submitting="submitting"
      :periodRangeText="periodRangeText"
      @change="loadReservations"
    />

    <section v-if="loading" class="message">
      예약 목록을 불러오는 중입니다.
    </section>

    <section v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </section>

    <section v-else>
      <ReservationDayList
        :dailyReservations="dailyReservations"
        :loading="loading"
        :submitting="submitting"
        @edit-reservation="openUpdateModal"
        @cancel-reservation="handleCancelReservation"
      />
    </section>

    <!-- Create Modal -->
    <ReservationCreateModal
      :isOpen="isCreateModalOpen"
      :baseDate="baseDate"
      :submitting="submitting"
      :errorMessage="formErrorMessage"
      @close="closeCreateModal"
      @submit="handleCreateSubmit"
    />

    <!-- Update Modal -->
    <ReservationUpdateModal
      :isOpen="isUpdateModalOpen"
      :reservation="selectedReservation"
      :submitting="submitting"
      :errorMessage="updateErrorMessage"
      @close="closeUpdateModal"
      @submit="handleUpdateSubmit"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  createReservation,
  fetchReservationsByDate,
  cancelReservation,
  updateReservation
} from "../api/reservationApi.js";
import ReservationFilter from "./ReservationFilter.vue";
import ReservationDayList from "./ReservationDayList.vue";
import ReservationCreateModal from "./ReservationCreateModal.vue";
import ReservationUpdateModal from "./ReservationUpdateModal.vue";

const DEFAULT_BUSINESS_DAY_COUNT = 10;

const today = toDateInputValue(new Date());

const baseDate = ref(today);
const businessDayCount = ref(DEFAULT_BUSINESS_DAY_COUNT);
const dailyReservations = ref([]);
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const formErrorMessage = ref("");
const updateErrorMessage = ref("");
const successMessage = ref("");
const isCreateModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
const selectedReservation = ref(null);

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
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  if (submitting.value) {
    return;
  }
  formErrorMessage.value = "";
  isCreateModalOpen.value = false;
}

function openUpdateModal(day, reservation) {
  updateErrorMessage.value = "";
  successMessage.value = "";
  selectedReservation.value = { ...reservation, reservationDate: day.date };
  isUpdateModalOpen.value = true;
}

function closeUpdateModal() {
  if (submitting.value) {
    return;
  }
  updateErrorMessage.value = "";
  selectedReservation.value = null;
  isUpdateModalOpen.value = false;
}

async function handleCreateSubmit(formData) {
  submitting.value = true;
  formErrorMessage.value = "";
  successMessage.value = "";

  try {
    await createReservation(formData);

    successMessage.value = "예약이 등록되었습니다.";
    baseDate.value = today;
    isCreateModalOpen.value = false;

    await loadReservations();
  } catch (error) {
    formErrorMessage.value = error.message;
  } finally {
    submitting.value = false;
  }
}

async function handleUpdateSubmit(id, formData) {
  submitting.value = true;
  updateErrorMessage.value = "";
  successMessage.value = "";

  try {
    await updateReservation(id, formData);

    successMessage.value = "예약이 변경되었습니다.";
    isUpdateModalOpen.value = false;
    selectedReservation.value = null;

    await loadReservations();
  } catch (error) {
    updateErrorMessage.value = error.message;
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
    return "서고";
  }

  if (roomId === "ROOM_2") {
    return "회의실";
  }

  return roomId;
}

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
  margin: 20px auto;
  padding: 24px;
  font-family: Arial, sans-serif;
}

.dashboard-header-simple {
  margin-bottom: 24px;
  width: 100%;
}

.primary-button-huge {
  width: 100%;
  padding: 22px 32px;
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, hsl(215, 90%, 55%), hsl(225, 90%, 45%));
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.primary-button-huge:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
  background: linear-gradient(135deg, hsl(215, 95%, 58%), hsl(225, 95%, 48%));
}

.primary-button-huge:active {
  transform: translateY(1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}

.message {
  padding: 24px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 12px;
  font-size: 20px;
  text-align: center;
}

.success {
  margin: 0 0 20px;
  padding: 18px;
  border: 2px solid #b7e4c7;
  border-radius: 12px;
  background: #f0fff4;
  color: #1b7f3a;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.error {
  margin: 20px 0 0;
  padding: 18px;
  border: 2px solid #f1c0c0;
  border-radius: 12px;
  background: #fff5f5;
  color: #b00020;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
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
</style>