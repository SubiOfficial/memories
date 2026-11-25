import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Spring } from "../lib/spring";
import { createMeteorEl, shakeScreen, spawnExplosionBurst, spawnTrailParticles } from "../lib/particles";
import { playCrashSound, playImpactBoom, playPopSound, playRestoreWhoosh, playWhoosh, primeAudio } from "../lib/sound";
import { useMeteorStore } from "../store/meteorStore";
import { useMusicStore } from "../store/musicStore";

type Phase = "idle" | "flying" | "impact" | "shattered" | "restoring";

interface ShatterState {
  el: HTMLElement;
  origTop: number;
  elHeight: number;
  x: number;
  y: number;
  rot: number;
  vx: number;
  vy: number;
  vr: number;
}

interface ActiveMeteor {
  el: HTMLDivElement;
  startX: number;
  startY: number;
  impactX: number;
  impactY: number;
  angle: number;
  launchAt: number;
  duration: number;
  landed: boolean;
  primary: boolean;
  lastParticleTime: number;
}

const GRAVITY = 2600;

// Read both sticker folders dynamically (not by hardcoded filename) so adding,
// removing, or renaming stickers on disk never silently breaks these arrays.
const irritatedStickerModules = import.meta.glob("/dudububu/*.{gif,jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const IRRITATED_STICKERS = Object.values(irritatedStickerModules);

const aftermakeStickerModules = import.meta.glob("/aftermake/*.{gif,jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const AFTERMAKE_STICKERS = Object.values(aftermakeStickerModules);

const STICKER_MS = 1500;

/**
 * Self-contained "irritation release" easter egg: a meteor strike that shatters
 * every element tagged `data-shatter` across the app, then reassembles them once
 * the user types the magic word.
 */
export function MeteorStrike() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [irritatedStickerIndex, setIrritatedStickerIndex] = useState<number | null>(null);
  const [aftermakeStickerIndex, setAftermakeStickerIndex] = useState<number | null>(null);

  const strikeSphere = useMeteorStore((s) => s.strike);
  const restoreSphere = useMeteorStore((s) => s.restore);
  const setMusicPlaying = useMusicStore((s) => s.setPlaying);

  const overlayRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("idle");
  const shatterStatesRef = useRef<ShatterState[]>([]);
  const meteorsRef = useRef<ActiveMeteor[]>([]);
  const rafRef = useRef<number | null>(null);
  const musicWasPlayingRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startShatter = useCallback((impactX: number, impactY: number) => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-shatter]"));
    const states: ShatterState[] = els.map((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - impactX;
      const dy = cy - impactY;
      const dist = Math.hypot(dx, dy) || 1;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.7;
      const power = Math.max(260, Math.min(760, 90000 / dist));
      const speed = power * (0.7 + Math.random() * 0.6);
      el.style.willChange = "transform";
      return {
        el,
        origTop: rect.top,
        elHeight: rect.height,
        x: 0,
        y: 0,
        rot: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (180 + Math.random() * 220),
        vr: (Math.random() - 0.5) * 640,
      };
    });
    shatterStatesRef.current = states;

    const start = performance.now();
    let last = start;

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const elapsed = now - start;
      let allSettled = elapsed > 650;

      for (const s of states) {
        // Fraction of velocity retained per second — dt-scaled so it's frame-rate independent.
        s.vx *= Math.pow(0.35, dt);
        s.vy += GRAVITY * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.rot += s.vr * dt;
        s.vr *= Math.pow(0.4, dt);

        const floorY = window.innerHeight - s.elHeight - 16;
        const absY = s.origTop + s.y;
        if (absY > floorY) {
          s.y = floorY - s.origTop;
          s.vy = Math.abs(s.vy) > 60 ? s.vy * -0.32 : 0;
        }
        s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.rot}deg)`;

        if (Math.abs(s.vx) > 6 || Math.abs(s.vy) > 6 || Math.abs(s.vr) > 6) allSettled = false;
      }

      if (!allSettled && elapsed < 1800) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        phaseRef.current = "shattered";
        setPhase("shattered");
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const onMeteorImpact = useCallback(
    (x: number, y: number, primary: boolean) => {
      playImpactBoom();
      shakeScreen(document.body, primary ? 700 : 280, primary ? 24 : 9);
      if (overlayRef.current) spawnExplosionBurst(overlayRef.current, x, y);

      if (!primary) return;
      setTimeout(() => {
        playCrashSound();
        phaseRef.current = "impact";
        setPhase("impact");
        strikeSphere();
        startShatter(x, y);
      }, 140);
    },
    [startShatter, strikeSphere],
  );

  const handleTrigger = useCallback(() => {
    if (phaseRef.current !== "idle") return;
    phaseRef.current = "flying";
    setPhase("flying");
    musicWasPlayingRef.current = useMusicStore.getState().playing;
    setMusicPlaying(false);
    primeAudio();
    playWhoosh(1.15);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const centerX = vw * 0.5;
    const centerY = vh * 0.46;

    const count = 4 + Math.floor(Math.random() * 3);
    const now = performance.now();
    const meteors: ActiveMeteor[] = [];

    for (let i = 0; i < count; i++) {
      const startX = -140 - Math.random() * 260;
      const startY = -140 - Math.random() * 200;
      const impactX = centerX + (Math.random() - 0.5) * 170;
      const impactY = centerY + (Math.random() - 0.5) * 140;
      const angle = Math.atan2(impactY - startY, impactX - startX);
      const el = overlayRef.current ? createMeteorEl(overlayRef.current, (angle * 180) / Math.PI) : null;
      if (!el) continue;
      meteors.push({
        el,
        startX,
        startY,
        impactX,
        impactY,
        angle,
        launchAt: now + i * (110 + Math.random() * 90),
        duration: 780 + Math.random() * 260,
        landed: false,
        primary: i === 0,
        lastParticleTime: 0,
      });
    }
    meteorsRef.current = meteors;

    function step(nowT: number) {
      let allDone = true;
      for (const m of meteorsRef.current) {
        if (m.landed) continue;
        allDone = false;
        if (nowT < m.launchAt) continue;

        const elapsed = nowT - m.launchAt;
        const t = Math.min(elapsed / m.duration, 1);
        const eased = t * t;
        const x = m.startX + (m.impactX - m.startX) * eased;
        const y = m.startY + (m.impactY - m.startY) * eased;

        m.el.style.opacity = "1";
        m.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${Math.sin(elapsed / 90) * 6}deg)`;
        if (elapsed - m.lastParticleTime > 22 && overlayRef.current) {
          m.lastParticleTime = elapsed;
          spawnTrailParticles(overlayRef.current, x, y, m.angle);
        }

        if (t >= 1) {
          m.landed = true;
          m.el.remove();
          onMeteorImpact(x, y, m.primary);
        }
      }
      if (!allDone) {
        rafRef.current = requestAnimationFrame(step);
      }
    }
    rafRef.current = requestAnimationFrame(step);
  }, [onMeteorImpact]);

  const handleRestore = useCallback(() => {
    phaseRef.current = "restoring";
    setPhase("restoring");
    playRestoreWhoosh();
    restoreSphere();
    if (musicWasPlayingRef.current) setMusicPlaying(true);

    const springs = shatterStatesRef.current.map((s) => ({
      el: s.el,
      sx: new Spring(s.x, 210, 20),
      sy: new Spring(s.y, 210, 20),
      sr: new Spring(s.rot, 210, 22),
    }));

    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      let settled = true;

      for (const sp of springs) {
        const x = sp.sx.update(0, dt);
        const y = sp.sy.update(0, dt);
        const r = sp.sr.update(0, dt);
        sp.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
        if (Math.abs(sp.sx.value) > 0.4 || Math.abs(sp.sx.velocity) > 0.4) settled = false;
        if (Math.abs(sp.sy.value) > 0.4 || Math.abs(sp.sy.velocity) > 0.4) settled = false;
        if (Math.abs(sp.sr.value) > 0.4 || Math.abs(sp.sr.velocity) > 0.4) settled = false;
      }

      if (!settled) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        for (const sp of springs) {
          sp.el.style.transform = "";
          sp.el.style.willChange = "";
        }
        shatterStatesRef.current = [];
        phaseRef.current = "idle";
        setPhase("idle");
        setShowFinalPopup(true);
        playPopSound();
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [restoreSphere]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim().toLowerCase() === "umma") {
        setInputValue("");
        setInputError(false);
        handleRestore();
      } else {
        setInputError(true);
        setTimeout(() => setInputError(false), 500);
      }
    },
    [inputValue, handleRestore],
  );

  // Loops all stickers continuously while the calm-down form is up, and only
  // stops once "Umma" is typed and the sphere starts restoring.
  useEffect(() => {
    if (phase !== "shattered" || IRRITATED_STICKERS.length === 0) {
      setIrritatedStickerIndex(null);
      return;
    }
    setIrritatedStickerIndex(0);
    const id = window.setInterval(() => {
      setIrritatedStickerIndex((i) => (i === null ? 0 : (i + 1) % IRRITATED_STICKERS.length));
    }, STICKER_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  // Loops the aftermake stickers continuously for as long as the final
  // "Ehehehehe" popup is on screen, stopping the moment it closes.
  useEffect(() => {
    if (!showFinalPopup || AFTERMAKE_STICKERS.length === 0) {
      setAftermakeStickerIndex(null);
      return;
    }
    setAftermakeStickerIndex(0);
    const id = window.setInterval(() => {
      setAftermakeStickerIndex((i) => (i === null ? 0 : (i + 1) % AFTERMAKE_STICKERS.length));
    }, STICKER_MS);
    return () => window.clearInterval(id);
  }, [showFinalPopup]);

  useEffect(() => {
    if (!showFinalPopup) return;
    const timer = setTimeout(() => setShowFinalPopup(false), 3200);
    return () => clearTimeout(timer);
  }, [showFinalPopup]);

  const blocking = phase === "flying" || phase === "impact";

  return (
    <>
      <motion.button
        type="button"
        onClick={handleTrigger}
        disabled={phase !== "idle"}
        animate={{ opacity: phase === "idle" ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        whileHover={phase === "idle" ? { scale: 1.05 } : undefined}
        whileTap={phase === "idle" ? { scale: 0.95 } : undefined}
        className="glass-panel fixed left-3 top-[max(0.9rem,env(safe-area-inset-top))] z-30 rounded-full px-4 py-2 text-xs font-semibold sm:left-5 sm:top-5 sm:text-sm"
        style={{ color: "var(--text-primary)", pointerEvents: phase === "idle" ? "auto" : "none" }}
      >
        😤 Erucha mairu vandha click panu!
      </motion.button>

      <div ref={overlayRef} className="pointer-events-none fixed inset-0 z-[190] overflow-hidden" />

      {blocking && <div className="fixed inset-0 z-[195]" />}

      <AnimatePresence>
        {phase === "shattered" && (
          <motion.div
            key="calm-down-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 backdrop-blur-sm"
          >
            {/* Card stays centered on its own; the sticker is pinned above it via
                absolute positioning so it never shifts the card off-center. */}
            <div className="relative flex flex-col items-center">
              <AnimatePresence mode="wait">
                {irritatedStickerIndex !== null && IRRITATED_STICKERS[irritatedStickerIndex] && (
                  <motion.div
                    key={irritatedStickerIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIrritatedStickerIndex((i) => (i === null ? 0 : (i + 1) % IRRITATED_STICKERS.length));
                    }}
                    initial={{ opacity: 0, scale: 0.4, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14, opacity: { duration: 0.25 } }}
                    className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2"
                    style={{ cursor: "pointer" }}
                  >
                    {/* Continuous rotate/bounce lives on an inner element so it never
                        blocks the outer AnimatePresence exit transition from completing. */}
                    <motion.img
                      src={IRRITATED_STICKERS[irritatedStickerIndex]}
                      alt="Feeling irritated sticker"
                      draggable={false}
                      animate={{ rotate: [0, -8, 8, 0], y: [0, -8, 0] }}
                      transition={{
                        rotate: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                        y: { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                      }}
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "contain",
                        filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.5))",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, scale: 0.85, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="glass-panel-strong mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl p-6 text-center"
              >
                <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Kovattha Kora Thaaaye
                </p>
                <motion.input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder='Type "Umma"'
                  animate={inputError ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel w-full rounded-full px-4 py-2 text-center text-sm outline-none"
                  style={{
                    color: "var(--text-primary)",
                    border: inputError ? "1px solid #ff5f5f" : undefined,
                  }}
                />
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                  style={{ background: "var(--accent)", color: "#0a0a0f" }}
                >
                  Umma kudu 😘
                </button>
              </motion.form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinalPopup && (
          <motion.div
            key="final-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFinalPopup(false)}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            {/* Card stays centered on its own; the sticker is pinned above it via
                absolute positioning so it never shifts the card off-center. */}
            <div className="relative flex flex-col items-center">
              <AnimatePresence mode="wait">
                {aftermakeStickerIndex !== null && AFTERMAKE_STICKERS[aftermakeStickerIndex] && (
                  <motion.div
                    key={aftermakeStickerIndex}
                    initial={{ opacity: 0, scale: 0.4, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14, opacity: { duration: 0.25 } }}
                    className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2"
                  >
                    {/* Continuous rotate/bounce lives on an inner element so it never
                        blocks the outer AnimatePresence exit transition from completing. */}
                    <motion.img
                      src={AFTERMAKE_STICKERS[aftermakeStickerIndex]}
                      alt="Aftermake sticker"
                      draggable={false}
                      animate={{ rotate: [0, -8, 8, 0], y: [0, -8, 0] }}
                      transition={{
                        rotate: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                        y: { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                      }}
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "contain",
                        filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.5))",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)", textShadow: "0 2px 16px rgba(0, 0, 0, 0.6)" }}
              >
                Ehehehehe! Yaarukita 😄
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
