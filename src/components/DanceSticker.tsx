import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DANCE_STICKERS = [
  "05f3db7157d1a9563c8b093c98ab5a3e.gif",
  "0bc0f5adc09f241fbb422f95e4fee939.gif",
  "450844315e9c1442d0917bf1901fbbb5.gif",
  "57eaec9758289051612d69bc80fe0474.gif",
  "5e5487a251c884f8b2b105734843825d.gif",
  "6f82d926ba35a142b60dfe6afdd3244d.gif",
  "bf126bd27294464c8f959056468dbb9f.gif",
  "bubu-not-happy-bubu-throw-dudu-out.gif",
  "c1b75579406d484d3d079eb74e2cbd58.gif",
  "c93f9755c341de5b9fb736006671a210.gif",
  "cc4147c1188abed1207807ed1ced01ce.gif",
  "cfc95bf3f4a90731745039e457fa3e84.gif",
  "happy.gif",
].map((file) => `/gifs/dance/${file}`);

const STICKER_INTERVAL_MS = 2800;

/** Cycles continuously through every sticker in the dance folder, one at a
 * time, looping back to the start — always running while the card is shown. */
export function DanceSticker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % DANCE_STICKERS.length);
    }, STICKER_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute -top-[8rem] left-1/2 h-32 w-32 -translate-x-1/2">
      <AnimatePresence mode="wait">
        <motion.img
          key={DANCE_STICKERS[index]}
          src={DANCE_STICKERS[index]}
          alt=""
          aria-hidden
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
        />
      </AnimatePresence>
    </div>
  );
}
