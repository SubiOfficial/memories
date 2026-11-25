import { useState } from "react";
import { motion } from "framer-motion";
import { DockedMenuButton } from "./DockedMenuButton";
import { Modal } from "./Modal";
import { MessageIcon, SendIcon } from "./icons";

const MESSAGE_NUMBER = "6382922908";

function buildSmsHref(number: string, body: string) {
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  const encoded = encodeURIComponent(body);
  return isIOS ? `sms:${number}&body=${encoded}` : `sms:${number}?body=${encoded}`;
}

export function MessageMenu() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const send = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    window.location.href = buildSmsHref(MESSAGE_NUMBER, trimmed);
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <DockedMenuButton
        emoji={<MessageIcon className="h-5 w-5" style={{ color: "#7dd8ff" }} />}
        label="Message pannu"
        offset={116}
        delay={1}
        onClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Message pannu">
        <div className="flex flex-col gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something..."
            autoFocus
            rows={4}
            className="glass-panel w-full resize-none rounded-xl px-3 py-2 text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <motion.button
            type="button"
            onClick={send}
            disabled={!message.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--accent)", color: "#0a0a0f" }}
          >
            <SendIcon className="h-4 w-4" />
            Send
          </motion.button>
        </div>
      </Modal>
    </>
  );
}
