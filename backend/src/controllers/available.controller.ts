import { Request, Response } from "express";
import { availableQuerySchema } from "../schemas/appointment.schema";
import {
  getAvailability,
  InvalidDateError,
  ExternalApiError,
} from "../services/appointment.service";

export async function getAvailableHandler(req: Request, res: Response) {
  const parseResult = availableQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "INVALID_REQUEST",
      message: parseResult.error.errors[0]?.message ?? "Requisição inválida",
    });
  }

  const { date } = parseResult.data;

  try {
    const result = await getAvailability(date);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof InvalidDateError) {
      return res.status(400).json({ error: "INVALID_DATE", message: err.message });
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
