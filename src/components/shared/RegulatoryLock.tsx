import { cn } from "@/lib/utils";
import { Lock, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface RegulatoryLockProps {
  type: "suva_const" | "config";
  variant?: "inline" | "section";
}

const CONFIG_MAP = {
  suva_const: {
    icon: Lock,
    label: "Constante SUVA",
    tooltip: "Valeur réglementaire SUVA — non modifiable",
    badgeClass: "bg-suva-const/15 text-suva-const border-suva-const/30",
    iconClass: "text-suva-const",
  },
  config: {
    icon: Pencil,
    label: "Configurable",
    tooltip: "Ce paramètre est modifiable dans la configuration",
    badgeClass: "bg-suva-success/15 text-suva-success border-suva-success/30",
    iconClass: "text-suva-success",
  },
} as const;

export function RegulatoryLock({
  type,
  variant = "inline",
}: RegulatoryLockProps) {
  const config = CONFIG_MAP[type];
  const Icon = config.icon;

  if (variant === "inline") {
    return (
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "inline-flex cursor-default items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium",
            config.badgeClass,
          )}
          aria-disabled={type === "suva_const"}
          aria-label={config.label}
        >
          <Icon
            className={cn("h-3 w-3", config.iconClass)}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{config.label}</span>
        </TooltipTrigger>
        <TooltipContent>{config.tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  // Section variant — banner style
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "flex w-full cursor-default items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
          config.badgeClass,
          type === "suva_const" && "opacity-80",
        )}
        aria-disabled={type === "suva_const"}
        aria-label={config.label}
      >
        <Icon
          className={cn("h-4 w-4 shrink-0", config.iconClass)}
          aria-hidden="true"
        />
        <span>{config.label}</span>
      </TooltipTrigger>
      <TooltipContent>{config.tooltip}</TooltipContent>
    </Tooltip>
  );
}
