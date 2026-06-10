# SRS — 17층 서고·회의실 예약 관리 시스템
## SMART-ish 하게 고쳐 쓴 요구사항 명세

> 이 문서는 PRD v0.4의 회의실 예약 제품 방향과 현재 구현을 **Specific · Measurable · Testable** 한 요구사항으로 정리한 SRS입니다.
> 각 요구사항은 입력값, 경계값, 기대 결과, 실패 조건을 명시하며, 이후 Gherkin Feature 또는 SQLite/JS 구현 검증 항목으로 연결될 수 있습니다.
>
> 현재 제품은 **단일 PC · 단일 사용자 · Node.js 로컬 서버 · Vue 웹 화면 · SQLite 저장소**를 전제로 합니다.
> 폐쇄망 포터블 패키지는 후속 배포 단계에서 확정합니다.
> 별도 로그인, 관리자 기능, 다중 사용자 동시 접속, 중앙 서버 운영은 1차 범위에서 제외합니다.

---

| 항목 | 내용 |
|---|---|
| 문서번호 | MROOM-SRS-0.2 |
| 문서명 | 17층 서고·회의실 예약 관리 시스템 SRS |
| 버전 | v0.2 current |
| 기준 PRD | PRD v0.4 |
| 소유자 | 회의실 예약 시스템 프로젝트 |
| 형상관리 | git 저장소 내 `SRS.md`, 향후 `features/`, `db/`, `src/` 연계 |
| 검증 방식 | Gherkin 시나리오, SQLite 제약/트리거, 프론트엔드 빌드 및 브라우저 확인 |
| 실행 환경 | Windows 폐쇄망 PC |
| 앱 형태 | Node.js 로컬 서버 + Vue 웹 화면 |
| 패키징 | npm 기반 패키지 |
| 저장소 | SQLite |
| 화면 기준 | 웹 대시보드, 세로 피봇 최적화는 후속 검증 |
| 사용 방식 | 단일 PC, 단일 사용자, 예약자명 직접 입력 |

---

## 1. 문서 목적

본 문서는 17층 회의실 1, 회의실 2의 예약 관리를 위한 시스템 요구사항을 정의한다.

PRD가 제품의 목적과 범위를 정의했다면, 본 SRS는 다음을 명확히 한다.

1. 어떤 입력값이 필요한가
2. 어떤 조건에서 예약이 성공하는가
3. 어떤 조건에서 예약이 실패하는가
4. 예약 데이터는 어떻게 저장되어야 하는가
5. 중복 예약은 어떻게 차단해야 하는가
6. 화면과 실행 환경은 어떤 조건을 만족해야 하는가
7. 테스트 가능한 요구사항 ID는 무엇인가

> 이 SRS의 목적은 “좋은 예약 시스템”을 말하는 것이 아니라, **예약 생성·조회·변경·취소가 언제 성공하고 언제 실패하는지 판정 가능하게 만드는 것**이다.

### 1.1 구현 현행화 기준

2026-06-10 현재 코드와 Gherkin feature를 실행 명세의 기준으로 삼는다.

현재 구현된 API 범위는 다음과 같다.

1. `GET /reservations?date=YYYY-MM-DD`: 해당 날짜의 `ACTIVE` 예약 목록 조회
2. `POST /reservations`: 예약 생성
3. `PUT /reservations/{id}`: 예약 변경
4. `PATCH /reservations/{id}/cancel`: 예약 취소

예약 상세 조회, 회의실 목록 전용 API, `note` 필드, 취소 예약 포함 목록, 포터블 배포 패키지는 현재 구현 범위에 포함하지 않는다.

---

## 2. 범위

### 2.1 포함 범위

1. 날짜별 `ACTIVE` 예약 현황 조회
2. 회의실 예약 생성
3. 예약 변경
4. 예약 취소
5. 회의실 정원 초과 검증
6. 예약 시간 30분 단위 검증
7. 1회 예약 최대 2시간 제한
8. 예약 가능 시간 `08:00~20:00` 제한
9. 같은 회의실 내 시간 중복 예약 차단
10. SQLite 기반 예약 데이터 저장
11. 취소 예약의 `CANCELLED` 상태 처리
12. 취소된 시간대 재예약 허용
13. SQLite 트리거를 통한 중복 예약 최종 방어
14. Vue 기반 날짜별 예약 대시보드

### 2.2 제외 범위

