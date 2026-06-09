import { Router } from "express";
import {
  createReservation,
  listReservations,
  cancelReservation
} from "../services/reservationService.js";

const router = Router();

router.post("/", (req, res) => {
  try {
    const reservation = createReservation(req.body);

    res
      .status(201)
      .location(`/reservations/${reservation.id}`)
      .json(reservation);
  } catch (error) {
    if (error.message === "ERR_RESERVATION_OVERLAP") {
      return res.status(409).json({
        code: "ERR_RESERVATION_OVERLAP",
        message: "같은 회의실에 겹치는 예약이 이미 존재합니다."
      });
    }

    const status = error.status ?? 500;

    res.status(status).json({
      code: error.code ?? "ERR_INTERNAL_SERVER",
      message: error.message ?? "서버 내부 오류가 발생했습니다."
    });
  }
});

router.get("/", (req, res) => {
  try {
    const reservations = listReservations(req.query);

    return res.status(200).json({
      reservations
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      errorCode: error.errorCode || error.code || "ERR_INTERNAL_SERVER",
      message: error.message
    });
  }
});

router.patch("/:id/cancel", (req, res) => {
  try {
    const reservation = cancelReservation(req.params.id);

    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(error.status || 500).json({
      errorCode: error.errorCode || error.code || "ERR_INTERNAL_SERVER",
      message: error.message
    });
  }
});

export default router;