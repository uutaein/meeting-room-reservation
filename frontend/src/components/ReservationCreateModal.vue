<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    @click.self="$emit('close')"
  >
    <section class="modal">
      <header class="modal-header">
        <h2>회의실 예약 등록</h2>
        <button
          class="icon-button"
          type="button"
          aria-label="예약 등록 창 닫기"
          :disabled="submitting"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>

      <form class="reservation-form" @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-field">
            <label for="room-id">회의실</label>
            <select id="room-id" v-model="form.roomId" required :disabled="submitting">
              <option value="ROOM_1">서고</option>
              <option value="ROOM_2">회의실</option>
            </select>
          </div>

          <div class="form-field">
            <label for="reservation-date">예약일 / 시작일</label>
            <div class="date-adjuster">
              <button type="button" class="adjust-btn" @click="adjustDate(-1)" :disabled="submitting || isPrevDateDisabled">
                하루 전
              </button>
              <input
                id="reservation-date"
                v-model="form.reservationDate"
                type="date"
                required
                :disabled="submitting"
                :min="minDate"
              />
              <button type="button" class="adjust-btn" @click="adjustDate(1)" :disabled="submitting">
                다음날
              </button>
            </div>
          </div>

          <div class="form-field">
            <label for="attendees">참석 인원</label>
            <input
              id="attendees"
              v-model.number="form.attendees"
              type="number"
              min="1"
              required
              :disabled="submitting"
            />
          </div>
        </div>

        <div class="form-row-2col">
          <div class="form-field">
            <label for="start-time">시작 시간</label>
            <div class="time-picker-custom">
              <select v-model="startHour" class="time-select" :disabled="submitting">
                <option v-for="h in hours" :key="h" :value="h">{{ h }}시</option>
              </select>
              <select v-model="startMinute" class="time-select" :disabled="submitting">
                <option v-for="m in minutes" :key="m" :value="m">{{ m }}분</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label for="end-time">종료 시간</label>
            <div class="time-picker-custom">
              <select v-model="endHour" class="time-select" :disabled="submitting">
                <option v-for="h in hours" :key="h" :value="h">{{ h }}시</option>
              </select>
              <select v-model="endMinute" class="time-select" :disabled="submitting">
                <option v-for="m in minutes" :key="m" :value="m">{{ m }}분</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-row-2col">
          <div class="form-field">
            <label for="owner-name">예약자명</label>
            <input
              id="owner-name"
              v-model.trim="form.ownerName"
              type="text"
              minlength="2"
              maxlength="6"
              required
              :disabled="submitting"
            />
          </div>

          <div class="form-field">
            <label for="contact">연락처</label>
            <input
              id="contact"
              v-model.trim="form.contact"
              type="text"
              required
              :disabled="submitting"
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
            :disabled="submitting"
          />
        </div>

        <!-- 주간 반복 예약 체크박스 -->
        <div class="form-field checkbox-field">
          <label class="checkbox-label">
            <input
              id="is-recurring"
              v-model="isRecurring"
              type="checkbox"
              :disabled="submitting"
            />
            <span>주간 반복 예약으로 등록</span>
          </label>
        </div>

        <!-- 주간 반복 예약 전용 입력 영역 -->
        <div v-if="isRecurring" class="recurring-fields-container">
          <div class="form-row">
            <div class="form-field">
              <label for="recurring-title">반복 예약 제목</label>
              <input
                id="recurring-title"
                v-model.trim="form.recurringTitle"
                type="text"
                required
                :disabled="submitting"
                placeholder="예: 주간회의"
              />
            </div>
            <div class="form-field">
              <label>반복 요일</label>
              <input
                type="text"
                :value="weekdayName"
                disabled
                class="readonly-input"
              />
            </div>
            <div class="form-field">
              <label for="end-month">반복 종료월</label>
              <input
                id="end-month"
                v-model="form.endMonth"
                type="month"
                required
                :disabled="submitting"
              />
            </div>
          </div>

          <!-- 충돌 및 가능한 날짜 미리보기 결과 영역 -->
          <div v-if="recurringPreview" class="preview-box">
            <h3>예약 미리보기 결과</h3>
            <p>예상 생성 건수: <strong>{{ recurringPreview.totalCount }}건</strong></p>
            
            <div v-if="recurringPreview.conflicts.length > 0" class="conflict-alert">
              <p class="warning-text">⚠️ 일부 날짜에 기존 예약과 시간이 겹칩니다.</p>
              <ul>
                <li v-for="d in recurringPreview.conflicts" :key="d" class="conflict-date">
                  {{ d }} (충돌)
                </li>
              </ul>
              
              <label class="checkbox-label conflict-checkbox">
                <input
                  id="create-available-only"
                  v-model="form.createAvailableOnly"
                  type="checkbox"
                  :disabled="submitting"
                />
                <span>겹치는 날짜를 제외하고 가능한 날짜만 생성합니다. ({{ recurringPreview.availableCount }}건)</span>
              </label>
            </div>
            
            <div v-else class="success-text">
              ✨ 모든 회차가 예약 가능합니다!
            </div>
            
            <div class="occurrences-list">
              <h4>생성 예정 날짜 목록</h4>
              <div class="date-tags">
                <span
                  v-for="d in recurringPreview.occurrences"
                  :key="d"
                  :class="['date-tag', { 'conflict-tag': recurringPreview.conflicts.includes(d) }]"
                >
                  {{ d }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="previewError" class="error">
            {{ previewError }}
          </div>
        </div>

        <p v-if="suggestionMessage" class="notice">
          {{ suggestionMessage }}
        </p>

        <p v-if="errorMessage || localError" class="error">
          {{ errorMessage || localError }}
        </p>

        <div class="modal-actions">
          <button
            class="secondary-button"
            type="button"
            :disabled="submitting"
            @click="$emit('close')"
          >
            취소
          </button>

          <button
            :class="['primary-button', { 'primary-button-warning': suggestionMessage }]"
            type="submit"
            :disabled="submitting"
          >
            {{ submitting ? "계속 수행 중..." : "계속 수행" }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, watch, computed } from "vue";
import { getRoomSuggestionMessage } from "../utils/reservationWarnings.js";
import { previewRecurringReservation } from "../api/reservationApi.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  baseDate: {
    type: String,
    required: true
  },
  dailyReservations: {
    type: Array,
    default: () => []
  },
  submitting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["close", "submit"]);

