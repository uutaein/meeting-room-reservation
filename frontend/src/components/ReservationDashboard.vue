<template>
  <main class="dashboard">
    <div class="dashboard-top">
      <header class="dashboard-header-simple">
        <button class="primary-button-huge" type="button" @click="openCreateModal">
          새 예약 등록하기 (여기를 누르세요)
        </button>
      </header>

      <ReservationFilter
        v-model:baseDate="baseDate"
        v-model:businessDayCount="businessDayCount"
        :loading="loading"
        :submitting="submitting"
        :periodRangeText="periodRangeText"
        @change="loadReservations"
      />
    </div>

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
        @cancel-reservation="openCancelConfirm"
      />
    </section>

    <ReservationCreateModal
      :isOpen="isCreateModalOpen"
      :baseDate="baseDate"
      :dailyReservations="dailyReservations"
      :submitting="submitting"
      :errorMessage="formErrorMessage"
      @close="closeCreateModal"
      @submit="handleCreateSubmit"
    />

    <ReservationUpdateModal
      :isOpen="isUpdateModalOpen"
      :reservation="selectedReservation"
      :dailyReservations="dailyReservations"
      :submitting="submitting"
      :errorMessage="updateErrorMessage"
      @close="closeUpdateModal"
      @submit="handleUpdateSubmit"
    />

    <div
      v-if="isCancelConfirmOpen"
      class="cancel-confirm-backdrop"
      @click.self="closeCancelConfirm"
    >
      <section class="cancel-confirm-modal" role="dialog" aria-modal="true" aria-label="예약 취소 확인">
        <header class="cancel-confirm-header">
          <h2>예약 취소</h2>
          <button
            class="cancel-confirm-close"
            type="button"
            :disabled="submitting"
            @click="closeCancelConfirm"
          >
            ×
          </button>
        </header>

        <p class="cancel-confirm-message">
          {{ cancelConfirmMessage }}
        </p>

        <div class="cancel-confirm-actions">
          <button
            class="secondary-button"
            type="button"
            :disabled="submitting"
            @click="closeCancelConfirm"
          >
            아니요
          </button>

          <button
            class="danger-button"
            type="button"
            :disabled="submitting"
            @click="confirmCancelReservation"
          >
            {{ submitting ? "취소 중..." : "예, 취소할게요" }}
          </button>
        </div>
      </section>
    </div>

    <transition name="toast-fade">
      <div v-if="toastMessage" class="toast" :class="`toast-${toastType}`">
        {{ toastMessage }}
      </div>
    </transition>
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
const isCreateModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
const selectedReservation = ref(null);
const isCancelConfirmOpen = ref(false);
const cancelTarget = ref(null);
const toastMessage = ref("");
const toastType = ref("success");
let toastTimer = null;

const periodRangeText = computed(() => {
  if (dailyReservations.value.length === 0) {
    return "";
  }

  const firstDate = dailyReservations.value[0].date;
  const lastDate = dailyReservations.value[dailyReservations.value.length - 1].date;

  return `${firstDate} ~ ${lastDate}`;
});

const cancelConfirmMessage = computed(() => {
  const target = cancelTarget.value;
  if (!target) {
    return "";
  }

  return `${target.day.date} ${target.reservation.startTime}~${target.reservation.endTime} ${getRoomName(
    target.reservation.roomId
  )} 예약을 취소할까요?`;
});

onMounted(() => {
  loadReservations();
});

function openCreateModal() {
  formErrorMessage.value = "";
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  if (submitting.value) return;
  formErrorMessage.value = "";
  isCreateModalOpen.value = false;
}

function openUpdateModal(day, reservation) {
  updateErrorMessage.value = "";
  selectedReservation.value = { ...reservation, reservationDate: day.date };
  isUpdateModalOpen.value = true;
}

function closeUpdateModal() {
  if (submitting.value) return;
  updateErrorMessage.value = "";
  selectedReservation.value = null;
  isUpdateModalOpen.value = false;
}

function openCancelConfirm(day, reservation) {
  if (submitting.value) return;
  errorMessage.value = "";
  cancelTarget.value = { day, reservation };
  isCancelConfirmOpen.value = true;
}

function closeCancelConfirm() {
  if (submitting.value) return;
  isCancelConfirmOpen.value = false;
  cancelTarget.value = null;
}

