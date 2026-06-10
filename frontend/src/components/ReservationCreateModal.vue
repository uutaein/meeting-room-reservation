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
              :disabled="submitting"
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
              :disabled="submitting"
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
              :disabled="submitting"
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
              :disabled="submitting"
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

        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
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

          <button class="primary-button" type="submit" :disabled="submitting">
            {{ submitting ? "등록 중..." : "등록" }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  baseDate: {
    type: String,
    required: true
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
  purpose: ""
});

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      form.roomId = "ROOM_1";
      form.reservationDate = props.baseDate;
      form.startTime = "10:00";
      form.endTime = "11:00";
      form.ownerName = "";
      form.attendees = 1;
      form.purpose = "";
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit("submit", { ...form });
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

@media (max-width: 680px) {
  .form-row {
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

.error {
  margin: 16px 0 0;
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
  border: 2px solid var(--accent);
  background: var(--accent);
  color: #fff;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  filter: brightness(1.05);
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
</style>
