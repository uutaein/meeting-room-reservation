<template>
  <section class="filter">
    <div class="filter-item">
      <label for="base-date">조회 기준일</label>
      <input
        id="base-date"
        :value="baseDate"
        type="date"
        :disabled="loading || submitting"
        @input="$emit('update:baseDate', $event.target.value)"
        @change="$emit('change')"
      />
    </div>

    <div class="filter-item">
      <label for="business-day-count">조회 범위</label>
      <select
        id="business-day-count"
        :value="businessDayCount"
        :disabled="loading || submitting"
        @change="onBusinessDayCountChange"
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
</template>

<script setup>
defineProps({
  baseDate: {
    type: String,
    required: true
  },
  businessDayCount: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  },
  periodRangeText: {
    type: String,
    required: true
  }
});

const emit = defineEmits([
  "update:baseDate",
  "update:businessDayCount",
  "change"
]);

function onBusinessDayCountChange(event) {
  emit("update:businessDayCount", Number(event.target.value));
  emit("change");
}
</script>

<style scoped>
.filter {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 20px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.filter-item {
  flex: 1;
}

.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 18px;
  color: var(--text-h);
}

.filter-item input,
.filter-item select {
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

.filter-item input:focus,
.filter-item select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.period-summary {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  border-radius: 14px;
  background: var(--accent-bg);
  border: 2px solid var(--accent-border);
  color: var(--text-h);
  font-size: 18px;
}

.period-summary strong {
  font-weight: 700;
  color: var(--accent);
}

.summary-count {
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--bg);
  border: 2px solid var(--accent-border);
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
}
</style>
