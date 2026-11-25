import { useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const FLOATING_HEART_COUNT = 16;

/** Ambient hearts that keep drifting up through the love note while it's liked. */
function FloatingHearts({ colors }: { colors: string[] }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: FLOATING_HEART_COUNT }).map((_, i) => ({
        id: i,
        left: 6 + Math.random() * 88,
        size: 10 + Math.random() * 16,
        duration: 2.6 + Math.random() * 2.4,
        delay: Math.random() * 2.6,
        drift: (Math.random() - 0.5) * 46,
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    [colors]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          initial={{ opacity: 0, y: 24, x: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: -240, x: h.drift }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "easeOut" }}
          className="absolute bottom-0"
          style={{ left: `${h.left}%`, fontSize: h.size, color: h.color, filter: "drop-shadow(0 0 6px currentColor)" }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  );
}

const NOTE_HEART_COLORS = ["#ff6f7f", "#ff97a1", "#e7b768", "#f0cd8e", "#fff6ef"];

const SPARKLE_COUNT = 9;

/** A handful of always-on twinkling glints — the ambient "something magical is
 * happening here" layer that reads even before the note is liked. */
function Sparkles() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
        id: i,
        left: 4 + Math.random() * 92,
        top: 6 + Math.random() * 88,
        size: 3 + Math.random() * 4,
        duration: 1.8 + Math.random() * 2.2,
        delay: Math.random() * 3,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]" aria-hidden>
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: "#fff6ef",
            boxShadow: "0 0 6px 1px rgba(255, 246, 239, 0.9)",
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 0.4] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** The postcard-style love note: a frosted glass keepsake with a slowly
 * rotating gradient border, a light sweeping across it, and a pointer-tilt
 * that makes it feel like a physical card in your hand. Tapping its heart
 * turns the glow warmer and sends hearts drifting through it. */
