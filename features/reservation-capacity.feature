Feature: room capacity advisory
  Room capacity is an advisory guide.

  @REQ-RSV-WARN-capacity-room1
  Scenario: room 1 advisory case succeeds
    Given 회의실 1의 정원은 6명이다
    And 2026-06-10 09:00부터 10:00까지 회의실 1에 기존 예약이 없다
    When 사용자가 아래 정보로 예약을 생성한다
      | 회의실   | 회의실 1 |
      | 예약일   | 2026-06-10 |
      | 시작시간 | 09:00 |
      | 종료시간 | 10:00 |
      | 예약자명 | 김철수 |
      | 참석인원 | 7 |
      | 회의목적 | 회의 |
    Then 예약 생성은 성공해야 한다
    And 예약 상태는 "ACTIVE" 여야 한다

  @REQ-RSV-201-capacity-boundary-room1
  Scenario: room 1 boundary case succeeds
    Given 회의실 1의 정원은 6명이다
    And 2026-06-10 10:00부터 11:00까지 회의실 1에 기존 예약이 없다
    When 사용자가 아래 정보로 예약을 생성한다
      | 회의실   | 회의실 1 |
      | 예약일   | 2026-06-10 |
      | 시작시간 | 10:00 |
      | 종료시간 | 11:00 |
      | 예약자명 | 김철수 |
      | 참석인원 | 6 |
      | 회의목적 | 회의 |
    Then 예약 생성은 성공해야 한다
    And 예약 상태는 "ACTIVE" 여야 한다

  @REQ-RSV-WARN-capacity-room2
  Scenario: room 2 advisory case succeeds
    Given 회의실 2의 정원은 12명이다
    And 2026-06-10 09:00부터 10:00까지 회의실 2에 기존 예약이 없다
    When 사용자가 아래 정보로 예약을 생성한다
      | 회의실   | 회의실 2 |
      | 예약일   | 2026-06-10 |
      | 시작시간 | 09:00 |
      | 종료시간 | 10:00 |
      | 예약자명 | 김철수 |
      | 참석인원 | 13 |
      | 회의목적 | 회의 |
    Then 예약 생성은 성공해야 한다
    And 예약 상태는 "ACTIVE" 여야 한다

  @REQ-RSV-201-capacity-boundary-room2
  Scenario: room 2 boundary case succeeds
    Given 회의실 2의 정원은 12명이다
    And 2026-06-10 10:00부터 11:00까지 회의실 2에 기존 예약이 없다
    When 사용자가 아래 정보로 예약을 생성한다
      | 회의실   | 회의실 2 |
      | 예약일   | 2026-06-10 |
      | 시작시간 | 10:00 |
      | 종료시간 | 11:00 |
      | 예약자명 | 김철수 |
      | 참석인원 | 12 |
      | 회의목적 | 회의 |
    Then 예약 생성은 성공해야 한다
    And 예약 상태는 "ACTIVE" 여야 한다
