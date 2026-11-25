import type { WordItem } from "../types";

export function exportWords(words: WordItem[], filename = "text-sphere-words.json") {
  const blob = new Blob([JSON.stringify(words, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `w_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function parseImportedWords(raw: string): WordItem[] {
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Invalid file: expected an array");

  return data
    .map((item): WordItem | null => {
      if (typeof item === "string") return { id: makeId(), text: item };
      if (item && typeof item.text === "string") {
        return { id: typeof item.id === "string" ? item.id : makeId(), text: item.text };
      }
      return null;
    })
    .filter((w): w is WordItem => w !== null && w.text.trim().length > 0);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
