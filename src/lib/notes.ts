export type Note = {
  id: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export type PreviewMode = "write" | "preview" | "split";

const WELCOME = `# Bienvenido a Folio

Un cuaderno para escribir en markdown. Las notas viven en este navegador: no hay cuenta ni servidor.

La **primera línea** es el título. El resto puede ser una lista, una cita o una idea a medias.

- **Nueva nota** abre una hoja en blanco
- La **búsqueda** filtra al instante
- La **vista previa** compone el markdown

> Escribe poco y con calma. Lo demás es ruido.

La sintaxis es [markdown](https://es.wikipedia.org/wiki/Markdown).`;

const FIELD = `# Lista de campo

Cosas para no olvidar cuando baje la luz.

- [x] Afilar el lápiz
- [ ] Anotar lo que se oyó en la calle
- [ ] Dejar una línea en blanco entre ideas

\`\`\`
folio guarda solo el texto
\`\`\`
`;

export function createSeedNotes(now = Date.now()): Note[] {
  return [
    {
      id: "welcome",
      body: WELCOME,
      createdAt: now - 26 * 60 * 60 * 1000,
      updatedAt: now - 45 * 60 * 1000,
    },
    {
      id: "campo",
      body: FIELD,
      createdAt: now - 50 * 60 * 60 * 1000,
      updatedAt: now - 26 * 60 * 60 * 1000,
    },
  ];
}

export function noteTitle(body: string): string {
  const line = body.split(/\r?\n/).find((entry) => entry.trim().length > 0);
  if (!line) return "Sin título";
  const cleaned = line
    .replace(/^#{1,6}\s+/, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
  return cleaned || "Sin título";
}

export function noteExcerpt(body: string): string {
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return "";
  return lines
    .slice(1, 4)
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~>#|[\]-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(body: string): number {
  const text = body.trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

export function wordsLabel(count: number): string {
  return count === 1 ? "1 palabra" : `${count} palabras`;
}

export function notesLabel(count: number): string {
  return count === 1 ? "1 nota" : `${count} notas`;
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function formatEdited(ts: number, now: number): string {
  const delta = Math.max(0, now - ts);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(ts);
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt);
}
