import { Request, Response } from "express";
import { createAppointmentSchema } from "../schemas/appointment.schema";
import {
  createAppointment,
  listAppointments,
  InvalidDateError,
  InvalidTimeError,
  UnavailableDateError,
  SlotTakenError,
  ExternalApiError,
} from "../services/appointment.service";

export async function createAppointmentHandler(req: Request, res: Response) {
  const parseResult = createAppointmentSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "INVALID_REQUEST",
      message: parseResult.error.errors[0]?.message ?? "Requisição inválida",
    });
  }

  try {
    const appointment = await createAppointment(parseResult.data);
    return res.status(201).json({
      id: appointment.id,
      patientName: appointment.patientName,
      date: appointment.date,
      time: appointment.time,
      message: "Agendamento realizado com sucesso",
    });
  } catch (err) {
    if (err instanceof InvalidDateError) {
      return res.status(400).json({ error: "INVALID_DATE", message: err.message });
    }
    if (err instanceof InvalidTimeError) {
      return res.status(400).json({ error: "INVALID_TIME", message: err.message });
    }
    if (err instanceof UnavailableDateError) {
      return res.status(400).json({ error: err.reason, message: `Data indisponível: ${err.reason}` });
    }
    if (err instanceof SlotTakenError) {
      return res.status(409).json({ error: "SLOT_TAKEN", message: "Este horário já está ocupado" });
    }
    if (err instanceof ExternalApiError) {
      return res.status(502).json({
        error: "EXTERNAL_API_ERROR",
        message: "Não foi possível consultar a API de feriados no momento",
      });
    }
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "Erro interno do servidor" });
  }
}

export async function listAppointmentsHandler(_req: Request, res: Response) {
  try {
    const appointments = await listAppointments();
    return res.status(200).json(
      appointments.map((a) => ({
        id: a.id,
        patientName: a.patientName,
        date: a.date,
        time: a.time,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "Erro interno do servidor" });
  }
}