1. 로그인
2. 사용자 계정 관리
3. 관리자 전용 기능
4. 권한 분리
5. 다중 사용자 동시 접속
6. 중앙 서버 기반 운영
7. 그룹웨어 연동
8. Outlook, Google Calendar, Teams 캘린더 연동
9. 모바일 앱
10. 반복 예약
11. 알림 기능
12. QR 체크인
13. 회의실 자동 추천
14. 승인 워크플로
15. 외부 인터넷 기반 자동 업데이트
16. 예약 상세 조회 전용 API와 화면
17. 회의실 목록 전용 API
18. 예약 비고(`note`) 필드
19. 취소 예약을 포함하는 상태별 목록
20. 30분 슬롯 24개를 표시하는 타임라인형 대시보드
21. 폐쇄망 포터블 실행 패키지

---

## 3. 용어 정의

| 용어 | 정의 |
|---|---|
| 회의실 1 | 17층의 소규모 회의실. 정원 6명 |
| 회의실 2 | 17층의 중형 회의실. 정원 12명 |
| 예약 | 특정 회의실을 특정 날짜·시간 동안 사용하는 신청 정보 |
| 예약자명 | 예약 등록 시 사용자가 직접 입력하는 본인 이름 |
| 회의 목적 | 회의 내용을 30자 이내로 입력한 설명 |
| ACTIVE | 유효한 예약 상태 |
| CANCELLED | 취소된 예약 상태 |
| 중복 예약 | 같은 회의실에서 기존 `ACTIVE` 예약과 시간이 겹치는 예약 |
| 경계 중복 | 기존 예약 종료 시간과 신규 예약 시작 시간이 같은 경우. 본 시스템에서는 허용 |
| 포터블 앱 | 복잡한 설치 없이 패키지 반입 후 실행하는 형태의 앱 |
| 단일 PC | SQLite DB와 앱이 하나의 PC에서 실행되는 구조 |

---

## 4. 비즈니스 규칙 확정값

| 규칙 ID | 항목 | 확정값 |
|---|---|---|
| BR-ROOM-001 | 회의실 1 정원 | 6명 |
| BR-ROOM-002 | 회의실 2 정원 | 12명 |
| BR-TIME-001 | 예약 가능 시간 | 08:00~20:00 |
| BR-TIME-002 | 예약 시간 단위 | 30분 |
| BR-TIME-003 | 최소 예약 시간 | 30분 |
| BR-TIME-004 | 최대 예약 시간 | 2시간 |
| BR-TIME-005 | 종료 시간 조건 | 종료 시간은 시작 시간보다 늦어야 함 |
| BR-TIME-006 | 경계 중복 | 기존 종료 시간 = 신규 시작 시간인 경우 허용 |
| BR-USER-001 | 예약자명 필수 여부 | 필수 |
| BR-USER-002 | 예약자명 길이 | 2자 이상 6자 이하 |
| BR-MEETING-001 | 회의 목적 필수 여부 | 필수 |
| BR-MEETING-002 | 회의 목적 길이 | 30자 이내 |
| BR-CANCEL-001 | 취소 방식 | 삭제하지 않고 `CANCELLED` 상태 처리 |
| BR-CANCEL-002 | 취소 후 재예약 | 가능 |
| BR-CONCURRENCY-001 | 중복 최종 방어 | SQLite INSERT·UPDATE 트리거로 `ACTIVE` 예약 중복 차단 |

---

## 5. 기능 요구사항

> 형식: **REQ-ID** — 동작. 입력 → 결과. 근거 BR. 실행 명세 태그.

### 5.1 예약 현황 조회

- **REQ-RSV-301-list-by-date** — 사용자가 날짜를 선택하면 해당 날짜의 `ACTIVE` 예약 목록을 시작 시간 오름차순으로 조회한다.
  → `@REQ-RSV-301-list-by-date`

- **REQ-RSV-301-list-empty** — 선택한 날짜에 `ACTIVE` 예약이 없으면 빈 목록을 반환하고 오류로 처리하지 않는다.
  → `@REQ-RSV-301-list-empty`

- **REQ-RSV-400-list-date-required** — 조회 날짜가 없으면 `ERR_REQUIRED_FIELD`를 반환한다.
  → `@REQ-RSV-400-list-date-required`

- **REQ-RSV-400-list-date-format** — 조회 날짜가 `YYYY-MM-DD` 형식이 아니면 `ERR_DATE_FORMAT`을 반환한다.
  → `@REQ-RSV-400-list-date-format`

---

### 5.2 예약 생성

