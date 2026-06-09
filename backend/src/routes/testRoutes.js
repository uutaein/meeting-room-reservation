import { Router } from "express";
import { deleteAllReservations } from "../repositories/reservationRepository.js";

const router = Router();

router.post("/reset", (req, res) => {
  deleteAllReservations();
  res.status(204).send();
});

export default router;