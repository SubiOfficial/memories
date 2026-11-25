import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";

import { Header } from "./components/Header";
import { Toolbar } from "./components/Toolbar";
import { WordManagerPanel } from "./components/WordManagerPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { MusicPlayer } from "./components/MusicPlayer";
import { SongCard } from "./components/SongCard";
import { MonkeyMenu } from "./components/MonkeyMenu";
import { AdventuresMenu } from "./components/AdventuresMenu";
import { AllTimeLoveMenu } from "./components/AllTimeLoveMenu";
import { CallHelpMenu } from "./components/CallHelpMenu";
import { MessageMenu } from "./components/MessageMenu";
import { MeteorStrike } from "./components/MeteorStrike";
import { SphereCanvas } from "./components/scene/SphereCanvas";
import { useSettingsStore } from "./store/settingsStore";
import { useWordsStore } from "./store/wordsStore";
import { COLOR_THEMES, FONT_STACKS } from "./lib/themes";

function App() {
  const settings = useSettingsStore();
  const words = useWordsStore((s) => s.words);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const openPanel =
    location.pathname === "/words" ? "words" : location.pathname === "/settings" ? "settings" : null;

  const accent =
    settings.colorTheme === "custom"
      ? settings.customAccent
      : COLOR_THEMES[settings.colorTheme].accent;
  const accent2 =
    settings.colorTheme === "custom"
      ? settings.customAccent2
      : COLOR_THEMES[settings.colorTheme].accent2;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-2", accent2);
    root.style.setProperty("--font-family", FONT_STACKS[settings.font]);
    root.style.setProperty("--app-text-scale", String(settings.appTextSize));
  }, [settings.theme, settings.font, settings.appTextSize, accent, accent2]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <SphereCanvas
        words={words}
        searchQuery={searchQuery}
        wordColor={settings.sphereWordColor}
        accent={accent}
        spread={settings.sphereSpread}
        rotationSpeed={settings.sphereRotationSpeed}
        rotationDirection={settings.sphereRotationDirection}
      />

      <Header />

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenWords={() => navigate("/words")}
        onOpenSettings={() => navigate("/settings")}
        theme={settings.theme}
        onToggleTheme={settings.toggleTheme}
      />

      <WordManagerPanel
        open={openPanel === "words"}
        onClose={() => navigate("/")}
        searchQuery={searchQuery}
      />

      <SettingsPanel open={openPanel === "settings"} onClose={() => navigate("/")} />

      <MusicPlayer />
      <SongCard />
      <MonkeyMenu />
      <AdventuresMenu />
      <AllTimeLoveMenu />
      <CallHelpMenu />
      <MessageMenu />
      <MeteorStrike />
    </div>
  );
}

export default App;
