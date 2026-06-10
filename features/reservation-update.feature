@REQ-RSV-UPDATE
Feature: 예약 수정
  사용자는 기존 ACTIVE 예약을 수정할 수 있다.

  Scenario: 기존 예약을 정상 수정한다
    Given 기존 예약이 등록되어 있다
    When 사용자가 예약 정보를 수정한다
    Then 응답 상태 코드는 200이다
    And 수정된 예약 정보가 반환된다
 
  Scenario: 자기 자신의 예약 시간을 변경한다
   Given 기존 예약이 등록되어 있다
   When 사용자가 자기 예약 시간을 일부 겹치게 변경한다
   Then 응답 상태 코드는 200이다
   And 수정된 시간이 반환된다

  Scenario: 존재하지 않는 예약을 수정한다
    When 사용자가 존재하지 않는 예약을 수정한다
    Then 응답 상태 코드는 404이다
    And 오류 코드는 "ERR_RESERVATION_NOT_FOUND"이다

  Scenario: 이미 취소된 예약을 수정한다
    Given 기존 예약이 취소되어 있다
    When 사용자가 해당 예약을 수정한다
    Then 응답 상태 코드는 409이다
    And 오류 코드는 "ERR_CANCELLED_RESERVATION_NOT_EDITABLE"이다

  Scenario: 수정 후 다른 예약과 시간이 겹친다
    Given 같은 회의실에 기존 예약이 등록되어 있다
    And 수정 대상 예약이 등록되어 있다
    When 사용자가 수정 대상 예약을 기존 예약 시간과 겹치게 수정한다
    Then 응답 상태 코드는 409이다
    And 오류 코드는 "ERR_RESERVATION_OVERLAP"이다

  Scenario: 자기 자신의 기존 시간은 중복으로 보지 않는다
    Given 기존 예약이 등록되어 있다
    When 사용자가 같은 시간으로 목적만 수정한다
    Then 응답 상태 코드는 200이다
    And 수정된 목적이 반환된다

  Scenario: 수정 후 참석 인원이 회의실 정원을 초과한다
    Given 회의실 1에 기존 예약이 등록되어 있다
    When 사용자가 참석 인원을 7명으로 수정한다
    Then 응답 상태 코드는 400이다
    And 오류 코드는 "ERR_CAPACITY_EXCEEDED"이다