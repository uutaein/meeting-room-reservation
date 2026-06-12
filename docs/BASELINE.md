# Baseline — Reservation Flexibility Policy

| Item | Value |
|---|---|
| Baseline name | reservation-flexibility-v0.5 |
| Date | 2026-06-12 |
| Branch | master |
| Purpose | Stable rollback point after PRD, ADR, SRS baseline, and feature alignment |

---

## Included changes

This baseline includes the following policy decisions and acceptance criteria updates.

1. PRD v0.5 records the reservation flexibility policy.
2. ADR-0001 records the decision rationale.
3. SRS v0.3 baseline records requirement IDs and acceptance criteria alignment.
4. Capacity feature uses advisory success scenarios.
5. Validation feature treats minute-level time input as a success scenario.
6. Update feature treats advisory capacity cases as successful update scenarios.

---

## Rollback target

Use this commit as the rollback target if later changes break the project.

Suggested local tag name:

```bash
git tag baseline/reservation-flexibility-v0.5
```

Suggested rollback check command:

```bash
git checkout baseline/reservation-flexibility-v0.5
```

For actual rollback on master, create a new fix branch from this baseline and merge it intentionally.
