Feature: 예약 취소
  사용자는 기존 예약을 취소할 수 있다.

  @REQ-RSV-204-cancel
  Scenario: 기존 예약을 취소한다
    Given 다음 예약이 등록되어 있다
      | roomId | reservationDate | startTime | endTime | ownerName | attendees | purpose |
      | ROOM_1 | 2026-06-10      | 10:00     | 11:00   | 김태인    | 4         | 회의준비 |
    When 사용자가 해당 예약을 취소하면
    Then 응답 상태코드는 200이어야 한다
    And 예약 상태는 "CANCELLED"이어야 한다

  @REQ-RSV-404-cancel-not-found
  Scenario: 존재하지 않는 예약을 취소한다
    When 사용자가 존재하지 않는 예약을 취소하면
    Then 응답 상태코드는 404이어야 한다
    And 오류 코드는 "ERR_RESERVATION_NOT_FOUND"이어야 한다

  @REQ-RSV-409-cancel-already-cancelled
  Scenario: 이미 취소된 예약을 다시 취소한다
    Given 취소된 예약이 존재한다
    When 사용자가 해당 예약을 다시 취소하면
    Then 응답 상태코드는 409이어야 한다
    And 오류 코드는 "ERR_ALREADY_CANCELLED"이어야 한다

  @REQ-RSV-201-after-cancel-rebook
  Scenario: 취소된 시간대에 다시 예약한다
    Given 다음 예약이 등록되어 있다
      | roomId | reservationDate | startTime | endTime | ownerName | attendees | purpose |
      | ROOM_1 | 2026-06-10      | 10:00     | 11:00   | 김태인    | 4         | 회의준비 |
    And 사용자가 해당 예약을 취소했다
    When 사용자가 같은 회의실과 같은 시간으로 다시 예약하면
      | roomId | reservationDate | startTime | endTime | ownerName | attendees | purpose |
      | ROOM_1 | 2026-06-10      | 10:00     | 11:00   | 이영희    | 3         | 재예약 |
    Then 응답 상태코드는 201이어야 한다