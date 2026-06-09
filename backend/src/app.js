import express from "express";
import cors from "cors";
import reservationRoutes from "./routes/reservationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

app.use("/reservations", reservationRoutes);

export default app;