const form = reactive({
  roomId: "ROOM_1",
  reservationDate: "",
  startTime: "10:00",
  endTime: "11:00",
  ownerName: "",
  attendees: 1,
  purpose: "",
  contact: "",
  recurringTitle: "",
  endMonth: "",
  createAvailableOnly: false
});

const isRecurring = ref(false);
const recurringPreview = ref(null);
const previewError = ref("");

const weekdayName = computed(() => {
  if (!form.reservationDate) return "";
  const [y, m, d] = form.reservationDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return dayNames[date.getDay()];
});

const hours = Array.from({ length: 13 }, (_, i) => String(i + 8).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const startHour = ref("10");
const startMinute = ref("00");
const endHour = ref("11");
const endMinute = ref("00");
const localError = ref("");
const suggestionMessage = ref("");
const confirmedWarning = ref(false);

const minDate = computed(() => {
  const tzOffset = 9 * 60 * 60 * 1000;
  const localTime = new Date(Date.now() + tzOffset);
  return localTime.toISOString().substring(0, 10);
});

const isPrevDateDisabled = computed(() => {
  if (!form.reservationDate) return true;
  const [y, m, d] = form.reservationDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  let direction = -1;
  let attempts = 0;
  do {
    date.setDate(date.getDate() + direction);
    attempts++;
    if (attempts > 30) break;
  } while (date.getDay() === 0 || date.getDay() === 6);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const prevDateStr = `${year}-${month}-${day}`;
  
  return prevDateStr < minDate.value;
});

watch([startHour, startMinute], () => {
  form.startTime = `${startHour.value}:${startMinute.value}`;
});

watch([endHour, endMinute], () => {
  form.endTime = `${endHour.value}:${endMinute.value}`;
});

watch(
  () => [form.roomId, form.reservationDate, form.startTime, form.endTime, form.attendees],
  () => {
    confirmedWarning.value = false;
    suggestionMessage.value = "";
  }
);

watch(isRecurring, (newVal) => {
  if (!newVal) {
    form.recurringTitle = "";
    form.endMonth = "";
    form.createAvailableOnly = false;
    recurringPreview.value = null;
    previewError.value = "";
  } else {
    form.recurringTitle = "주간회의";
  }
});

watch(
  () => [
    isRecurring.value,
    form.roomId,
    form.reservationDate,
    form.startTime,
    form.endTime,
    form.endMonth,
    form.recurringTitle
  ],
  async () => {
    if (!isRecurring.value || !form.reservationDate || !form.endMonth) {
      recurringPreview.value = null;
      previewError.value = "";
      return;
    }

    if (!/^\d{4}-\d{2}$/.test(form.endMonth)) {
      previewError.value = "반복 종료월은 YYYY-MM 형식이어야 합니다.";
      recurringPreview.value = null;
      return;
    }

    try {
      const result = await previewRecurringReservation({
        roomId: form.roomId,
        recurringTitle: form.recurringTitle || "주간회의",
        reservationDate: form.reservationDate,
        startTime: form.startTime,
        endTime: form.endTime,
        endMonth: form.endMonth
      });
      recurringPreview.value = result;
      previewError.value = "";
    } catch (err) {
      previewError.value = err.message;
      recurringPreview.value = null;
    }
  }
);

watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) return;

    isRecurring.value = false;
    form.roomId = "ROOM_1";
    form.reservationDate = props.baseDate;
    form.startTime = "10:00";
    form.endTime = "11:00";
    startHour.value = "10";
    startMinute.value = "00";
    endHour.value = "11";
    endMinute.value = "00";
    form.ownerName = "";
    form.attendees = 1;
    form.purpose = "";
    form.contact = "";
    form.recurringTitle = "";
    form.endMonth = "";
    form.createAvailableOnly = false;
    localError.value = "";
    suggestionMessage.value = "";
    confirmedWarning.value = false;
    recurringPreview.value = null;
    previewError.value = "";
  },
  { immediate: true }
);