async function handleCreateSubmit(formData) {
  submitting.value = true;
  formErrorMessage.value = "";

  try {
    await createReservation(formData);
    showToast("예약이 등록되었습니다.");
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

  try {
    await updateReservation(id, formData);
    showToast("예약이 변경되었습니다.");
    isUpdateModalOpen.value = false;
    selectedReservation.value = null;
    await loadReservations();
  } catch (error) {
    updateErrorMessage.value = error.message;
  } finally {
    submitting.value = false;
  }
}

async function confirmCancelReservation() {
  if (!cancelTarget.value) {
    closeCancelConfirm();
    return;
  }

  submitting.value = true;
  errorMessage.value = "";

  try {
    await cancelReservation(cancelTarget.value.reservation.id);
    showToast("예약이 취소되었습니다.");
    isCancelConfirmOpen.value = false;
    cancelTarget.value = null;
    await loadReservations();
  } catch (error) {
    errorMessage.value = error.message || "예약 취소에 실패했습니다.";
  } finally {
    submitting.value = false;
  }
}

async function loadReservations() {
  loading.value = true;
  errorMessage.value = "";
  dailyReservations.value = [];

  try {
    const businessDays = getNextBusinessDays(baseDate.value, businessDayCount.value);

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
  if (roomId === "ROOM_1") return "서고";
  if (roomId === "ROOM_2") return "회의실";
  return roomId;
}

function showToast(message, type = "success") {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastMessage.value = message;
  toastType.value = type;

  toastTimer = window.setTimeout(() => {
    toastMessage.value = "";
    toastTimer = null;
  }, 2200);
}
</script>

<style scoped>
.dashboard {
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 92px 14px 18px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.dashboard-top {
  margin-bottom: 14px;
  padding: 10px 0 8px;
}

.dashboard-header-simple {
  position: fixed;
  top: 12px;
  left: 14px;
  right: 14px;
  z-index: 1200;
  margin-bottom: 10px;
  padding: 8px 0 10px;
  background: linear-gradient(to bottom, var(--bg) 86%, hsla(0, 0%, 100%, 0));
  backdrop-filter: blur(10px);
  width: auto;
  max-width: calc(100% - 28px);
}

.primary-button-huge {
  width: 100%;
  padding: 14px 22px;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, hsl(215, 90%, 55%), hsl(225, 90%, 45%));
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow:
    0 0 0 0 rgba(59, 130, 246, 0.32),
    0 10px 18px rgba(37, 99, 235, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: create-button-pulse 1.8s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.primary-button-huge:hover {
  transform: translateY(-1px) scale(1.01);
  filter: brightness(1.05);
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.24),
    0 12px 24px rgba(37, 99, 235, 0.28);
}

.primary-button-huge:active {
  transform: translateY(1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}

@keyframes create-button-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 0 rgba(59, 130, 246, 0.28),
      0 10px 18px rgba(37, 99, 235, 0.22);
  }
  50% {
    box-shadow:
      0 0 0 4px rgba(59, 130, 246, 0.12),
      0 12px 24px rgba(37, 99, 235, 0.32);
  }
}

.message {
  padding: 18px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 12px;
  font-size: 18px;
  text-align: center;
}

.error {
  margin: 16px 0 0;
  padding: 16px;
  border: 2px solid #f1c0c0;
  border-radius: 12px;
  background: #fff5f5;
  color: #b00020;
  font-size: 17px;
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

.danger-button {
  border: 1px solid #dc2626;
  background: #dc2626;
  color: #fff;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px;
}

.danger-button:hover:not(:disabled) {
  filter: brightness(1.05);
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.28);
}

.danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.42);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
}

.cancel-confirm-modal {
  width: min(420px, 100%);
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg);
  box-shadow: var(--shadow-lg);
  padding: 20px;
}

.cancel-confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.cancel-confirm-header h2 {
  margin: 0;
  font-size: 22px;
}

.cancel-confirm-close {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  font-size: 24px;
  cursor: pointer;
}

.cancel-confirm-message {
  margin: 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: hsla(0, 80%, 60%, 0.06);
  border: 1px solid hsla(0, 80%, 60%, 0.18);
  color: var(--text-h);
  font-size: 16px;
  line-height: 1.5;
}

.cancel-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.toast {
  position: fixed;
  left: 50%;
  top: 18px;
  transform: translateX(-50%);
  z-index: 3000;
  min-width: min(360px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  padding: 14px 18px;
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  border: 1px solid transparent;
}

.toast-success {
  background: #f0fff4;
  border-color: #b7e4c7;
  color: #1b7f3a;
}

.toast-error {
  background: #fff5f5;
  border-color: #f1c0c0;
  color: #b00020;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
