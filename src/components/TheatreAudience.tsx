import { useMemo } from "react";

interface Head {
  id: string;
  left: number;
  scale: number;
  lean: number;
  hairStyle: "bare" | "round" | "bun" | "side";
}

function makeRow(count: number, seedOffset: number): Head[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${seedOffset}-${i}`,
    left: (i / (count - 1)) * 104 - 2 + (Math.random() - 0.5) * 4,
    scale: 0.7 + Math.random() * 0.6,
    lean: (Math.random() - 0.5) * 12,
    hairStyle: (["bare", "round", "bun", "side"] as const)[Math.floor(Math.random() * 4)],
  }));
}

/** One silhouette: shoulders + head, with a bit of hair variation so the crowd
 * doesn't read as identical clones. */
function HeadSilhouette({ hairStyle }: { hairStyle: Head["hairStyle"] }) {
  return (
    <svg viewBox="0 0 60 64" className="h-full w-full overflow-visible">
      <ellipse cx="30" cy="64" rx="27" ry="18" fill="currentColor" />
      <circle cx="30" cy="24" r="15" fill="currentColor" />
      {hairStyle === "round" && <circle cx="30" cy="15" r="15" fill="currentColor" />}
      {hairStyle === "bun" && <circle cx="30" cy="6" r="6" fill="currentColor" />}
      {hairStyle === "side" && <ellipse cx="20" cy="16" rx="10" ry="14" fill="currentColor" />}
    </svg>
  );
}

/** A layered theatre audience — a sharper, denser back row plus a handful of
 * larger, softly out-of-focus heads in front — as if you're sitting among
 * real people looking up at the big screen. Pure generated silhouettes, not
 * based on any photo or artwork. */
export function TheatreAudience() {
  const backRow = useMemo(() => makeRow(30, 1), []);
  const frontRow = useMemo(() => makeRow(11, 2), []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[20vh] min-h-[110px] overflow-hidden"
      aria-hidden
    >
      {backRow.map((h) => (
        <div
          key={h.id}
          className="absolute bottom-[6%] text-[#05060a]"
          style={{
            left: `${h.left}%`,
            width: `${7.5 * h.scale}vh`,
            height: `${8 * h.scale}vh`,
            transform: `translateX(-50%) rotate(${h.lean}deg)`,
            opacity: 0.88,
          }}
        >
          <HeadSilhouette hairStyle={h.hairStyle} />
        </div>
      ))}

      {frontRow.map((h) => (
        <div
          key={h.id}
          className="absolute bottom-[-4%] text-black"
          style={{
            left: `${h.left}%`,
            width: `${13 * h.scale}vh`,
            height: `${14 * h.scale}vh`,
            transform: `translateX(-50%) rotate(${h.lean}deg)`,
            opacity: 0.96,
            filter: "blur(2.5px)",
          }}
        >
          <HeadSilhouette hairStyle={h.hairStyle} />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6) 88%)" }}
      />
    </div>
  );
}