- **REQ-RSV-201** — 유효한 예약 정보로 예약 생성 시 HTTP 201로 생성된 예약 객체를 반환한다.
  입력값은 `roomId`, `reservationDate`, `startTime`, `endTime`, `ownerName`, `attendees`, `purpose`를 포함해야 한다.  
  → `@REQ-RSV-201`

- **REQ-RSV-400-required** — 필수 입력값이 비어 있으면 예약을 생성하지 않고 `ERR_REQUIRED_FIELD`를 반환한다.  
  필수값은 `roomId`, `reservationDate`, `startTime`, `endTime`, `ownerName`, `attendees`, `purpose`이다.  
  → `@REQ-RSV-400-required`

- **REQ-RSV-400-invalid-room** — 존재하지 않거나 비활성인 `roomId`로 예약 생성 시 `ERR_INVALID_ROOM`을 반환한다.

- **REQ-RSV-400-owner-length** — 예약자명이 2자 미만 또는 6자 초과이면 예약을 생성하지 않고 `ERR_OWNER_NAME_LENGTH`를 반환한다.  
  〔BR-USER-001, BR-USER-002〕 → `@REQ-RSV-400-owner-name`

- **REQ-RSV-400-purpose-length** — 회의 목적이 비어 있거나 30자를 초과하면 예약을 생성하지 않고 `ERR_PURPOSE_LENGTH`를 반환한다.  
  〔BR-MEETING-001, BR-MEETING-002〕 → `@REQ-RSV-400-purpose-length`

- **REQ-RSV-400-attendees** — 참석 인원이 숫자가 아니거나 1명 미만이면 예약을 생성하지 않고 `ERR_ATTENDEES_INVALID`를 반환한다.  
  → `@REQ-RSV-400-attendees`

- **REQ-RSV-400-capacity-room1** — 회의실 1 예약 시 참석 인원이 7명 이상이면 예약을 생성하지 않고 `ERR_CAPACITY_EXCEEDED`를 반환한다.  
  〔BR-ROOM-001〕 → `@REQ-RSV-400-capacity-room1`

- **REQ-RSV-400-capacity-room2** — 회의실 2 예약 시 참석 인원이 13명 이상이면 예약을 생성하지 않고 `ERR_CAPACITY_EXCEEDED`를 반환한다.  
  〔BR-ROOM-002〕 → `@REQ-RSV-400-capacity-room2`

- **REQ-RSV-400-time-unit** — 시작 시간 또는 종료 시간이 30분 단위가 아니면 예약을 생성하지 않고 `ERR_TIME_UNIT`을 반환한다.  
  〔BR-TIME-002〕 → `@REQ-RSV-400-time-unit`

- **REQ-RSV-400-time-order** — 종료 시간이 시작 시간보다 빠르거나 같으면 예약을 생성하지 않고 `ERR_TIME_ORDER`를 반환한다.  
  〔BR-TIME-005〕 → `@REQ-RSV-400-time-order`

- **REQ-RSV-400-duration-min** — 예약 시간이 30분 미만이면 예약을 생성하지 않고 `ERR_DURATION_MIN`을 반환한다.  
  〔BR-TIME-003〕 → `@REQ-RSV-400-duration-min`

- **REQ-RSV-400-duration-max** — 예약 시간이 2시간을 초과하면 예약을 생성하지 않고 `ERR_DURATION_MAX`를 반환한다.  
  〔BR-TIME-004〕 → `@REQ-RSV-400-duration-max`

- **REQ-RSV-400-business-hours-before** — 예약 시작 시간이 08:00보다 빠르면 예약을 생성하지 않고 `ERR_BUSINESS_HOURS`를 반환한다.  
  〔BR-TIME-001〕 → `@REQ-RSV-400-business-hours-before`

- **REQ-RSV-400-business-hours-after** — 예약 종료 시간이 20:00보다 늦으면 예약을 생성하지 않고 `ERR_BUSINESS_HOURS`를 반환한다.  
  〔BR-TIME-001〕 → `@REQ-RSV-400-business-hours-after`

- **REQ-RSV-409-overlap** — 같은 회의실의 기존 `ACTIVE` 예약과 시간이 겹치면 예약을 생성하지 않고 `ERR_RESERVATION_OVERLAP`을 반환한다.  
  중복 판단식은 `newStart < existingEnd AND newEnd > existingStart`이다.  
  〔BR-TIME-006, BR-CONCURRENCY-002〕 → `@REQ-RSV-409-overlap`

