# SRS v0.4 Baseline — 주간 반복 예약

| 항목 | 내용 |
|---|---|
| 문서번호 | MROOM-SRS-0.4 |
| 문서명 | 주간 반복 예약 SRS 기준선 |
| 상태 | Proposed baseline |
| 작성일 | 2026-06-12 |
| 기준 PRD | `docs/PRD-v0.6-weekly-recurring-addendum.md` |
| 관련 ADR | `docs/adr/ADR-0002-weekly-recurring-reservation.md` |
| 기준 baseline | `docs/BASELINE.md` |

---

## 1. 목적

이 문서는 회의실 예약 시스템에 추가되는 **주간 반복 예약** 요구사항을 테스트 가능한 수준으로 정의한다.

주간 반복 예약은 사용자가 같은 회의실, 같은 요일, 같은 시간의 회의를 반복 등록할 수 있게 하는 기능이다.

---

## 2. 범위

### 2.1 포함 범위

1. 주간 반복 예약 생성
2. 반복 요일 1개 선택
3. 동일 회의실 반복
4. 동일 시작 시간과 종료 시간 반복
5. 반복 종료일 또는 반복 횟수 입력
6. 반복 예약 생성 전 예상 생성 건수 표시
7. 반복 예약 생성 전 충돌 날짜 표시
8. 반복 예약 수정 시 제목 확인
9. 반복 예약 취소 시 제목 확인
10. 기존 단건 예약 정책 적용

### 2.2 제외 범위

1. 매일 반복
2. 격주 반복
3. 매월 반복
4. 여러 요일 반복
5. 공휴일 자동 제외
6. 반복 예외일 관리
7. 참석자 일정 연동
8. 반복 예약 알림
9. 반복 예약 통계 리포트
10. 권한 기반 반복 예약 관리

---

## 3. 용어 정의

| 용어 | 정의 |
|---|---|
| 주간 반복 예약 | 매주 같은 요일, 같은 시간, 같은 회의실에 생성되는 예약 |
| 반복 예약 그룹 | 같은 반복 규칙으로 생성된 예약 묶음 |
| 반복 예약 제목 | 반복 예약 수정 또는 취소 확인에 사용하는 제목 |
| 반복 회차 | 반복 예약 그룹에 속한 개별 날짜의 예약 |
| 반복 시작일 | 반복 예약이 시작되는 날짜 |
| 반복 종료일 | 반복 예약이 끝나는 날짜 |
| 반복 횟수 | 생성할 반복 회차 수 |
| 충돌 날짜 | 반복 생성 대상 중 기존 ACTIVE 예약과 시간이 겹치는 날짜 |

---

## 4. 비즈니스 규칙

| 규칙 ID | 항목 | 확정값 |
|---|---|---|
| BR-REC-001 | 반복 주기 | 매주 |
| BR-REC-002 | 반복 요일 | 1개 요일 |
| BR-REC-003 | 반복 회의실 | 동일 회의실 |
| BR-REC-004 | 반복 시간 | 동일 시작 시간, 동일 종료 시간 |
| BR-REC-005 | 반복 종료 조건 | 종료일 또는 반복 횟수 중 하나 |
| BR-REC-006 | 반복 제목 | 필수 |
| BR-REC-007 | 수정 확인 | 반복 예약 제목 정확히 입력 필요 |
| BR-REC-008 | 취소 확인 | 반복 예약 제목 정확히 입력 필요 |
| BR-REC-009 | 단건 정책 적용 | 1분 단위, 최대 2시간, 운영시간, 시간 겹침 정책 적용 |

---

## 5. 기능 요구사항

### 5.1 주간 반복 예약 생성

- **REQ-REC-201-create-weekly** — 사용자가 주간 반복 예약을 선택하고 유효한 반복 조건을 입력하면 반복 기간에 해당하는 예약 회차를 생성한다.

- **REQ-REC-201-default-weekday** — 반복 요일은 예약 시작일의 요일을 기본값으로 사용한다.

- **REQ-REC-200-preview-count** — 반복 예약 생성 전 시스템은 생성 예정 회차 수를 표시한다.

- **REQ-REC-200-preview-conflicts** — 반복 예약 생성 전 시스템은 기존 ACTIVE 예약과 시간이 겹치는 날짜를 표시한다.

- **REQ-REC-201-create-available-only** — 사용자가 충돌 날짜를 확인하고 진행하면, 충돌하지 않는 날짜의 예약만 생성한다.

