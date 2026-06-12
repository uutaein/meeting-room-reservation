# SRS v0.3 Baseline

## 1. Purpose

This document records the v0.3 requirement baseline for the meeting room reservation project.

Related documents:

- `docs/PRD.md` v0.5
- `docs/adr/ADR-0001-reservation-flexibility-policy.md`

---

## 2. Policy Baseline

| Area | Baseline |
|---|---|
| Time input | One minute granularity |
| Room size | Advisory capacity notice |
| Room 1 notice point | 7 or more attendees |
| Room 2 notice point | 13 or more attendees |
| Schedule conflict | Existing guard remains active |
| Max duration | 2 hours |
| Business hours | 08:00-20:00 |

---

## 3. Requirement IDs

| Requirement ID | Meaning |
|---|---|
| REQ-RSV-201-time-unit-minute | Reservation can use minute-level time input |
| REQ-RSV-WARN-capacity-room1 | Room 1 shows advisory capacity notice |
| REQ-RSV-WARN-capacity-room2 | Room 2 shows advisory capacity notice |
| REQ-RSV-WARN-update-capacity-room1 | Reservation update shows advisory capacity notice |

---

## 4. Acceptance Criteria Alignment

Feature files should follow this baseline.

1. Minute-level time examples are success scenarios.
2. Advisory capacity cases are success scenarios with user notice.
3. Schedule conflict cases remain error scenarios.
4. Time order, duration, and business hour rules remain error scenarios.
5. Step definition code is out of scope for this documentation update.

---

## 5. Traceability

| Source | Target |
|---|---|
| PRD v0.5 | Product policy |
| ADR-0001 | Decision rationale |
| This SRS baseline | Requirement baseline |
| `features/*.feature` | Acceptance criteria |
