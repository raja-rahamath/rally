/**
 * Format a date string according to a format pattern.
 * Supported tokens: dd, MM, yyyy, yy
 * Default: dd/MM/yyyy
 */
export function formatDate(date: string | Date, format = 'dd/MM/yyyy'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const yearFull = String(d.getFullYear());
  const yearShort = yearFull.slice(-2);

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', yearFull)
    .replace('yy', yearShort);
}
