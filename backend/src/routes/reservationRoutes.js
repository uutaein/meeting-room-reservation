import { Router } from "express";
import { createReservation } from "../services/reservationService.js";

const router = Router();

router.post("/", (req, res) => {
  try {
    const reservation = createReservation(req.body);

    res
      .status(201)
      .location(`/reservations/${reservation.id}`)
      .json(reservation);
  } catch (error) {
    const status = error.status ?? 500;

    res.status(status).json({
      code: error.code ?? "ERR_INTERNAL_SERVER",
      message: error.message ?? "서버 내부 오류가 발생했습니다."
    });
  }
});

export default router;