const API_BASE_URL = "http://localhost:3000";

export async function fetchReservationsByDate(date) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/reservations?date=${date}`);
  } catch (error) {
    throw new Error(
      "예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요."
    );
  }

  let body;

  try {
    body = await response.json();
  } catch (error) {
    throw new Error("예약 서버 응답을 해석할 수 없습니다.");
  }

  if (!response.ok) {
    throw new Error(body.message || "예약 목록 조회에 실패했습니다.");
  }

  return body.reservations;
}

export async function createReservation(input) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  } catch (error) {
    throw new Error(
      "예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요."
    );
  }

  let body;

  try {
    body = await response.json();
  } catch (error) {
    throw new Error("예약 서버 응답을 해석할 수 없습니다.");
  }

  if (!response.ok) {
    throw new Error(body.message || "예약 등록에 실패했습니다.");
  }

  return body;
}