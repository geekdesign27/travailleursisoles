import { useState, useRef, useEffect, useCallback } from "react";
import {
  SUVA_MATRIX,
  type GravityLevel,
  type ProbabilityLevel,
  type ZoneRisque,
} from "@/constants/suvaMatrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// --- Types ---

export interface HeatmapAnalysis {
  id: string;
  titre_activite: string;
  entreprise: string;
  status: string;
  gravity: GravityLevel;
  probability: ProbabilityLevel;
  zone: ZoneRisque;
}

interface RiskHeatmapProps {
  analyses: HeatmapAnalysis[];
  onAnalysisClick?: (id: string) => void;
}

interface PopoverState {
  cellKey: string;
  x: number;
  y: number;
}

// --- Constants ---

const GRAVITY_LABELS: Record<GravityLevel, string> = {
  I: "Légère",
  II: "Moyenne",
  III: "Grave",
  IV: "Très grave",
  V: "Mortelle",
};

const PROBABILITY_LABELS: Record<ProbabilityLevel, string> = {
  A: "Très rare",
  B: "Rare",
  C: "Occasionnel",
  D: "Fréquent",
  E: "Très fréquent",
};

// Vivid zone colors for cell backgrounds
const ZONE_COLORS: Record<string, string> = {
  "1": "#ef4444", // red-500 vivid
  "2": "#f97316", // orange-500
  "3a": "#eab308", // yellow-500
  "3b": "#a3e635", // lime-400
  "4": "#22c55e", // green-500
};

const ZONE_BG: Record<string, string> = {
  "1": "#fca5a5", // red-300
  "2": "#fdba74", // orange-300
  "3a": "#fde047", // yellow-300
  "3b": "#d9f99d", // lime-200
  "4": "#86efac", // green-300
};

// Anthracite for circles
const CIRCLE_FILL = "#1e293b"; // slate-800

const gravityLevels: GravityLevel[] = ["V", "IV", "III", "II", "I"];
const probabilityLevels: ProbabilityLevel[] = ["A", "B", "C", "D", "E"];

const CELL_W = 110;
const CELL_H = 64;
const LABEL_W = 90;
const LABEL_H = 36;
const PADDING = 8;
const MAX_RADIUS = 20;
const MIN_RADIUS = 9;

// --- Helpers ---

function groupByCell(analyses: HeatmapAnalysis[]) {
  const map = new Map<string, HeatmapAnalysis[]>();
  for (const a of analyses) {
    const key = `${a.gravity}-${a.probability}`;
    const list = map.get(key) ?? [];
    list.push(a);
    map.set(key, list);
  }
  return map;
}

// --- Component ---

