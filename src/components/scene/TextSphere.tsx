import { useMemo, useState } from "react";
import { fibonacciSphere, getAdaptiveFontScale, SPHERE_RADIUS } from "../../lib/spherePoints";
import { WordNode } from "./WordNode";
import type { WordItem } from "../../types";

interface TextSphereProps {
  words: WordItem[];
  searchQuery: string;
  wordColor: string;
  accent: string;
  spread: number;
}

export function TextSphere({ words, searchQuery, wordColor, accent, spread }: TextSphereProps) {
  const positions = useMemo(
    () => fibonacciSphere(words.length, SPHERE_RADIUS * spread),
    [words.length, spread],
  );
  const fontScale = useMemo(() => getAdaptiveFontScale(words.length), [words.length]);
  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <group>
      {words.map((word, i) => {
        const isMatch = isSearching && word.text.toLowerCase().includes(query);
        return (
          <WordNode
            key={word.id}
            word={word}
            position={positions[i]}
            baseScale={fontScale}
            color={wordColor}
            accent={accent}
            isDimmed={isSearching}
            isMatch={isMatch}
            phase={((i * 137.508) % 360) * (Math.PI / 180)}
            selected={selectedId === word.id}
            onToggleSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
          />
        );
      })}
    </group>
  );
}
