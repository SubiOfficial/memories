import { useEffect, useRef } from "react";
import { useMusicStore } from "../store/musicStore";

/**
 * Renders the actual <audio> element and keeps it in sync with musicStore.
 *
 * Browsers block audio-with-sound before any user gesture, so this starts muted
 * automatically on load (always allowed) and unmutes itself on the very first
 * click/tap/keypress anywhere on the page.
 */
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasUnmutedRef = useRef(false);
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackId = useMusicStore((s) => s.currentTrackId);
  const playing = useMusicStore((s) => s.playing);
  const init = useMusicStore((s) => s.init);
  const setHasUnmuted = useMusicStore((s) => s.setHasUnmuted);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) ?? tracks[0];

  useEffect(() => {
    init();
  }, [init]);

  // Mount: start muted immediately — muted autoplay is always allowed by browsers.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = true;
    audio.volume = 0.5;
    if (playing) {
      audio.play().catch(() => {
        /* ignored — will retry once metadata/track is ready */
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track changed: reload from the start, keep prior mute state, resume if playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !hasUnmutedRef.current;
    audio.load();
    if (playing) {
      audio.volume = 0.5;
      audio.play().catch(() => {
        /* browser blocked autoplay or file not found yet — ignored */
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.url]);

  // Play/pause toggled: don't reload, just resume/pause in place.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.volume = 0.5;
      audio.play().catch(() => {
        /* browser blocked autoplay or file not found yet — ignored */
      });
    } else {
      audio.pause();
    }
  }, [playing]);

  // First interaction anywhere: unmute for real, exactly once.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const events: (keyof DocumentEventMap)[] = ["pointerdown", "keydown", "touchstart"];
    const unmute = () => {
      if (hasUnmutedRef.current) return;
      hasUnmutedRef.current = true;
      audio.muted = false;
      setHasUnmuted(true);
      if (playing && audio.paused) {
        audio.play().catch(() => {
          /* ignored */
        });
      }
      events.forEach((ev) => document.removeEventListener(ev, unmute));
    };

    events.forEach((ev) => document.addEventListener(ev, unmute));
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, unmute));
    };
  }, [playing, setHasUnmuted]);

  if (!currentTrack) return null;

  return <audio ref={audioRef} src={currentTrack.url} loop preload="none" muted />;
}
