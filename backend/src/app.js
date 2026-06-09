import express from "express";
import cors from "cors";
import reservationRoutes from "./routes/reservationRoutes.js";
import testRoutes from "./routes/testRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

app.use("/reservations", reservationRoutes);

if (process.env.NODE_ENV === "test") {
  app.use("/test", testRoutes);
}

export default app;