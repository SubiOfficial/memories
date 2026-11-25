import { useLocation, useNavigate } from "react-router-dom";
import { DailyRoutine } from "./DailyRoutine";
import { DockedMenuButton } from "./DockedMenuButton";

export function MonkeyMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const open = location.pathname === "/daily-routine";

  return (
    <>
      <DockedMenuButton
        emoji="🙈"
        label="Daily Routine"
        offset={-172}
        delay={0.4}
        onClick={() => navigate("/daily-routine")}
      />

      <DailyRoutine open={open} onClose={() => navigate("/")} />
    </>
  );
}
