import { cn } from "@/lib/utils";
import type { ZoneRisque } from "@/constants/suvaMatrix";

interface ZoneBadgeProps {
  zone: ZoneRisque;
  variant?: "inline" | "prominent" | "report";
}

const ZONE_CONFIG: Record<string, { bg: string; text: string; label: string }> =
  {
    "1": {
      bg: "bg-suva-zone-1",
      text: "text-white",
      label: "Zone 1 — Danger élevé",
    },
    "2": {
      bg: "bg-suva-zone-2",
      text: "text-foreground",
      label: "Zone 2 — Mesures nécessaires",
    },
    "3a": {
      bg: "bg-suva-zone-3",
      text: "text-foreground",
      label: "Zone 3a — Surveillance renforcée",
    },
    "3b": {
      bg: "bg-suva-zone-3",
      text: "text-foreground",
      label: "Zone 3b — Surveillance renforcée",
    },
    "4": {
      bg: "bg-suva-zone-4",
      text: "text-foreground",
      label: "Zone 4 — Autorisé",
    },
  };

export function ZoneBadge({ zone, variant = "inline" }: ZoneBadgeProps) {
  const config = ZONE_CONFIG[String(zone)];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold",
        config.bg,
        config.text,
        variant === "inline" && "px-2 py-0.5 text-xs",
        variant === "prominent" && "px-4 py-2 text-sm",
        variant === "report" && "px-3 py-1 text-sm",
      )}
      aria-label={config.label}
      role="status"
    >
      {config.label}
    </span>
  );
}
