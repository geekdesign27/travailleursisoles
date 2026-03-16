import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ZoneBadge } from "./ZoneBadge";
import type { ZoneRisque } from "@/constants/suvaMatrix";

interface GateAlertProps {
  type: "blocking" | "warning" | "info";
  title: string;
  message: string;
  reference?: string;
  zone?: ZoneRisque;
}

const ALERT_STYLES: Record<string, string> = {
  blocking: "border-suva-error/30 bg-suva-error/10 text-foreground",
  warning: "border-suva-warning/30 bg-suva-warning/10 text-foreground",
  info: "border-suva-info/30 bg-suva-info/10 text-foreground",
};

export function GateAlert({
  type,
  title,
  message,
  reference,
  zone,
}: GateAlertProps) {
  const alertRef = useRef<HTMLDivElement>(null);

  // Auto-focus blocking alerts on mount for accessibility
  useEffect(() => {
    if (type === "blocking" && alertRef.current) {
      alertRef.current.focus();
    }
  }, [type]);

  return (
    <div
      ref={alertRef}
      role={type === "blocking" ? "alert" : "status"}
      tabIndex={type === "blocking" ? -1 : undefined}
      className={cn("rounded-lg border p-4", ALERT_STYLES[type])}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {zone !== undefined && <ZoneBadge zone={zone} variant="inline" />}
          </div>
          <p className="text-sm">{message}</p>
          {reference && (
            <p className="text-xs text-muted-foreground">
              Référence : {reference}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