- **REQ-RSV-201-boundary-allowed** — 기존 예약의 종료 시간과 신규 예약의 시작 시간이 같은 경우에는 중복으로 보지 않고 예약을 생성한다.  
  예: 기존 `10:00~11:00`, 신규 `11:00~12:00`은 허용한다.  
  〔BR-TIME-006〕 → `@REQ-RSV-201-overlap-boundary-end-start`

---

### 5.3 예약 변경

- **REQ-RSV-200-update** — 유효한 변경 요청이면 예약 정보를 수정하고 HTTP 200 응답의 `reservation` 필드로 수정된 예약 객체를 반환한다.
  변경 가능 항목은 `roomId`, `reservationDate`, `startTime`, `endTime`, `ownerName`, `attendees`, `purpose`이다.
  → `@REQ-RSV-UPDATE`

- **REQ-RSV-404-update** — 존재하지 않는 예약 ID를 변경하려 하면 `ERR_RESERVATION_NOT_FOUND`를 반환한다.  
  → `@REQ-RSV-404-update`

- **REQ-RSV-409-update-cancelled** — `CANCELLED` 상태의 예약을 변경하려 하면 HTTP 409와 `ERR_CANCELLED_RESERVATION_NOT_EDITABLE`을 반환한다.
  〔BR-CANCEL-001〕 → `@REQ-RSV-UPDATE`

- **REQ-RSV-400-update-validation** — 예약 변경 후 값이 필수값, 정원, 시간 단위, 예약 가능 시간, 최대 예약 시간 규칙을 위반하면 변경하지 않고 해당 오류 코드를 반환한다.  
  → `@REQ-RSV-400-update-validation`

- **REQ-RSV-409-update-overlap** — 예약 변경 결과가 같은 회의실의 다른 `ACTIVE` 예약과 겹치면 변경하지 않고 `ERR_RESERVATION_OVERLAP`을 반환한다.  
  자기 자신의 기존 예약은 중복 판단에서 제외한다.  
  〔BR-CONCURRENCY-002〕 → `@REQ-RSV-409-update-overlap`

---

### 5.4 예약 취소

- **REQ-RSV-204-cancel** — 존재하는 `ACTIVE` 예약을 취소하면 예약 상태를 `CANCELLED`로 변경하고 HTTP 200으로 변경된 예약 객체를 반환한다.
  예약 데이터는 삭제하지 않는다.  
  〔BR-CANCEL-001〕 → `@REQ-RSV-204-cancel`

- **REQ-RSV-404-cancel** — 존재하지 않는 예약 ID를 취소하려 하면 `ERR_RESERVATION_NOT_FOUND`를 반환한다.  
  → `@REQ-RSV-404-cancel`

- **REQ-RSV-409-cancel-already-cancelled** — 이미 `CANCELLED` 상태인 예약을 다시 취소하면 HTTP 409와 `ERR_ALREADY_CANCELLED`를 반환한다.
  → `@REQ-RSV-409-cancel-already-cancelled`

- **REQ-RSV-201-rebook-cancelled-slot** — `CANCELLED` 상태의 예약 시간대에는 같은 회의실로 신규 예약을 생성할 수 있다.  
  〔BR-CANCEL-002〕 → `@REQ-RSV-201-after-cancel-rebook`

---

### 5.5 SQLite 중복 방어

- **REQ-RSV-DB-trigger-overlap-insert** — SQLite는 `ACTIVE` 예약 INSERT 시 기존 `ACTIVE` 예약과 시간이 겹치면 저장을 거부해야 한다.  
  〔BR-CONCURRENCY-001〕

- **REQ-RSV-DB-trigger-overlap-update** — SQLite는 `ACTIVE` 예약 UPDATE 시 다른 `ACTIVE` 예약과 시간이 겹치면 저장을 거부해야 한다.  
  〔BR-CONCURRENCY-001〕

---

## 6. 비기능 요구사항

> 모든 비기능 요구사항은 숫자, 단위, 판정 기준을 포함한다.

