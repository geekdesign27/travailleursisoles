import { cn } from "@/lib/utils";
import {
  SUVA_MATRIX,
  type GravityLevel,
  type ProbabilityLevel,
  type ZoneRisque,
} from "@/constants/suvaMatrix";
import { GRAVITY_LEVELS } from "@/constants/gravityLevels";
import { PROBABILITY_LEVELS } from "@/constants/probabilityLevels";

interface RiskMatrixProps {
  gravity?: GravityLevel;
  probability?: ProbabilityLevel;
  variant?: "full" | "compact";
}

const ZONE_BG: Record<string, string> = {
  "1": "bg-suva-zone-1 text-white",
  "2": "bg-suva-zone-2 text-foreground",
  "3a": "bg-suva-zone-3 text-foreground",
  "3b": "bg-suva-zone-3 text-foreground",
  "4": "bg-suva-zone-4 text-foreground",
};

const gravityLevels: GravityLevel[] = ["V", "IV", "III", "II", "I"];
const probabilityLevels: ProbabilityLevel[] = ["A", "B", "C", "D", "E"];

function getZoneLabel(zone: ZoneRisque): string {
  return String(zone);
}

export function RiskMatrix({
  gravity,
  probability,
  variant = "full",
}: RiskMatrixProps) {
  const isCompact = variant === "compact";

  return (
    <div className="space-y-3">
      <div
        role="grid"
        aria-label="Matrice de risque SUVA 5×5"
        className="overflow-x-auto"
      >
        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              {/* Top-left corner */}
              <th
                className="border border-border bg-muted/50 p-1"
                aria-hidden="true"
              >
                {!isCompact && (
                  <span className="text-[10px] text-muted-foreground">
                    G \ P
                  </span>
                )}
              </th>
              {probabilityLevels.map((p) => (
                <th
                  key={p}
                  className={cn(
                    "border border-border bg-muted/50 p-1 font-medium",
                    isCompact ? "w-10" : "w-14",
                  )}
                >
                  <div>{p}</div>
                  {!isCompact && (
                    <div className="text-[10px] font-normal text-muted-foreground">
                      {PROBABILITY_LEVELS.find((pl) => pl.level === p)?.label}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gravityLevels.map((g) => (
              <tr key={g}>
                <th
                  className={cn(
                    "border border-border bg-muted/50 p-1 font-medium",
                    isCompact ? "h-8" : "h-12",
                  )}
                >
                  <div>{g}</div>
                  {!isCompact && (
                    <div className="text-[10px] font-normal text-muted-foreground">
                      {GRAVITY_LEVELS.find((gl) => gl.level === g)?.label}
                    </div>
                  )}
                </th>
                {probabilityLevels.map((p) => {
                  const zone = SUVA_MATRIX[g][p];
                  const isActive = gravity === g && probability === p;

                  return (
                    <td
                      key={`${g}-${p}`}
                      role="gridcell"
                      aria-selected={isActive}
                      aria-label={`Gravité ${g}, Probabilité ${p}: Zone ${zone}`}
                      className={cn(
                        "border border-border font-semibold transition-all",
                        ZONE_BG[String(zone)],
                        isCompact ? "h-8 w-10 text-xs" : "h-12 w-14 text-sm",
                        isActive &&
                          "ring-3 ring-orange-500 ring-offset-1 ring-offset-background",
                      )}
                    >
                      {getZoneLabel(zone)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend — full variant only */}
      {!isCompact && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-suva-zone-1" />
            Zone 1 — Interdit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-suva-zone-2" />
            Zone 2 — Surveillance directe
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-suva-zone-3" />
            Zone 3 — Contrôle périodique
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-suva-zone-4" />
            Zone 4 — Autorisé
          </span>
        </div>
      )}
    </div>
  );
}
