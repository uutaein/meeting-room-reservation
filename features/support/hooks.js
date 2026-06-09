const { Before } = require("@cucumber/cucumber");
const assert = require("assert");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

Before(async function () {
  const response = await fetch(`${BASE_URL}/test/reset`, {
    method: "POST"
  });

  const text = await response.text();

  let body;
  try {
    body = JSON.parse(text);
  } catch (error) {
    body = text;
  }

  assert.strictEqual(
    response.status,
    200,
    `/test/reset 실패: status=${response.status}, body=${JSON.stringify(body)}`
  );
});