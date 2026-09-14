/**
 * Converte uma data no formato ISO ("YYYY-MM-DD", usado internamente e
 * pela API) para o formato de exibição brasileiro ("DD/MM/YYYY").
 * Puramente cosmético — não afeta o formato usado nas chamadas ao backend.
 */
export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