function adjustDate(direction) {
  if (!form.reservationDate) return;

  const [y, m, d] = form.reservationDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  let attempts = 0;
  do {
    date.setDate(date.getDate() + direction);
    attempts++;
    if (attempts > 30) break;
  } while (date.getDay() === 0 || date.getDay() === 6);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const nextDateStr = `${year}-${month}-${day}`;

  if (nextDateStr < minDate.value) {
    return;
  }

  form.reservationDate = nextDateStr;
}

function handleSubmit() {
  const tzOffset = 9 * 60 * 60 * 1000;
  const localTime = new Date(Date.now() + tzOffset);
  const isoStr = localTime.toISOString();
  const todayStr = isoStr.substring(0, 10);
  const currentTimeStr = isoStr.substring(11, 16);

  if (form.reservationDate < todayStr) {
    localError.value = "이미 지난 날짜나 시간에는 예약할 수 없습니다.";
    return;
  }
  if (form.reservationDate === todayStr && form.startTime <= currentTimeStr) {
    localError.value = "이미 지난 날짜나 시간에는 예약할 수 없습니다.";
    return;
  }

  const contactClean = String(form.contact).trim();
  if (!/^[0-9-]+$/.test(contactClean)) {
    localError.value = "연락처는 숫자와 하이픈만 입력할 수 있습니다.";
    return;
  }

  const warning = getRoomSuggestionMessage({
    dailyReservations: props.dailyReservations,
    reservationDate: form.reservationDate,
    roomId: form.roomId,
    attendees: form.attendees,
    startTime: form.startTime,
    endTime: form.endTime
  });

  if (warning && !confirmedWarning.value) {
    suggestionMessage.value = warning;
    confirmedWarning.value = true;
    return;
  }

  localError.value = "";
  suggestionMessage.value = "";
  confirmedWarning.value = false;
  emit("submit", { ...form, isRecurring: isRecurring.value });
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: hsla(260, 25%, 8%, 0.45);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.modal {
  width: min(760px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg);
  box-shadow: var(--shadow-lg);
  animation: modal-fade-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-fade-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-h);
}

