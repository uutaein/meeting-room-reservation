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

// feature/vue-reservation-cancel
export async function cancelReservation(id) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
      method: "PATCH"
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
    throw new Error(body.message || "예약 취소에 실패했습니다.");
  }

  return body;
}

// feature/reservation-update
export async function updateReservation(id, input) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: "PUT",
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
    throw new Error(body.message || "예약 수정에 실패했습니다.");
  }

  return body;
}

export async function previewRecurringReservation(input) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/reservations/recurring/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  } catch (error) {
    throw new Error("예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error("예약 서버 응답을 해석할 수 없습니다.");
  }

  if (!response.ok) {
    throw new Error(body.message || "반복 예약 미리보기에 실패했습니다.");
  }

  return body;
}

export async function createRecurringReservation(input) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/reservations/recurring`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  } catch (error) {
    throw new Error("예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error("예약 서버 응답을 해석할 수 없습니다.");
  }

  if (!response.ok) {
    throw new Error(body.message || "반복 예약 등록에 실패했습니다.");
  }

  return body;
}

export async function updateRecurringReservation(groupId, input) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/reservations/recurring/${groupId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  } catch (error) {
    throw new Error("예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error("예약 서버 응답을 해석할 수 없습니다.");
  }

  if (!response.ok) {
    throw new Error(body.message || "반복 예약 일괄 수정에 실패했습니다.");
  }

  return body;
}

export async function cancelRecurringReservation(groupId, input) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/reservations/recurring/${groupId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  } catch (error) {
    throw new Error("예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error("예약 서버 응답을 해석할 수 없습니다.");
  }

  if (!response.ok) {
    throw new Error(body.message || "반복 예약 일괄 취소에 실패했습니다.");
  }

  return body;
}

export async function fetchRecurringReservations(groupId) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/reservations/recurring/${groupId}`);
  } catch (error) {
    throw new Error("예약 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error("예약 서버 응답을 해석할 수 없습니다.");
  }

  if (!response.ok) {
    throw new Error(body.message || "반복 예약 목록 조회에 실패했습니다.");
  }

  return body.reservations;
}