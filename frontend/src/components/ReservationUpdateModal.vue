<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    @click.self="$emit('close')"
  >
    <section class="modal">
      <header class="modal-header">
        <h2>회의실 예약 수정</h2>
        <button
          class="icon-button"
          type="button"
          aria-label="예약 수정 창 닫기"
          :disabled="submitting"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>

      <form class="reservation-form" @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-field">
            <label for="update-room-id">회의실</label>
            <select id="update-room-id" v-model="form.roomId" required :disabled="submitting">
              <option value="ROOM_1">회의실 1 / 6명</option>
              <option value="ROOM_2">회의실 2 / 12명</option>
            </select>
          </div>

          <div class="form-field">
            <label for="update-reservation-date">예약일</label>
            <input
              id="update-reservation-date"
              v-model="form.reservationDate"
              type="date"
              required
              :disabled="submitting"
            />
          </div>

          <div class="form-field">
            <label for="update-attendees">참석 인원</label>
            <input
              id="update-attendees"
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
            <label for="update-start-time">시작 시간</label>
            <input
              id="update-start-time"
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
            <label for="update-end-time">종료 시간</label>
            <input
              id="update-end-time"
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
            <label for="update-owner-name">예약자명</label>
            <input
              id="update-owner-name"
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
          <label for="update-purpose">회의 목적</label>
          <input
            id="update-purpose"
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
            {{ submitting ? "수정 중..." : "수정" }}
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
  reservation: {
    type: Object,
    default: null
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
  () => props.reservation,
  (newVal) => {
    if (newVal) {
      form.roomId = newVal.roomId || "ROOM_1";
      form.reservationDate = newVal.reservationDate || "";
      form.startTime = newVal.startTime || "10:00";
      form.endTime = newVal.endTime || "11:00";
      form.ownerName = newVal.ownerName || "";
      form.attendees = newVal.attendees || 1;
      form.purpose = newVal.purpose || "";
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit("submit", props.reservation.id, { ...form });
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

.error {
  margin: 16px 0 0;
  padding: 16px;
  border: 1px solid #f1c0c0;
  background: #fff5f5;
  color: #b00020;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
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
