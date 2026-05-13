export type QuizRow = { question: string; answer: string };

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++;
          continue;
        }
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

export function parseQuizCsv(text: string): QuizRow[] {
  const rows: QuizRow[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = splitCsvLine(line);
    if (parts.length < 2) continue;
    const question = parts[0].trim();
    const answer = parts.slice(1).join(",").trim();
    if (question && answer) rows.push({ question, answer });
  }
  return rows;
}

export function answersRoughlyMatch(expected: string, given: string): boolean {
  const n = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^\p{L}\p{N}\s.,()-]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  return n(given).includes(n(expected)) || n(expected).includes(n(given));
}
