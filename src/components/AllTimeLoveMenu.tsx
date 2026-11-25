import { useLocation, useNavigate } from "react-router-dom";
import { AllTimeLove } from "./AllTimeLove";
import { DockedMenuButton } from "./DockedMenuButton";

export function AllTimeLoveMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const open = location.pathname === "/all-time-love";

  return (
    <>
      <DockedMenuButton
        emoji="💞"
        label="All Time Love"
        offset={-28}
        delay={0.7}
        onClick={() => navigate("/all-time-love")}
      />

      <AllTimeLove open={open} onClose={() => navigate("/")} />
    </>
  );
}
