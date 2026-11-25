import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col items-center pt-[max(1.25rem,env(safe-area-inset-top))] px-4 text-center"
    >
      <h1
        data-shatter
        className="text-gradient text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
      >
        Akshay Subi
      </h1>
      <p
        data-shatter
        className="mt-1 text-xs font-medium uppercase tracking-[0.35em] sm:text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Unbroken Memories
      </p>
    </motion.header>
  );
}
