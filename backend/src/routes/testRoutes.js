import express from "express";
import { deleteAllReservations } from "../repositories/reservationRepository.js";

const router = express.Router();

let mockTime = null;

export function getMockTime() {
  return mockTime;
}

router.post("/reset", (req, res) => {
  try {
    deleteAllReservations();
    mockTime = null;

    return res.status(200).json({
      message: "test data reset"
    });
  } catch (error) {
    console.error("[TEST_RESET_ERROR]", error);

    return res.status(500).json({
      code: "ERR_TEST_RESET_FAILED",
      message: error.message
    });
  }
});

router.post("/set-time", (req, res) => {
  try {
    const { time } = req.body;
    mockTime = time || null;
    return res.status(200).json({
      message: "Mock time set",
      mockTime
    });
  } catch (error) {
    return res.status(500).json({
      code: "ERR_SET_TIME_FAILED",
      message: error.message
    });
  }
});

export default router;