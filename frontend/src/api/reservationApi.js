const API_BASE_URL = "http://localhost:3000";

export async function fetchReservationsByDate(date) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations?date=${date}`);

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.message || "예약 목록 조회에 실패했습니다.");
    }

    return body.reservations;
  } catch (error) {
    throw new Error(
      "예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요."
    );
  }
}