import { useState } from "react";
import { motion } from "framer-motion";
import { PanelShell } from "./PanelShell";
import { EditIcon, PlusIcon } from "./icons";
import { useWordsStore } from "../store/wordsStore";
import { toTitleCase } from "../lib/textCase";
import type { WordItem } from "../types";

interface WordManagerPanelProps {
  open: boolean;
  onClose: () => void;
  searchQuery: string;
}

function WordRow({ word }: { word: WordItem }) {
  const updateWord = useWordsStore((s) => s.updateWord);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(word.text);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0) updateWord(word.id, trimmed);
    setEditing(false);
  };

  return (
    <div className="glass-panel flex items-center gap-2 rounded-xl px-3 py-2">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(word.text);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      ) : (
        <span
          className="min-w-0 flex-1 truncate text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {toTitleCase(word.text)}
        </span>
      )}
      <button
        type="button"
        aria-label="Edit word"
        onClick={() => setEditing(true)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100"
        style={{ color: "var(--text-secondary)" }}
      >
        <EditIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function WordManagerPanel({ open, onClose, searchQuery }: WordManagerPanelProps) {
  const words = useWordsStore((s) => s.words);
  const addWord = useWordsStore((s) => s.addWord);
  const [newWord, setNewWord] = useState("");

  const query = searchQuery.trim().toLowerCase();
  const filtered = (query ? words.filter((w) => w.text.toLowerCase().includes(query)) : words)
    .slice()
    .reverse();

  const submitNew = () => {
    const trimmed = newWord.trim();
    if (trimmed.length > 0) {
      addWord(trimmed);
      setNewWord("");
    }
  };

  return (
    <PanelShell open={open} title={`Words (${words.length})`} onClose={onClose}>
      <div className="mb-4 flex gap-2">
        <input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitNew()}
          placeholder="Add a new word..."
          className="glass-panel min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        <motion.button
          type="button"
          aria-label="Add word"
          onClick={submitNew}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--accent)", color: "#0a0a0f" }}
        >
          <PlusIcon className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No words match your search.
          </p>
        )}
        {filtered.map((word) => (
          <WordRow key={word.id} word={word} />
        ))}
      </div>
    </PanelShell>
  );
}
