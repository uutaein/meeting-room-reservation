const { Before } = require("@cucumber/cucumber");

const API_BASE_URL = "http://localhost:3000";

Before(async function () {
  const response = await fetch(`${API_BASE_URL}/test/reset`, {
    method: "POST"
  });

  if (response.status !== 204) {
    throw new Error(`테스트 DB 초기화 실패: status=${response.status}`);
  }
});