.icon-button {
  width: 42px;
  height: 42px;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-button:hover:not(:disabled) {
  background: var(--border);
  color: var(--text-h);
}

.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-row-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 680px) {
  .form-row,
  .form-row-2col {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 18px;
  color: var(--text-h);
}

.form-field input,
.form-field select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text-h);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-field input:focus,
.form-field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.checkbox-field {
  margin: 10px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  color: var(--text-h);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.recurring-fields-container {
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 20px;
  background: hsla(260, 20%, 95%, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.readonly-input {
  background: var(--border) !important;
  color: var(--text) !important;
  cursor: not-allowed;
}

.preview-box {
  margin-top: 12px;
  padding: 16px;
  background: hsla(260, 20%, 95%, 0.02);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.preview-box h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  color: var(--text-h);
}

.conflict-alert {
  padding: 12px;
  background: hsla(0, 80%, 60%, 0.08);
  border: 1px solid hsla(0, 80%, 60%, 0.2);
  border-radius: 8px;
  margin: 12px 0;
}

.warning-text {
  color: hsl(0, 80%, 45%);
  font-weight: 700;
  margin: 0 0 8px 0;
}

.conflict-date {
  color: hsl(0, 80%, 45%);
  font-size: 14px;
}

.conflict-checkbox {
  margin-top: 10px;
  font-size: 15px;
}

.success-text {
  color: hsl(140, 70%, 35%);
  font-weight: 700;
  margin: 12px 0;
}

.occurrences-list {
  margin-top: 12px;
}

.occurrences-list h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: var(--text);
}

.date-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.date-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--border);
  color: var(--text-h);
  font-size: 13px;
  font-weight: 600;
}

.conflict-tag {
  background: hsla(0, 80%, 60%, 0.2);
  color: hsl(0, 80%, 40%);
  text-decoration: line-through;
}

.notice {
  margin: 0;
  padding: 18px;
  border: 2px solid hsla(215, 90%, 55%, 0.25);
  border-radius: 12px;
  background: hsla(215, 90%, 55%, 0.08);
  color: hsl(215, 90%, 40%);
  font-weight: 700;
  font-size: 18px;
  text-align: center;
}

.error {
  margin: 0;
  padding: 18px;
  border: 2px solid hsla(0, 80%, 60%, 0.2);
  border-radius: 12px;
  background: hsla(0, 80%, 60%, 0.05);
  color: hsl(0, 80%, 50%);
  font-weight: 700;
  font-size: 18px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 2px solid var(--border);
}

.primary-button,
.secondary-button {
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary-button {
  min-width: 160px;
  border: 2px solid var(--accent);
  background: var(--accent);
  color: #fff;
  white-space: nowrap;
}

.primary-button-warning {
  border-color: hsl(0, 80%, 50%);
  background: hsl(0, 80%, 50%);
  color: #fff;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  filter: brightness(1.05);
}

.primary-button-warning:hover:not(:disabled) {
  background: hsl(0, 80%, 45%);
  border-color: hsl(0, 80%, 45%);
}

.secondary-button {
  border: 2px solid var(--border);
  background: transparent;
  color: var(--text);
}

.secondary-button:hover:not(:disabled) {
  background: var(--border);
  color: var(--text-h);
}

.primary-button:disabled,
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
  transform: none;
  box-shadow: none;
}

.date-adjuster {
  display: flex;
  align-items: center;
  gap: 8px;
}

.adjust-btn {
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 700;
  border: 2px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.adjust-btn:hover:not(:disabled) {
  background: var(--border);
}

.adjust-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.time-picker-custom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-select {
  flex: 1;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text-h);
  outline: none;
  transition: all 0.2s;
}

.time-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}
</style>

