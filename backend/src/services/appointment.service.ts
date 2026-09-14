import { prisma } from "../lib/prisma";
import { isHoliday } from "./holiday.service";
import { getWeekday, isValidCalendarDate } from "../lib/timezone";

export const BUSINESS_START_HOUR = 8;
export const BUSINESS_END_HOUR = 18;

/** Todos os slots possíveis de 08:00 a 17:00, em intervalos de 1 hora. */
export const ALL_SLOTS: string[] = Array.from(
  { length: BUSINESS_END_HOUR - BUSINESS_START_HOUR },
  (_, i) => `${String(BUSINESS_START_HOUR + i).padStart(2, "0")}:00`
);

export type AvailabilityReason = "WEEKEND" | "HOLIDAY";

export type AvailabilityResult =
  | { date: string; available: true; slots: string[] }
  | { date: string; available: false; reason: AvailabilityReason; slots: [] };

export class ExternalApiError extends Error {}
export class InvalidDateError extends Error {}
export class InvalidTimeError extends Error {}
export class UnavailableDateError extends Error {
  constructor(public reason: AvailabilityReason) {
    super(`Data indisponível: ${reason}`);
  }
}
export class SlotTakenError extends Error {}

function isWeekend(dateStr: string): boolean {
  const weekday = getWeekday(dateStr);
  return weekday === 0 || weekday === 6; // domingo ou sábado
}

/**
 * Retorna a disponibilidade de horários para uma data, aplicando, nesta ordem:
 * validade do formato -> fim de semana -> feriado -> horários já ocupados.
 */
export async function getAvailability(dateStr: string): Promise<AvailabilityResult> {
  if (!isValidCalendarDate(dateStr)) {
    throw new InvalidDateError(`Data inválida: ${dateStr}`);
  }

  if (isWeekend(dateStr)) {
    return { date: dateStr, available: false, reason: "WEEKEND", slots: [] };
  }

  let holiday: boolean;
  try {
    holiday = await isHoliday(dateStr);
  } catch (err) {
    throw new ExternalApiError("Não foi possível verificar feriados no momento");
  }

  if (holiday) {
    return { date: dateStr, available: false, reason: "HOLIDAY", slots: [] };
  }

  const takenAppointments = await prisma.appointment.findMany({
    where: { date: dateStr },
    select: { time: true },
  });
  const takenTimes = new Set(takenAppointments.map((a) => a.time));

  const freeSlots = ALL_SLOTS.filter((slot) => !takenTimes.has(slot));

  return { date: dateStr, available: true, slots: freeSlots };
}

interface CreateAppointmentParams {
  patientName: string;
  date: string;
  time: string;
}

/**
 * Cria um agendamento, revalidando TODAS as regras de negócio no backend
 * (independentemente de qualquer validação já feita no frontend):
 * 1. data válida
 * 2. não é sábado
 * 3. não é domingo
 * 4. não é feriado
 * 5. horário dentro do funcionamento
 * 6. horário é um slot válido (múltiplo de 1h, entre 08:00 e 17:00)
 * 7. horário ainda está disponível (não ocupado)
 *
 * A constraint UNIQUE(date, time) no banco é a barreira final contra
 * condições de corrida (dois pedidos simultâneos para o mesmo horário).
 */
export async function createAppointment(params: CreateAppointmentParams) {
  const { patientName, date, time } = params;

  if (!isValidCalendarDate(date)) {
    throw new InvalidDateError(`Data inválida: ${date}`);
  }

  if (isWeekend(date)) {
    throw new UnavailableDateError("WEEKEND");
  }

  let holiday: boolean;
  try {
    holiday = await isHoliday(date);
  } catch (err) {
    throw new ExternalApiError("Não foi possível verificar feriados no momento");
  }
  if (holiday) {
    throw new UnavailableDateError("HOLIDAY");
  }

  if (!ALL_SLOTS.includes(time)) {
    throw new InvalidTimeError(`Horário inválido ou fora do expediente: ${time}`);
  }

  try {
    const appointment = await prisma.appointment.create({
      data: { patientName, date, time },
    });
    return appointment;
  } catch (err: any) {
    // P2002 = violação de constraint única (Prisma) -> horário já ocupado
    if (err?.code === "P2002") {
      throw new SlotTakenError(`Horário ${time} em ${date} já está ocupado`);
    }
    throw err;
  }
}

export async function listAppointments() {
  return prisma.appointment.findMany({
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}
