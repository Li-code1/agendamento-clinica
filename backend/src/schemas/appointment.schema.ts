import { z } from "zod";
import { DATE_REGEX, TIME_REGEX } from "../lib/timezone";

export const availableQuerySchema = z.object({
  date: z
    .string({ required_error: "O parâmetro 'date' é obrigatório" })
    .regex(DATE_REGEX, "Formato de data inválido. Use YYYY-MM-DD"),
});

export const createAppointmentSchema = z.object({
  patientName: z
    .string({ required_error: "O nome do paciente é obrigatório" })
    .trim()
    .min(2, "O nome do paciente deve ter pelo menos 2 caracteres"),
  date: z
    .string({ required_error: "A data é obrigatória" })
    .regex(DATE_REGEX, "Formato de data inválido. Use YYYY-MM-DD"),
  time: z
    .string({ required_error: "O horário é obrigatório" })
    .regex(TIME_REGEX, "Formato de horário inválido. Use HH:mm"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
