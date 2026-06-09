const { Before } = require("@cucumber/cucumber");
const assert = require("assert");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

Before(async function () {
  const response = await fetch(`${BASE_URL}/test/reset`, {
    method: "POST"
  });

  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    body = {};
  }

  assert.strictEqual(
    response.status,
    200,
    `/test/reset 실패: status=${response.status}, body=${JSON.stringify(body)}`
  );
});