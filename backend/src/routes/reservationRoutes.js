import { Router } from "express";
import {
  createReservation,
  listReservations,
  cancelReservation,
  updateReservation,
  previewRecurring,
  createRecurringReservation,
  updateRecurring,
  cancelRecurring,
  getRecurringReservations
} from "../services/reservationService.js";

const router = Router();

router.get("/recurring/:groupId", (req, res) => {
  try {
    const reservations = getRecurringReservations(req.params.groupId);
    res.status(200).json({ reservations });
  } catch (error) {
    const status = error.status ?? 500;
    res.status(status).json({
      code: error.code ?? "ERR_INTERNAL_SERVER",
      message: error.message ?? "서버 내부 오류가 발생했습니다."
    });
  }
});

router.post("/recurring/preview", (req, res) => {
  try {
    const result = previewRecurring(req.body);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status ?? 500;
    res.status(status).json({
      code: error.code ?? "ERR_INTERNAL_SERVER",
      message: error.message ?? "서버 내부 오류가 발생했습니다."
    });
  }
});

router.post("/recurring", (req, res) => {
  try {
    const reservations = createRecurringReservation(req.body);
    res.status(201).json({ reservations });
  } catch (error) {
    if (error.message === "ERR_RESERVATION_OVERLAP" || error.code === "ERR_RESERVATION_OVERLAP") {
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

router.put("/recurring/:groupId", (req, res) => {
  try {
    const result = updateRecurring(req.params.groupId, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.code === "ERR_RESERVATION_OVERLAP") {
      return res.status(409).json({
        code: "ERR_RESERVATION_OVERLAP",
        message: "이미 해당 시간에 예약이 존재합니다."
      });
    }
    const status = error.status ?? error.statusCode ?? 500;
    res.status(status).json({
      code: error.code ?? "ERR_INTERNAL_SERVER",
      message: error.message ?? "서버 내부 오류가 발생했습니다."
    });
  }
});

router.patch("/recurring/:groupId/cancel", (req, res) => {
  try {
    const result = cancelRecurring(req.params.groupId, req.body);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status ?? 500;
    res.status(status).json({
      code: error.code ?? "ERR_INTERNAL_SERVER",
      message: error.message ?? "서버 내부 오류가 발생했습니다."
    });
  }
});

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

// feature/reservation-update
router.put("/:id", (req, res) => {
  try {
    const reservation = updateReservation(Number(req.params.id), req.body);

    res.status(200).json({
      reservation
    });
  } catch (error) {
    res.status(error.statusCode || error.status || 500).json({
      code: error.code || error.errorCode || "ERR_INTERNAL_SERVER_ERROR",
      message: error.message || "서버 오류가 발생했습니다."
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