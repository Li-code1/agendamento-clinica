import { toZonedTime } from "date-fns-tz";

export const APP_TIMEZONE = process.env.TIMEZONE || "America/Sao_Paulo";

/**
 * Regex para validar o formato de data usado em toda a aplicação: "YYYY-MM-DD".
 * Trabalhamos com strings puras (não com objetos Date carregando hora/timezone)
 * para eliminar o risco clássico de "off-by-one day" causado por conversões
 * implícitas de timezone.
 */
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Regex para validar o formato de horário usado nos slots: "HH:mm". */
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Retorna o dia da semana (0 = domingo, 6 = sábado) de uma data "YYYY-MM-DD",
 * interpretada ao meio-dia UTC para evitar qualquer deslocamento de dia
 * quando convertida para o timezone da aplicação.
 */
export function getWeekday(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const zoned = toZonedTime(utcNoon, APP_TIMEZONE);
  return zoned.getDay();
}

/** Retorna a data de hoje como string "YYYY-MM-DD" no timezone da aplicação. */
export function todayDateStr(): string {
  const now = toZonedTime(new Date(), APP_TIMEZONE);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Valida se uma string de data é um calendário válido (ex: rejeita "2026-02-30"). */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
