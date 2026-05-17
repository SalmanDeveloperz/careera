/** Extract deadline dates from free text (RSS descriptions, etc.). */
export function parseDeadlineFromText(text: string): Date | null {
  const lower = text.toLowerCase();

  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(iso[0]);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const longForm = text.match(
    /\b(deadline|due|closes?|apply by|applications? close)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+20\d{2})/i,
  );
  if (longForm?.[2]) {
    const d = new Date(longForm[2]);
    if (!Number.isNaN(d.getTime())) return d;
  }

  if (lower.includes("rolling")) return null;

  return null;
}
