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
</style>