### 5.2 반복 예약 입력값 검증

- **REQ-REC-400-title-required** — 반복 예약 제목이 없으면 반복 예약을 생성하지 않는다.

- **REQ-REC-400-end-condition-required** — 반복 종료일과 반복 횟수가 모두 없으면 반복 예약을 생성하지 않는다.

- **REQ-REC-400-end-date-before-start** — 반복 종료일이 반복 시작일보다 빠르면 반복 예약을 생성하지 않는다.

- **REQ-REC-400-repeat-count-range** — 반복 횟수가 1보다 작으면 반복 예약을 생성하지 않는다.

- **REQ-REC-400-weekday-mismatch** — 반복 시작일과 반복 요일이 불일치하는 경우에는 사용자 확인 또는 자동 보정 정책이 필요하다. MVP에서는 예약 시작일의 요일을 반복 요일로 사용한다.

### 5.3 단건 예약 정책 적용

- **REQ-REC-400-business-hours** — 반복 예약 각 회차는 운영시간 `08:00~20:00`을 벗어날 수 없다.

- **REQ-REC-400-duration-max** — 반복 예약 각 회차는 2시간을 초과할 수 없다.

- **REQ-REC-400-time-order** — 반복 예약의 종료 시간은 시작 시간보다 늦어야 한다.

- **REQ-REC-WARN-capacity** — 반복 예약 각 회차의 참석 인원이 권고 정원을 초과하면 정원 경고 대상이다. 사용자가 확인하면 예약은 계속 진행할 수 있다.

- **REQ-REC-409-overlap** — 반복 예약 각 회차는 같은 회의실의 기존 ACTIVE 예약과 시간이 겹칠 수 없다.

### 5.4 반복 예약 수정

- **REQ-REC-200-update-future** — 사용자는 선택한 회차 이후의 반복 예약을 일괄 수정할 수 있다.

- **REQ-REC-400-update-title-confirm-required** — 반복 예약 일괄 수정 전 사용자는 반복 예약 제목을 정확히 입력해야 한다.

- **REQ-REC-400-update-title-confirm-mismatch** — 입력한 제목이 반복 예약 제목과 다르면 수정은 진행되지 않는다.

- **REQ-REC-200-update-one-occurrence** — 선택한 1개 회차만 수정하는 기능은 후보 기능이며, MVP 포함 여부는 구현 단계에서 확정한다.

### 5.5 반복 예약 취소

- **REQ-REC-200-cancel-future** — 사용자는 선택한 회차 이후의 반복 예약을 일괄 취소할 수 있다.

- **REQ-REC-400-cancel-title-confirm-required** — 반복 예약 일괄 취소 전 사용자는 반복 예약 제목을 정확히 입력해야 한다.

- **REQ-REC-400-cancel-title-confirm-mismatch** — 입력한 제목이 반복 예약 제목과 다르면 취소는 진행되지 않는다.

- **REQ-REC-200-cancel-one-occurrence** — 선택한 1개 회차만 취소하는 기능은 후보 기능이며, MVP 포함 여부는 구현 단계에서 확정한다.

---

## 6. 화면 요구사항

### 6.1 예약 생성 화면

- **REQ-UI-REC-001-checkbox** — 예약 생성 화면에는 `주간 반복 예약` 체크박스를 표시한다.

- **REQ-UI-REC-002-repeat-fields** — 체크박스를 선택하면 반복 요일, 반복 종료일 또는 반복 횟수 입력 영역을 표시한다.

- **REQ-UI-REC-003-preview** — 반복 예약 생성 전 예상 생성 건수와 충돌 날짜를 표시한다.

- **REQ-UI-REC-004-capacity-warning** — 반복 예약의 참석 인원이 권고 정원을 초과하면 경고를 표시한다.

### 6.2 예약 목록 화면

- **REQ-UI-REC-101-badge** — 반복 예약으로 생성된 회차에는 반복 예약 배지를 표시한다.

- **REQ-UI-REC-102-title** — 반복 예약 회차에는 반복 예약 제목을 표시한다.

### 6.3 수정/취소 확인 화면

- **REQ-UI-REC-201-confirm-title** — 반복 예약 일괄 수정 또는 일괄 취소 시 제목 입력 확인창을 표시한다.

- **REQ-UI-REC-202-affected-count** — 제목 확인창에는 영향받는 예약 건수와 날짜 범위를 표시한다.

---

## 7. 데이터 요구사항

주간 반복 예약을 위해 다음 개념이 필요하다.

