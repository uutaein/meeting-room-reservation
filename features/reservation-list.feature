Feature: 예약 목록 조회
  사용자는 특정 날짜의 회의실 예약 현황을 조회할 수 있다.

  @REQ-RSV-301-list-by-date
  Scenario: 특정 날짜의 예약 목록을 조회한다
    Given 다음 예약들이 등록되어 있다
      | roomId | reservationDate | startTime | endTime | ownerName | attendees | purpose |
      | ROOM_1 | 2026-06-10      | 10:00     | 11:00   | 김태인    | 4         | 회의준비 |
      | ROOM_2 | 2026-06-10      | 13:00     | 14:00   | 이영희    | 8         | 업무회의 |
    When 사용자가 "2026-06-10" 날짜의 예약 목록을 조회하면
    Then 응답 상태코드는 200이어야 한다
    And 예약 목록은 2건이어야 한다
    And 예약 목록은 시작 시간 오름차순이어야 한다

  @REQ-RSV-301-list-empty
  Scenario: 예약이 없는 날짜를 조회한다
    Given 등록된 예약이 없다
    When 사용자가 "2026-06-11" 날짜의 예약 목록을 조회하면
    Then 응답 상태코드는 200이어야 한다
    And 예약 목록은 0건이어야 한다

  @REQ-RSV-400-list-date-required
  Scenario: 날짜 없이 예약 목록을 조회한다
    When 사용자가 날짜 없이 예약 목록을 조회하면
    Then 응답 상태코드는 400이어야 한다
    And 오류 코드는 "ERR_REQUIRED_FIELD"이어야 한다

  @REQ-RSV-400-list-date-format
  Scenario: 잘못된 날짜 형식으로 예약 목록을 조회한다
    When 사용자가 "20260610" 날짜의 예약 목록을 조회하면
    Then 응답 상태코드는 400이어야 한다
    And 오류 코드는 "ERR_DATE_FORMAT"이어야 한다