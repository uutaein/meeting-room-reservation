import express from "express";
import { deleteAllReservations } from "../repositories/reservationRepository.js";

const router = express.Router();

router.post("/reset", (req, res) => {
  try {
    deleteAllReservations();

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

export default router;