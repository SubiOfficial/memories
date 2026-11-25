/** Renders text in Title Case for display, without touching how it's stored. */
export function toTitleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => (word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}