| NFR-ID | 항목 | 요구사항 |
|---|---|---|
| NFR-RUNTIME-001 | 실행 환경 | Windows 환경에서 실행 가능해야 한다. |
| NFR-OFFLINE-001 | 폐쇄망 | 외부 인터넷 연결 없이 예약 조회·등록·변경·취소가 가능해야 한다. |
| NFR-PACKAGE-001 | npm 패키징 | 실행에 필요한 npm 의존성은 폐쇄망 반입 패키지에 포함되어야 한다. |
| NFR-PACKAGE-002 | 외부 의존성 | 실행 시 외부 CDN, 외부 API, 외부 npm registry 접근을 요구하지 않아야 한다. |
| NFR-DB-001 | 저장소 | 예약 데이터는 SQLite에 저장되어야 한다. |
| NFR-DB-002 | DB 파일 | 기본 DB 파일명은 `reservation.db`로 한다. |
| NFR-SCREEN-001 | 화면 기준 | 웹 화면에서 날짜별 예약 목록과 등록·수정·취소 동작을 제공해야 한다. |
| NFR-PERF-001 | 조회 성능 | 일간 예약 현황 조회는 예약 500건 이하 기준 p95 1초 이내여야 한다. |
| NFR-PERF-002 | 저장 성능 | 예약 생성·변경·취소는 예약 500건 이하 기준 p95 1초 이내여야 한다. |
| NFR-PORTABLE-001 | 포터블 실행 | 폐쇄망 포터블 패키지 구성은 후속 배포 요구사항으로 관리한다. |
| NFR-NOADMIN-001 | 관리자 권한 | 가능하면 Windows 관리자 권한 없이 실행 가능해야 한다. |
| NFR-BACKUP-001 | 백업 | SQLite DB 파일은 사용자가 파일 단위로 수동 백업할 수 있어야 한다. |
| NFR-LOG-001 | 오류 기록 | DB 저장 실패, 중복 예약 차단, 실행 오류는 로컬 로그 또는 화면 메시지로 확인 가능해야 한다. |

---

## 7. 데이터 요구사항

### 7.1 회의실 데이터

| 필드 | 타입 | 필수 | 예시 | 설명 |
|---|---|---|---|---|
| room_id | TEXT | Y | ROOM_1 | 회의실 식별자 |
| room_name | TEXT | Y | 회의실 1 | 회의실명 |
| capacity | INTEGER | Y | 6 | 정원 |
| enabled | TEXT | Y | Y | 사용 여부 |

초기 데이터는 다음과 같다.

| room_id | room_name | capacity | enabled |
|---|---|---:|---|
| ROOM_1 | 회의실 1 | 6 | Y |
| ROOM_2 | 회의실 2 | 12 | Y |

---

### 7.2 예약 데이터

| 필드 | 타입 | 필수 | 예시 | 설명 |
|---|---|---|---|---|
| reservation_id | INTEGER | Y | 1 | 예약 식별자 |
| room_id | TEXT | Y | ROOM_1 | 회의실 식별자 |
| reservation_date | TEXT | Y | 2026-06-09 | 예약일 |
| start_time | TEXT | Y | 09:00 | 시작 시간 |
| end_time | TEXT | Y | 10:00 | 종료 시간 |
| owner_name | TEXT | Y | 홍길동 | 예약자명, 2~6자 |
| attendees | INTEGER | Y | 4 | 참석 인원 |
| purpose | TEXT | Y | 주간 회의 | 회의 목적, 30자 이내 |
| status | TEXT | Y | ACTIVE | `ACTIVE` 또는 `CANCELLED` |
| created_at | TEXT | Y | 2026-06-09 09:10:00 | 생성 일시 |
| updated_at | TEXT | Y | 2026-06-09 09:20:00 | 수정 일시 |

---

## 8. SQLite 저장 요구사항

### 8.1 기본 설정

SQLite 연결 시 다음 설정을 적용해야 한다.

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
```

| 설정 | 목적 |
|---|---|
| foreign_keys = ON | 회의실 참조 무결성 보장 |
| journal_mode = WAL | 읽기/쓰기 병행성 개선 |
| busy_timeout = 5000 | DB 잠금 시 최대 5초 대기 |

---

### 8.2 중복 예약 차단 기준

중복 예약 판단식은 다음과 같다.

```text
new_start < existing_end AND new_end > existing_start
```

다음 조건을 모두 만족하면 중복 예약으로 판단한다.

1. 같은 회의실이다.
2. 기존 예약 상태가 `ACTIVE`이다.
3. 새 예약 시작 시간이 기존 예약 종료 시간보다 빠르다.
4. 새 예약 종료 시간이 기존 예약 시작 시간보다 늦다.

다음 경우는 중복으로 보지 않는다.

1. 기존 예약 상태가 `CANCELLED`이다.
2. 기존 예약 종료 시간과 신규 예약 시작 시간이 같다.
3. 신규 예약 종료 시간과 기존 예약 시작 시간이 같다.
4. 회의실이 서로 다르다.

---

### 8.3 INSERT 중복 차단 트리거 요구사항

SQLite는 예약 INSERT 시 중복 예약을 최종 차단해야 한다.

예상 트리거 형태는 다음과 같다.

```sql
CREATE TRIGGER trg_reservation_no_overlap_insert
BEFORE INSERT ON reservations
WHEN NEW.status = 'ACTIVE'
BEGIN
  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM reservations r
        WHERE r.room_id = NEW.room_id
          AND r.reservation_date = NEW.reservation_date
          AND r.status = 'ACTIVE'
          AND NEW.start_time < r.end_time
          AND NEW.end_time > r.start_time
      )
      THEN RAISE(ABORT, 'ERR_RESERVATION_OVERLAP')
    END;
