import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdventuresPage } from "./AdventuresPage";
import { AdventuresMusicCard } from "./AdventuresMusicCard";
import { DockedMenuButton } from "./DockedMenuButton";
import { useMusicStore } from "../store/musicStore";

export function AdventuresMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const open = location.pathname === "/adventures";
  const setPlaying = useMusicStore((s) => s.setPlaying);
  const wasPlayingRef = useRef(false);

  // Leaving home for the Adventures page (and its own Kai.mp3 track) should
  // stop the home Mehabooba track; coming back should only resume it if it
  // was actually playing before we left.
  useEffect(() => {
    if (open) {
      wasPlayingRef.current = useMusicStore.getState().playing;
      setPlaying(false);
    } else if (wasPlayingRef.current) {
      setPlaying(true);
    }
  }, [open, setPlaying]);

  return (
    <>
      <DockedMenuButton
        emoji="🧭"
        label="Adventures"
        offset={-100}
        delay={0.55}
        onClick={() => navigate("/adventures")}
      />

      <AdventuresPage open={open} onClose={() => navigate("/")} />
      <AdventuresMusicCard open={open} />
    </>
  );
}