| 데이터 개념 | 설명 |
|---|---|
| recurring_group_id | 반복 예약 그룹 식별자 |
| recurring_title | 반복 예약 제목 |
| repeat_type | 반복 유형. MVP에서는 WEEKLY |
| repeat_weekday | 반복 요일 |
| repeat_start_date | 반복 시작일 |
| repeat_end_date | 반복 종료일 |
| repeat_count | 반복 횟수 |
| occurrence_date | 개별 회차 예약일 |

MVP 추천 방향은 다음과 같다.

> 반복 예약 생성 시 날짜별 개별 예약을 미리 생성하고, 각 예약에 반복 그룹 식별자를 연결한다.

---

## 8. 오류 및 안내 메시지 후보

| 코드 후보 | 메시지 후보 | 발생 조건 |
|---|---|---|
| ERR_REC_TITLE_REQUIRED | 반복 예약 제목을 입력하세요. | 제목 누락 |
| ERR_REC_END_CONDITION_REQUIRED | 반복 종료일 또는 반복 횟수를 입력하세요. | 종료 조건 누락 |
| ERR_REC_END_DATE_BEFORE_START | 반복 종료일은 시작일보다 빠를 수 없습니다. | 종료일 오류 |
| ERR_REC_COUNT_RANGE | 반복 횟수는 1회 이상이어야 합니다. | 반복 횟수 오류 |
| ERR_REC_TITLE_CONFIRM_MISMATCH | 입력한 제목이 반복 예약 제목과 일치하지 않습니다. | 수정/취소 확인 실패 |
| WARN_REC_CONFLICT_DATES | 일부 날짜에 기존 예약과 시간이 겹칩니다. | 충돌 날짜 존재 |

---

## 9. 인수조건 매핑 후보

| 요구사항 ID | Feature 후보 | 검증 관점 |
|---|---|---|
| REQ-REC-201-create-weekly | `reservation-weekly-recurring.feature` | 주간 반복 예약 생성 |
| REQ-REC-200-preview-count | `reservation-weekly-recurring.feature` | 생성 예정 건수 표시 |
| REQ-REC-200-preview-conflicts | `reservation-weekly-recurring.feature` | 충돌 날짜 표시 |
| REQ-REC-400-title-required | `reservation-weekly-recurring.feature` | 반복 제목 필수 |
| REQ-REC-400-update-title-confirm-mismatch | `reservation-weekly-recurring.feature` | 수정 제목 확인 실패 |
| REQ-REC-400-cancel-title-confirm-mismatch | `reservation-weekly-recurring.feature` | 취소 제목 확인 실패 |
| REQ-UI-REC-001-checkbox | `vue-weekly-recurring-reservation.feature` | 체크박스 표시 |
| REQ-UI-REC-201-confirm-title | `vue-weekly-recurring-reservation.feature` | 제목 확인창 표시 |

---

## 10. 미확정 사항

| 항목 | 후보 | SRS 기준 상태 |
|---|---|---|
| 충돌 날짜 처리 | 전체 실패 / 가능한 날짜만 생성 / 확인 후 일부 생성 | 확인 후 일부 생성 추천 |
| 1회차만 수정 | 포함 / 제외 | 후보 |
| 1회차만 취소 | 포함 / 제외 | 후보 |
| 과거 회차 수정 | 허용 / 금지 | 금지 추천 |
| 반복 종료 조건 | 종료일 / 횟수 / 둘 다 | 둘 중 하나 입력 추천 |
| 반복 규칙 저장 방식 | 규칙 테이블 / 예약 테이블 확장 | SDD 단계 확정 |

---

## 11. 추적성

| 산출물 | 역할 |
|---|---|
| `docs/PRD-v0.6-weekly-recurring-addendum.md` | 제품 요건 |
| `docs/adr/ADR-0002-weekly-recurring-reservation.md` | 의사결정 기록 |
| `docs/SRS-v0.4-weekly-recurring-baseline.md` | 요구사항 기준선 |
| `features/reservation-weekly-recurring.feature` | 백엔드 인수조건 후보 |
| `features/vue-weekly-recurring-reservation.feature` | 화면 인수조건 후보 |

---

## 12. 구현 범위 주의

이번 SRS는 요구사항 기준선이다.

다음 파일은 이 단계에서 수정하지 않는다.

1. `backend/`
2. `frontend/`
3. `features/step_definitions/`

코드 구현은 별도 작업으로 분리한다.
