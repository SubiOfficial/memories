import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

const STAR_COUNT = 220;

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

/** Lightweight twinkling starfield drawn on a 2D canvas — same night-mode,
 * deep-space feel as the homepage sphere's background, without spinning up a
 * second WebGL context for a page that just needs an ambient backdrop. */
function useStarCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let frame = 0;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0.4 + Math.random() * 1.3,
        baseAlpha: 0.25 + Math.random() * 0.6,
        twinkleSpeed: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * star.twinkleSpeed + star.phase);
        ctx.globalAlpha = star.baseAlpha * (0.4 + 0.6 * twinkle);
        ctx.fillStyle = "#f5f6fa";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(frame);
    };
  }, [canvasRef]);
}

const NEBULA_BLOBS = [
  { color: "#7c5cff", top: "12%", left: "18%", size: 46 },
  { color: "#5ea8ff", top: "62%", left: "72%", size: 52 },
  { color: "#ff6fae", top: "78%", left: "20%", size: 38 },
  { color: "#4fd8c4", top: "20%", left: "78%", size: 40 },
];

/** Soft, slowly drifting color blobs layered under the stars — the animated
 * "real galaxy" glow, kept subtle so it never fights whatever's on top. */
function NebulaGlow() {
  const blobs = useMemo(() => NEBULA_BLOBS, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            top: blob.top,
            left: blob.left,
            width: `${blob.size}vmax`,
            height: `${blob.size}vmax`,
            background: blob.color,
            opacity: 0.14,
            mixBlendMode: "screen",
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            opacity: [0.1, 0.2, 0.12, 0.1],
          }}
          transition={{ duration: 26 + i * 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Night-mode, animated deep-space backdrop — matches the homepage sphere's
 * starfield/galaxy feel for full-screen pages that sit above it (like the
 * Adventures slideshow) instead of leaving them on a flat black background. */
export function GalaxyBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useStarCanvas(canvasRef);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 0%, #0b0d16, #05060a 60%)" }}
      aria-hidden
    >
      <NebulaGlow />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
