import express from "express";
import cors from "cors";
import availableRoutes from "./routes/available.routes";
import appointmentsRoutes from "./routes/appointments.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/available", availableRoutes);
  app.use("/appointments", appointmentsRoutes);

  // Rota não encontrada
  app.use((_req, res) => {
    res.status(404).json({ error: "NOT_FOUND", message: "Rota não encontrada" });
  });

  return app;
}
