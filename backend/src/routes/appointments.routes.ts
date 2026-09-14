import { Router } from "express";
import {
  createAppointmentHandler,
  listAppointmentsHandler,
} from "../controllers/appointments.controller";

const router = Router();

router.post("/", createAppointmentHandler);
router.get("/", listAppointmentsHandler);

export default router;