END;
```

---

### 8.4 UPDATE 중복 차단 트리거 요구사항

SQLite는 예약 UPDATE 시 자기 자신을 제외한 다른 `ACTIVE` 예약과의 중복을 최종 차단해야 한다.

예상 트리거 형태는 다음과 같다.

```sql
CREATE TRIGGER trg_reservation_no_overlap_update
BEFORE UPDATE ON reservations
WHEN NEW.status = 'ACTIVE'
BEGIN
  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM reservations r
        WHERE r.room_id = NEW.room_id
          AND r.reservation_date = NEW.reservation_date
          AND r.status = 'ACTIVE'
          AND r.reservation_id <> NEW.reservation_id
          AND NEW.start_time < r.end_time
          AND NEW.end_time > r.start_time
      )
      THEN RAISE(ABORT, 'ERR_RESERVATION_OVERLAP')
    END;
END;
```

---

## 9. 오류 코드 및 메시지

| 코드 | 메시지 | 발생 조건 |
|---|---|---|
| ERR_REQUIRED_FIELD | 필수 입력값을 확인하세요. | 필수값 누락 |
| ERR_INVALID_ROOM | 존재하지 않거나 사용할 수 없는 회의실입니다. | 잘못된 roomId |
| ERR_DATE_FORMAT | 조회 날짜는 YYYY-MM-DD 형식이어야 합니다. | 목록 조회 날짜 형식 오류 |
| ERR_OWNER_NAME_LENGTH | 예약자명은 2~6자로 입력하세요. | 예약자명 길이 위반 |
| ERR_PURPOSE_LENGTH | 회의 목적은 1~30자로 입력하세요. | 회의 목적 누락 또는 길이 초과 |
| ERR_ATTENDEES_INVALID | 참석 인원은 1명 이상 숫자로 입력하세요. | 참석 인원 오류 |
| ERR_ATTENDEES_RANGE | 참석 인원은 1명 이상 12명 이하로 입력하세요. | 참석 인원 범위 오류 |
| ERR_CAPACITY_EXCEEDED | 참석 인원이 회의실 정원을 초과했습니다. | 정원 초과 |
| ERR_TIME_FORMAT | 시간은 HH:mm 형식이어야 합니다. | 시간 형식 오류 |
| ERR_TIME_UNIT | 예약 시간은 30분 단위로 입력하세요. | 30분 단위 위반 |
| ERR_TIME_ORDER | 종료 시간은 시작 시간보다 늦어야 합니다. | 시간 순서 오류 |
| ERR_DURATION_MIN | 최소 예약 시간은 30분입니다. | 30분 미만 |
| ERR_DURATION_MAX | 최대 예약 시간은 2시간입니다. | 2시간 초과 |
| ERR_BUSINESS_HOURS | 예약 가능 시간은 08:00~20:00입니다. | 예약 가능 시간 위반 |
| ERR_RESERVATION_OVERLAP | 이미 예약된 시간입니다. | 중복 예약 |
| ERR_RESERVATION_NOT_FOUND | 예약 정보를 찾을 수 없습니다. | 없는 예약 조회/변경/취소 |
| ERR_CANCELLED_RESERVATION_NOT_EDITABLE | 이미 취소된 예약은 수정할 수 없습니다. | 취소 예약 변경 시도 |
| ERR_ALREADY_CANCELLED | 이미 취소된 예약입니다. | 취소된 예약 재취소 |
| ERR_DB_WRITE_FAILED | 예약 저장 중 오류가 발생했습니다. | SQLite 저장 실패 |

---

## 10. 화면 요구사항

### 10.1 기본 대시보드

- **REQ-UI-001-dashboard-date** — 기본 화면은 오늘 날짜의 예약 현황을 표시해야 한다.  
  → `@REQ-UI-001-dashboard-date`

- **REQ-UI-301-dashboard-list** — 기준 날짜와 영업일 수를 선택하면 날짜별 `ACTIVE` 예약 목록을 표시해야 한다.
  → `@REQ-UI-301-dashboard-list`

- **REQ-UI-301-dashboard-empty** — 예약이 없는 날짜에는 빈 상태 메시지를 표시해야 한다.
  → `@REQ-UI-301-dashboard-empty`

### 10.2 예약 입력 화면

- **REQ-UI-302-create-form** — 예약 등록 모달은 회의실, 날짜, 시작 시간, 종료 시간, 예약자명, 참석 인원, 회의 목적을 입력받아야 한다.
  → `@REQ-UI-302-create-form`

- **REQ-UI-102-validation-message** — 입력값 검증 실패 시 사용자가 원인을 알 수 있는 오류 메시지를 표시해야 한다.  
  → `@REQ-UI-102-validation-message`

- **REQ-UI-103-capacity-display** — 회의실 선택 시 해당 회의실의 정원을 화면에 표시해야 한다.  
  → `@REQ-UI-103-capacity-display`

### 10.3 예약 변경 화면

- **REQ-UI-UPDATE-open** — 예약 목록의 수정 버튼을 누르면 선택한 예약 정보가 채워진 수정 모달을 표시해야 한다.
  → `features/vue-reservation-update.feature`

- **REQ-UI-UPDATE-success** — 수정 성공 시 모달을 닫고 예약 목록을 다시 조회해야 한다.

- **REQ-UI-UPDATE-failure** — 수정 실패 시 모달을 유지하고 백엔드 오류 메시지를 표시해야 한다.

### 10.4 예약 취소 화면

- **REQ-UI-CANCEL-confirm** — 취소 버튼을 누르면 확인 창을 표시하고 확인한 경우에만 취소 API를 호출해야 한다.
  → `features/vue-reservation-cancel.feature`

- **REQ-UI-CANCEL-result** — 취소 성공 시 목록을 다시 조회하고, 실패 시 오류 메시지를 표시해야 한다.

---

## 11. Gherkin 인수 조건 매핑

현재 `features/*.feature`에 작성된 태그와 요구사항의 대응은 다음과 같다.

| REQ-ID | Gherkin 태그 | 검증 관점 |
|---|---|---|
| REQ-RSV-201 | @REQ-RSV-201 | 정상 예약 생성 |
| REQ-RSV-400-required | @REQ-RSV-400-required | 필수값 누락 |
| REQ-RSV-400-owner-length | @REQ-RSV-400-owner-name | 예약자명 길이 |
| REQ-RSV-400-purpose-length | @REQ-RSV-400-purpose-length | 회의 목적 길이 |
| REQ-RSV-400-capacity-room1 | @REQ-RSV-400-capacity-room1 | 회의실 1 정원 초과 |
| REQ-RSV-400-capacity-room2 | 미작성 | 회의실 2 정원 초과 |
| REQ-RSV-400-time-unit | @REQ-RSV-400-time-unit | 30분 단위 위반 |
| REQ-RSV-400-duration-max | @REQ-RSV-400-duration-max | 2시간 초과 |
| REQ-RSV-400-business-hours-before | @REQ-RSV-400-business-hours | 08:00 이전 예약 |
| REQ-RSV-400-business-hours-after | @REQ-RSV-400-business-hours | 20:00 이후 예약 |
| REQ-RSV-409-overlap | @REQ-RSV-409-overlap | 중복 예약 차단 |
| REQ-RSV-201-boundary-allowed | @REQ-RSV-201-overlap-boundary-end-start | 경계 시간 허용 |
| REQ-RSV-200-update | @REQ-RSV-UPDATE | 예약 변경 |
| REQ-RSV-409-update-overlap | @REQ-RSV-UPDATE | 변경 중복 차단 |
| REQ-RSV-204-cancel | @REQ-RSV-204-cancel | 예약 취소 |
| REQ-RSV-201-rebook-cancelled-slot | @REQ-RSV-201-after-cancel-rebook | 취소 시간대 재예약 |

---

## 12. 추적성

본 SRS의 요구사항은 다음 산출물로 추적되어야 한다.

| SRS 항목 | 후속 산출물 |
|---|---|
| 기능 요구사항 | `features/*.feature` |
| API 명세 | `openapi/reservation.yaml` |
| 서비스 구현 | `backend/src/services/reservationService.js` |
| SQLite 요구사항 | `backend/src/db/schema.sql` |
| 화면 요구사항 | `features/vue-*.feature`, `frontend/src/components/*.vue` |
| API 오류 처리 | `backend/src/routes/reservationRoutes.js`, `backend/src/validators/reservationValidator.js` |
| 실행 검증 | 루트 `package.json`의 `test:bdd:*`, 프론트엔드 `build` |

> 최종 목표는 문서만 있는 SRS가 아니라, **SRS 요구사항 ID가 Gherkin, DB 스키마, JS 테스트 코드까지 연결되는 실행 가능한 명세 구조**를 만드는 것이다.

---

## 13. 미확정 사항

| 항목 | 현재 상태 | 후속 결정 위치 |
|---|---|---|
| 포터블 배포 방식 | npm 로컬 개발 실행만 구현 | 배포 SDD |
| Node.js 런타임 포함 여부 | 미확정 | SDD |
| 순수 브라우저 방식 가능 여부 | 미확정 | SDD |
| SQLite 연동 라이브러리 | `better-sqlite3` 사용 | 구현 확정 |
| DB 파일 저장 위치 | `backend/data/reservation.db` | 구현 확정 |
| 과거 예약 생성 허용 여부 | 미확정 | SRS v0.2 또는 SDD |
| 이미 시작된 예약 변경 가능 여부 | 미확정 | SRS v0.2 |
| 이미 시작된 예약 취소 가능 여부 | 미확정 | SRS v0.2 |
| 백업 주기 | 수동 백업 방향만 확정 | SDD |
| 로그 파일 위치 | 미확정 | SDD |
| npm 실행 명령 | 루트 `npm run dev`, 개별 `dev:backend`, `dev:frontend` | 구현 확정 |

---

## 14. SRS 확정 기준

본 SRS v0.2는 다음 조건을 만족하면 현행 기준선으로 사용할 수 있다.

1. 예약 가능 시간, 예약 단위, 최대 예약 시간이 확정되어 있다.
2. 회의실 정원과 참석 인원 검증 규칙이 확정되어 있다.
3. 예약자명과 회의 목적 입력 규칙이 확정되어 있다.
4. 취소 처리 방식이 `CANCELLED` 상태 처리로 확정되어 있다.
5. 취소된 예약 시간대의 재예약 가능 여부가 확정되어 있다.
6. 중복 예약 판단식이 확정되어 있다.
7. 중복 예약 최종 방어를 SQLite INSERT·UPDATE 트리거로 처리하기로 확정되어 있다.
8. 단일 PC, 단일 사용자, SQLite 저장, Node.js 로컬 실행 구조가 확정되어 있다.

---

## 부록 A. 중복 예약 예시

| 기존 예약 | 새 예약 | 결과 | 사유 |
|---|---|---|---|
| 10:00~11:00 | 11:00~12:00 | 가능 | 경계 시간 허용 |
| 10:00~11:00 | 09:00~10:00 | 가능 | 경계 시간 허용 |
| 10:00~11:00 | 10:30~11:30 | 불가 | 일부 시간 겹침 |
| 10:00~11:00 | 09:30~10:30 | 불가 | 일부 시간 겹침 |
| 10:00~11:00 | 10:00~11:00 | 불가 | 전체 시간 겹침 |
| 10:00~11:00 | 09:00~12:00 | 불가 | 기존 예약 포함 |
| 10:00~11:00 | 10:15~10:45 | 불가 | 30분 단위 위반 및 시간 겹침 |

---

## 부록 B. 예약 가능 시간 슬롯

예약 가능 시간은 08:00부터 20:00까지이며, 30분 단위로 구성한다.

| 순번 | 슬롯 시작 | 슬롯 종료 |
|---:|---|---|
| 1 | 08:00 | 08:30 |
| 2 | 08:30 | 09:00 |
| 3 | 09:00 | 09:30 |
| 4 | 09:30 | 10:00 |
| 5 | 10:00 | 10:30 |
| 6 | 10:30 | 11:00 |
| 7 | 11:00 | 11:30 |
| 8 | 11:30 | 12:00 |
| 9 | 12:00 | 12:30 |
| 10 | 12:30 | 13:00 |
| 11 | 13:00 | 13:30 |
| 12 | 13:30 | 14:00 |
| 13 | 14:00 | 14:30 |
| 14 | 14:30 | 15:00 |
| 15 | 15:00 | 15:30 |
| 16 | 15:30 | 16:00 |
| 17 | 16:00 | 16:30 |
| 18 | 16:30 | 17:00 |
| 19 | 17:00 | 17:30 |
| 20 | 17:30 | 18:00 |
| 21 | 18:00 | 18:30 |
| 22 | 18:30 | 19:00 |
| 23 | 19:00 | 19:30 |
| 24 | 19:30 | 20:00 |
