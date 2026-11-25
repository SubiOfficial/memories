import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "./Modal";
import { HeartIcon } from "./icons";

type Mood = "greet" | "curious" | "loving" | "grumpy" | "angry";

type Phase =
  | "greet1"
  | "askWake"
  | "wakeResponse"
  | "breakfastQuestion"
  | "ateResponse"
  | "angry"
  | "done";

const GREETING_1 = "Hello Akshaya Maadey ❤️";
const GREETING_2 = "Eppo endhucha? 🌞";
const WAKE_EARLY = "Samathu Kutty! ❤️🥹";
const WAKE_LATE = "Thoongu moonji! 😤 Naalaikulam seekiram ezhundhirukkanum.";
const BREAKFAST_Q = "Kaalaila saaptiya? 🍽️";
const ATE_RESPONSE = "🥹 En thanga pulla... Azhagila nee... Pinna epdi saaptama irupa? ❤️";

const ANGRY_MESSAGES = [
  "😤 Enna maithuku thingala?",
  "🙄 Nee solatha ketta thanan.",
  "😒 Un ishtam pa.",
  "😑 Naa sonna kekava pore?",
  "💪 Pinna maira strength varum?",
  "😤 Enna mo pannu.",
  "😴 Poi thoongu... Aanalum thoonga than.",
];

const WAKE_RESPONSE_MS = 2000;
const ATE_RESPONSE_MS = 2000;
const ANGRY_MESSAGE_MS = 3000;

function MonkeyFace({ mood }: { mood: Mood }) {
  const emoji =
    mood === "angry" ? "😤" : mood === "grumpy" ? "😾" : mood === "loving" ? "🥹" : "🐵";

  return (
    <div className="relative flex h-16 items-center justify-center">
      <motion.span
        className="text-5xl"
        animate={
          mood === "angry"
            ? { rotate: [0, -10, 10, -10, 0], y: [0, -2, 0, -2, 0] }
            : mood === "grumpy"
              ? { rotate: [0, -6, 0], y: [0, -1, 0] }
              : mood === "loving"
                ? { scale: [1, 1.08, 1] }
                : { y: [0, -6, 0] }
        }
        transition={
          mood === "angry"
            ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {emoji}
      </motion.span>

      {mood === "loving" && (
        <>
          {[-18, 0, 18].map((offset, i) => (
            <motion.span
              key={offset}
              className="pointer-events-none absolute top-1 text-lg"
              style={{ left: `calc(50% + ${offset}px)` }}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], y: -36, scale: 1 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
            >
              <HeartIcon filled className="h-4 w-4" style={{ color: "#ff5f8f" }} />
            </motion.span>
          ))}
        </>
      )}
    </div>
  );
}

function Bubble({
  mood,
  children,
  strong,
}: {
  mood: Mood;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col items-center gap-2 rounded-2xl px-5 py-4 text-center ${
        strong ? "glass-panel-strong" : "glass-panel"
      }`}
    >
      <MonkeyFace mood={mood} />
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {children}
      </p>
    </motion.div>
  );
}

export function DailyRoutine({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("greet1");
  const [wakeTime, setWakeTime] = useState("");
  const [wakeEarly, setWakeEarly] = useState(true);
  const [angryIndex, setAngryIndex] = useState(0);
  const [ended, setEnded] = useState<"loving" | "angry" | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhase("greet1");
    setWakeTime("");
    setAngryIndex(0);
    setEnded(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (phase === "greet1") {
      const t = setTimeout(() => setPhase("askWake"), 2000);
      return () => clearTimeout(t);
    }

    if (phase === "wakeResponse") {
      const t = setTimeout(() => setPhase("breakfastQuestion"), WAKE_RESPONSE_MS);
      return () => clearTimeout(t);
    }

    if (phase === "ateResponse") {
      const t = setTimeout(() => {
        setEnded("loving");
        setPhase("done");
      }, ATE_RESPONSE_MS);
      return () => clearTimeout(t);
    }

    if (phase === "angry") {
      const t = setTimeout(() => {
        if (angryIndex + 1 < ANGRY_MESSAGES.length) {
          setAngryIndex((i) => i + 1);
        } else {
          setEnded("angry");
          setPhase("done");
        }
      }, ANGRY_MESSAGE_MS);
      return () => clearTimeout(t);
    }
  }, [phase, angryIndex, open]);

  const submitWake = () => {
    if (!wakeTime) return;
    setWakeEarly(wakeTime <= "07:00");
    setPhase("wakeResponse");
  };

  return (
    <Modal open={open} onClose={onClose} title="Daily Routine">
      <div className="relative flex min-h-[13rem] items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "greet1" && (
            <Bubble key="greet1" mood="greet">
              {GREETING_1}
            </Bubble>
          )}

          {phase === "askWake" && (
            <motion.div
              key="askWake"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel flex w-full flex-col items-center gap-3 rounded-2xl px-5 py-4"
            >
              <MonkeyFace mood="greet" />
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {GREETING_2}
              </p>
              <div className="flex w-full gap-2">
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="glass-panel min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  type="button"
                  disabled={!wakeTime}
                  onClick={submitWake}
                  className="rounded-xl px-4 text-sm font-semibold disabled:opacity-40"
                  style={{ background: "var(--accent)", color: "#0a0a0f" }}
                >
                  Sollu!
                </button>
              </div>
            </motion.div>
          )}

          {phase === "wakeResponse" && (
            <Bubble key="wakeResponse" mood={wakeEarly ? "loving" : "grumpy"}>
              {wakeEarly ? WAKE_EARLY : WAKE_LATE}
            </Bubble>
          )}

          {phase === "breakfastQuestion" && (
            <motion.div
              key="breakfastQuestion"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel flex w-full flex-col items-center gap-3 rounded-2xl px-5 py-4"
            >
              <MonkeyFace mood="curious" />
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {BREAKFAST_Q}
              </p>
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setPhase("ateResponse")}
                  className="glass-panel flex-1 rounded-xl py-2 text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  🍽️ Saapten
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAngryIndex(0);
                    setPhase("angry");
                  }}
                  className="glass-panel flex-1 rounded-xl py-2 text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  ❌ Sapdala
                </button>
              </div>
            </motion.div>
          )}

          {phase === "ateResponse" && (
            <Bubble key="ateResponse" mood="loving" strong>
              {ATE_RESPONSE}
            </Bubble>
          )}

          {phase === "angry" && (
            <Bubble key={`angry-${angryIndex}`} mood="angry">
              {ANGRY_MESSAGES[angryIndex]}
            </Bubble>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel-strong flex w-full flex-col items-center gap-3 rounded-2xl px-5 py-4"
            >
              <MonkeyFace mood={ended === "loving" ? "loving" : "grumpy"} />
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {ended === "loving" ? "💛 Nalla iru, sandhosham!" : "😴 Sari, poi thoongu."}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2 text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#0a0a0f" }}
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
