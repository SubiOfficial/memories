import { PhoneIcon } from "./icons";
import { DockedMenuButton } from "./DockedMenuButton";

const HELP_CALL_NUMBER = "6382922908";

export function CallHelpMenu() {
  return (
    <DockedMenuButton
      emoji={<PhoneIcon className="h-5 w-5" style={{ color: "#34d399" }} />}
      label="Feeling low? Call"
      offset={44}
      delay={0.85}
      onClick={() => {
        window.location.href = `tel:${HELP_CALL_NUMBER}`;
      }}
    />
  );
}
