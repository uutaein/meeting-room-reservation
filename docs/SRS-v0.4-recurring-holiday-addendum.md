# SRS v0.4 Addendum — 반복 예약 공휴일 제외

| 항목 | 내용 |
|---|---|
| 문서번호 | MROOM-SRS-0.4-HOL |
| 상태 | Proposed baseline addendum |
| 작성일 | 2026-06-12 |
| 기준 SRS | `docs/SRS-v0.4-weekly-recurring-baseline.md` |
| 관련 PRD | `docs/PRD-v0.6-recurring-holiday-addendum.md` |
| 관련 ADR | `docs/adr/ADR-0002-01-recurring-holiday-exclusion.md` |

---

## 1. 목적

이 문서는 주간 반복 예약에서 공휴일 회차를 처리하는 요구사항을 정의한다.

---

## 2. 비즈니스 규칙

| 규칙 ID | 항목 | 확정값 |
|---|---|---|
| BR-REC-HOL-001 | 공휴일 회차 표시 | 미리보기에서 별도 표시 |
| BR-REC-HOL-002 | 공휴일 회차 생성 | 생성하지 않음 |
| BR-REC-HOL-003 | 공휴일 제외 방식 | 기본 제외 |
| BR-REC-HOL-004 | 공휴일 데이터 없음 | 지원 연도 밖이면 오류 처리 |

---

## 3. 기능 요구사항

- **REQ-REC-200-preview-holidays** — 반복 예약 미리보기는 공휴일 회차를 별도 목록으로 표시한다.

- **REQ-REC-201-create-exclude-holidays** — 반복 예약 생성 시 공휴일 회차는 생성하지 않는다.

- **REQ-REC-400-holiday-data-unavailable** — 반복 예약 기간에 지원하지 않는 연도가 포함되고 공휴일 데이터를 확인할 수 없으면 반복 예약 미리보기와 생성을 중단한다.

- **REQ-REC-200-count-excludes-holidays** — 반복 예약 생성 가능 건수는 공휴일 회차를 제외한 건수를 기준으로 계산한다.

---

## 4. 화면 요구사항

- **REQ-UI-REC-HOL-001-show-excluded-holidays** — 반복 예약 미리보기 화면은 공휴일 제외 날짜 목록을 표시한다.

- **REQ-UI-REC-HOL-002-count-summary** — 반복 예약 미리보기 화면은 전체 계산 대상 건수, 충돌 건수, 공휴일 제외 건수, 생성 가능 건수를 구분해서 표시한다.

---

## 5. 오류 및 안내 메시지 후보

| 코드 후보 | 메시지 후보 | 발생 조건 |
|---|---|---|
| ERR_HOLIDAY_DATA_UNAVAILABLE | 해당 연도의 공휴일 데이터가 준비되지 않았습니다. | 지원하지 않는 연도 포함 |
| INFO_REC_HOLIDAY_EXCLUDED | 공휴일 회차는 예약 생성에서 제외됩니다. | 공휴일 회차 존재 |

---

## 6. 인수조건 매핑 후보

| 요구사항 ID | Feature 후보 | 검증 관점 |
|---|---|---|
| REQ-REC-200-preview-holidays | `reservation-weekly-recurring-holiday.feature` | 공휴일 회차 미리보기 |
| REQ-REC-201-create-exclude-holidays | `reservation-weekly-recurring-holiday.feature` | 공휴일 회차 생성 제외 |
| REQ-REC-400-holiday-data-unavailable | `reservation-weekly-recurring-holiday.feature` | 공휴일 데이터 없음 |
| REQ-UI-REC-HOL-001-show-excluded-holidays | `vue-weekly-recurring-holiday.feature` | 공휴일 제외 날짜 표시 |
| REQ-UI-REC-HOL-002-count-summary | `vue-weekly-recurring-holiday.feature` | 건수 요약 표시 |

---

## 7. 기존 SRS와의 관계

`docs/SRS-v0.4-weekly-recurring-baseline.md`의 공휴일 자동 제외 제외 범위는 이 addendum 이후 폐기한다.

이 addendum이 반복 예약 공휴일 처리 요구사항으로 우선한다.
