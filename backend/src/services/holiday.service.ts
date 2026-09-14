/**
 * Serviço responsável por consultar a API pública da Nager.Date e
 * determinar se uma data específica é feriado nacional no Brasil.
 *
 * A consulta acontece exclusivamente no backend (nunca no frontend),
 * conforme exigido pelas regras de negócio.
 */

const NAGER_BASE_URL = "https://date.nager.at/api/v3/PublicHolidays";

// Cache simples em memória, por ano, para não bater na API externa
// a cada requisição de disponibilidade dentro do mesmo processo.
const holidayCacheByYear = new Map<number, Set<string>>();

interface NagerHoliday {
  date: string; // "YYYY-MM-DD"
  localName: string;
  name: string;
}

/**
 * Busca (com cache) o conjunto de datas de feriados nacionais do Brasil
 * para o ano informado.
 */
async function getHolidaysForYear(year: number): Promise<Set<string>> {
  const cached = holidayCacheByYear.get(year);
  if (cached) return cached;

  const url = `${NAGER_BASE_URL}/${year}/BR`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao consultar a API de feriados (status ${response.status})`);
  }

  const holidays = (await response.json()) as NagerHoliday[];
  const holidaySet = new Set(holidays.map((h) => h.date));

  holidayCacheByYear.set(year, holidaySet);
  return holidaySet;
}

/**
 * Verifica se a data ("YYYY-MM-DD") informada é feriado nacional no Brasil.
 * Lança erro se a API externa estiver indisponível — o chamador decide
 * como tratar essa falha (ver appointment.service.ts).
 */
export async function isHoliday(dateStr: string): Promise<boolean> {
  const year = Number(dateStr.split("-")[0]);
  const holidays = await getHolidaysForYear(year);
  return holidays.has(dateStr);
}