export function RiskHeatmap({ analyses, onAnalysisClick }: RiskHeatmapProps) {
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const cellMap = groupByCell(analyses);

  const maxCount = Math.max(
    1,
    ...Array.from(cellMap.values()).map((l) => l.length),
  );

  const svgW = LABEL_W + probabilityLevels.length * CELL_W + PADDING;
  const svgH = LABEL_H + gravityLevels.length * CELL_H + PADDING + 24;

  const selectedAnalyses = popover ? (cellMap.get(popover.cellKey) ?? []) : [];

  // Close popover on click outside
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setPopover(null);
    }
  }, []);

  useEffect(() => {
    if (popover) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [popover, handleOutsideClick]);

  function handleCircleClick(cellKey: string, event: React.MouseEvent) {
    if (popover?.cellKey === cellKey) {
      setPopover(null);
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setPopover({
      cellKey,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Matrice de risque — Vue d'ensemble
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mx-auto w-full max-w-[650px]"
            role="img"
            aria-label="Matrice de risque SUVA avec postes analysés"
          >
            {/* Probability headers (columns) */}
            {probabilityLevels.map((p, ci) => {
              const x = LABEL_W + ci * CELL_W + CELL_W / 2;
              return (
                <g key={`ph-${p}`}>
                  <text
                    x={x}
                    y={14}
                    textAnchor="middle"
                    className="fill-foreground text-xs font-semibold"
                    fontSize="12"
                  >
                    {p}
                  </text>
                  <text
                    x={x}
                    y={28}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="9"
                  >
                    {PROBABILITY_LABELS[p]}
                  </text>
                </g>
              );
            })}

            {/* Gravity labels (rows) */}
            {gravityLevels.map((g, ri) => {
              const y = LABEL_H + ri * CELL_H + CELL_H / 2;
              return (
                <g key={`gl-${g}`}>
                  <text
                    x={LABEL_W - 8}
                    y={y - 6}
                    textAnchor="end"
                    className="fill-foreground text-xs font-semibold"
                    fontSize="12"
                  >
                    {g}
                  </text>
                  <text
                    x={LABEL_W - 8}
                    y={y + 8}
                    textAnchor="end"
                    className="fill-muted-foreground"
                    fontSize="9"
                  >
                    {GRAVITY_LABELS[g]}
                  </text>
                </g>
              );
            })}

            {/* Grid cells */}
            {gravityLevels.map((g, ri) =>
              probabilityLevels.map((p, ci) => {
                const zone = SUVA_MATRIX[g][p];
                const zoneStr = String(zone);
                const cellKey = `${g}-${p}`;
                const count = cellMap.get(cellKey)?.length ?? 0;
                const x = LABEL_W + ci * CELL_W;
                const y = LABEL_H + ri * CELL_H;
                const cx = x + CELL_W / 2;
                const cy = y + CELL_H / 2;

                // Radius proportional to count
                const radius =
                  count === 0
                    ? 0
                    : MIN_RADIUS +
                      ((MAX_RADIUS - MIN_RADIUS) * count) / maxCount;

                return (
                  <g key={cellKey}>
                    {/* Cell background */}
                    <rect
                      x={x}
                      y={y}
                      width={CELL_W}
                      height={CELL_H}
                      fill={ZONE_BG[zoneStr]}
                      stroke="#d1d5db"
                      strokeWidth="1"
                      rx="4"
                    />
                    {/* Zone label (subtle) */}
                    <text
                      x={x + 5}
                      y={y + 13}
                      fontSize="10"
                      fill={ZONE_COLORS[zoneStr]}
                      opacity={0.7}
                      fontWeight="600"
                    >
                      {zoneStr}
                    </text>

                    {/* Bubble — anthracite with white text */}
                    {count > 0 && (
                      <g
                        className="cursor-pointer"
                        onClick={(e) => handleCircleClick(cellKey, e)}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius}
                          fill={CIRCLE_FILL}
                          opacity={popover?.cellKey === cellKey ? 1 : 0.85}
                          stroke={
                            popover?.cellKey === cellKey ? "#0ea5e9" : "#475569"
                          }
                          strokeWidth={popover?.cellKey === cellKey ? 2.5 : 1.5}
                          className="transition-all duration-200 hover:opacity-100"
                        />
                        <text
                          x={cx}
                          y={cy + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={radius > 16 ? "13" : "10"}
                          fontWeight="700"
                        >
                          {count}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }),
            )}

            {/* Axis labels */}
            <text
              x={LABEL_W + (probabilityLevels.length * CELL_W) / 2}
              y={LABEL_H + gravityLevels.length * CELL_H + 18}
              textAnchor="middle"
              fontSize="11"
              className="fill-muted-foreground font-medium"
            >
              Probabilité →
            </text>
            <text
              x={12}
              y={LABEL_H + (gravityLevels.length * CELL_H) / 2}
              textAnchor="middle"
              fontSize="11"
              className="fill-muted-foreground font-medium"
              transform={`rotate(-90, 12, ${LABEL_H + (gravityLevels.length * CELL_H) / 2})`}
            >
              Gravité →
            </text>
          </svg>

          {/* Popover positioned near clicked circle */}
          {popover && selectedAnalyses.length > 0 && (
            <div
              ref={popoverRef}
              className="absolute z-50 w-72 rounded-lg border border-border bg-popover p-3 shadow-lg"
              style={{
                left: `${popover.x}px`,
                top: `${popover.y + 12}px`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {selectedAnalyses.length} poste
                  {selectedAnalyses.length > 1 ? "s" : ""} — G
                  {popover.cellKey.split("-")[0]} / P
                  {popover.cellKey.split("-")[1]}
                </span>
                <button
                  onClick={() => setPopover(null)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedAnalyses.map((a) => (
                  <li key={a.id}>
                    <button
                      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                      onClick={() => onAnalysisClick?.(a.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {a.titre_activite}
                        </span>
                        <span className="block truncate text-muted-foreground">
                          {a.entreprise}
                        </span>
                      </div>
                      <Badge
                        variant={
                          a.status === "completed"
                            ? "secondary"
                            : a.status === "in_progress"
                              ? "default"
                              : "outline"
                        }
                        className="ml-2 shrink-0"
                      >
                        {a.status === "completed"
                          ? "Terminée"
                          : a.status === "in_progress"
                            ? "En cours"
                            : "Brouillon"}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          {[
            { zone: "1", label: "Zone 1 — Interdit" },
            { zone: "2", label: "Zone 2 — Surveillance" },
            { zone: "3a", label: "Zone 3 — Contrôle" },
            { zone: "4", label: "Zone 4 — Autorisé" },
          ].map((item) => (
            <span key={item.zone} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: ZONE_COLORS[item.zone] }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