export function LoveNote({ onHeartTap }: { onHeartTap: () => void }) {
  const [isLiked, setIsLiked] = useState(false);
  const [pop, setPop] = useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 200, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(springY, [0, 1], [7, -7]);
  const rotateY = useTransform(springX, [0, 1], [-7, 7]);
  const sheenX = useTransform(springX, [0, 1], ["-20%", "120%"]);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  };

  const handlePointerLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      onClick={(e) => e.stopPropagation()}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative w-[19rem] sm:w-[23rem]"
      style={{ perspective: 900 }}
    >
      {/* Always-on rotating gradient border — the "miracle" halo that frames
          the glass note. Masked down to just the ring (padding-box XOR
          border-box) so the card's center stays genuinely transparent
          instead of the gradient bleeding through behind the glass. */}
      <motion.div
        aria-hidden
        className="absolute -inset-[3px] overflow-hidden rounded-[26px]"
        animate={{ opacity: isLiked ? 1 : 0.75 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: 3,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isLiked ? 4 : 7, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-1/2"
          style={{
            background: "conic-gradient(from 0deg, #ff6f7f, #ff97a1, #e7b768, #5c2a49, #ff6f7f)",
            filter: "blur(2px) saturate(160%)",
          }}
        />
      </motion.div>

      <motion.div
        animate={
          isLiked
            ? {
                boxShadow: [
                  "0 0 0 1px rgba(255,255,255,0.16) inset, 0 30px 70px -18px rgba(255,111,127,0.42)",
                  "0 0 0 1px rgba(255,255,255,0.26) inset, 0 34px 80px -12px rgba(255,111,127,0.62)",
                  "0 0 0 1px rgba(255,255,255,0.16) inset, 0 30px 70px -18px rgba(255,111,127,0.42)",
                ],
              }
            : { boxShadow: "0 0 0 1px rgba(255,255,255,0.14) inset, 0 30px 60px -20px rgba(10,2,8,0.55)" }
        }
        transition={{ duration: 3, repeat: isLiked ? Infinity : 0, ease: "easeInOut" }}
        className="relative -rotate-[1.1deg] overflow-hidden rounded-[22px] px-8 py-9 text-center"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          background: isLiked
            ? "linear-gradient(180deg, rgba(255,246,239,0.16), rgba(255,246,239,0.05))"
            : "linear-gradient(180deg, rgba(255,246,239,0.14), rgba(255,246,239,0.045))",
          backdropFilter: "blur(22px) saturate(170%)",
          WebkitBackdropFilter: "blur(22px) saturate(170%)",
          color: "#f8e9de",
          transition: "background 0.7s ease",
        }}
      >
        <Sparkles />
        {isLiked && <FloatingHearts colors={NOTE_HEART_COLORS} />}

        {/* Diagonal light sweep that follows the pointer, reinforcing the glass feel. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
          style={{
            left: sheenX,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
            mixBlendMode: "overlay",
          }}
        />

        <div
          className="love-postmark absolute right-11 top-4 flex h-[74px] w-[74px] items-center justify-center rounded-full text-center"
          style={{ opacity: isLiked ? 0.2 : 0.4, transition: "opacity 0.6s ease", transform: "rotate(-14deg)", mixBlendMode: "screen" }}
          aria-hidden
        >
          <strong className="text-[8px] font-bold tracking-[0.12em]" style={{ color: "#f8e9de" }}>
            WITH
            <br />
            LOVE
          </strong>
        </div>

        <div
          className="absolute -top-3.5 right-6 flex h-[68px] w-14 rotate-[7deg] flex-col items-center justify-center gap-1 rounded-[5px] border-2 border-dashed"
          style={{
            background: "rgba(255,246,239,0.12)",
            backdropFilter: "blur(10px)",
            borderColor: "rgba(255,151,161,0.6)",
            opacity: isLiked ? 0.35 : 0.85,
            transition: "opacity 0.6s ease",
          }}
          aria-hidden
        >
          <span className="love-mini-heart mt-0.5" />
          <span className="text-[6.5px] font-bold tracking-[0.14em]" style={{ color: "#fff6ef" }}>
            LIKED
          </span>
        </div>

        <p
          className="relative z-10 mb-4 text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: "rgba(248,233,222,0.75)" }}
        >
          a little note for
        </p>

        <button
          type="button"
          aria-pressed={isLiked}
          aria-label="Favorite this note for Kuttachi"
          onClick={() => {
            setIsLiked((v) => !v);
            setPop(false);
            requestAnimationFrame(() => setPop(true));
            onHeartTap();
          }}
          className="relative z-10 mx-auto mb-2 flex h-20 w-20 items-center justify-center bg-transparent"
        >
          <span
            className={`love-heart ${isLiked ? "is-liked" : ""} ${pop ? "pop" : ""}`}
            onAnimationEnd={() => setPop(false)}
          />
        </button>

        <h1 className="relative z-10 mt-1 leading-[1.15]" style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', serif" }}>
          <span className="block text-[20px] italic" style={{ color: "#f8e9de", opacity: 0.85 }}>
            Love you,
          </span>
          <span
            className="mt-0.5 block text-[42px] italic"
            style={{ color: "#ff97a1", textShadow: isLiked ? "0 0 22px rgba(255,111,127,0.65)" : "0 0 12px rgba(255,111,127,0.35)", transition: "text-shadow 0.6s ease" }}
          >
            Kuttachi
          </span>
        </h1>

        <div className="relative z-10 mx-auto my-4 flex w-4/5 items-center justify-center gap-2.5">
          <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #e7b768)" }} />
          <span className="love-dot" />
          <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, #e7b768, transparent)" }} />
        </div>

        <p className="relative z-10 text-[17px] font-semibold" style={{ color: "#fff6ef" }}>
          Thanks for liking 💗
        </p>
        <p className="relative z-10 mt-2.5 text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "rgba(248,233,222,0.7)" }}>
          tap the heart to send some back
        </p>
      </motion.div>
    </motion.div>
  );
}
