/** Parse supported ISO precision without inventing missing month/day components. */
function parts(date) {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(date ?? '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = match[2] === undefined ? null : Number(match[2]);
  const day = match[3] === undefined ? null : Number(match[3]);
  if (month !== null && (month < 1 || month > 12)) return null;
  if (day !== null) {
    const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day < 1 || day > maxDay) return null;
  }
  return { year, month };
}

/** Year precision is retained; month/day precision is displayed as Mon YYYY. */
export function formatYearMonthDate(date) {
  const parsed = parts(date);
  if (!parsed) return date;
  if (parsed.month === null) return String(parsed.year);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(parsed.year, parsed.month - 1, 1)));
  return `${month} ${parsed.year}`;
}

/** Missing month precision never compares equal to a known month. */
export function datesShareMonthAndYear(first, second) {
  const a = parts(first);
  const b = parts(second);
  return Boolean(a && b && a.month !== null && b.month !== null
    && a.year === b.year && a.month === b.month);
}
