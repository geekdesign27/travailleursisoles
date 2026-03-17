import { useState } from "react";
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

const ZONE_COLORS: Record<string, string> = {
  "1": "#dc2626", // red-600
  "2": "#f97316", // orange-500
  "3a": "#eab308", // yellow-500
  "3b": "#facc15", // yellow-400
  "4": "#22c55e", // green-500
};

const ZONE_BG_LIGHT: Record<string, string> = {
  "1": "#fef2f2", // red-50
  "2": "#fff7ed", // orange-50
  "3a": "#fefce8", // yellow-50
  "3b": "#fefce8", // yellow-50
  "4": "#f0fdf4", // green-50
};

const gravityLevels: GravityLevel[] = ["V", "IV", "III", "II", "I"];
const probabilityLevels: ProbabilityLevel[] = ["A", "B", "C", "D", "E"];

const CELL_SIZE = 80;
const LABEL_W = 90;
const LABEL_H = 36;
const PADDING = 8;
const MAX_RADIUS = 30;
const MIN_RADIUS = 12;

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
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const cellMap = groupByCell(analyses);

  const maxCount = Math.max(
    1,
    ...Array.from(cellMap.values()).map((l) => l.length),
  );

  const svgW = LABEL_W + probabilityLevels.length * CELL_SIZE + PADDING;
  const svgH = LABEL_H + gravityLevels.length * CELL_SIZE + PADDING + 30; // 30 for bottom label

  const selectedAnalyses = selectedCell
    ? (cellMap.get(selectedCell) ?? [])
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Matrice de risque — Vue d'ensemble
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mx-auto w-full max-w-[550px]"
            role="img"
            aria-label="Matrice de risque SUVA avec postes analysés"
          >
            {/* Probability headers (columns) */}
            {probabilityLevels.map((p, ci) => {
              const x = LABEL_W + ci * CELL_SIZE + CELL_SIZE / 2;
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
              const y = LABEL_H + ri * CELL_SIZE + CELL_SIZE / 2;
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
                const x = LABEL_W + ci * CELL_SIZE;
                const y = LABEL_H + ri * CELL_SIZE;
                const cx = x + CELL_SIZE / 2;
                const cy = y + CELL_SIZE / 2;
                const isSelected = selectedCell === cellKey;

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
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={ZONE_BG_LIGHT[zoneStr]}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      rx="4"
                    />
                    {/* Zone label (subtle) */}
                    <text
                      x={x + 6}
                      y={y + 14}
                      fontSize="10"
                      className="fill-muted-foreground/50"
                    >
                      {zoneStr}
                    </text>

                    {/* Bubble */}
                    {count > 0 && (
                      <g
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedCell(isSelected ? null : cellKey)
                        }
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius}
                          fill={ZONE_COLORS[zoneStr]}
                          opacity={isSelected ? 1 : 0.75}
                          stroke={isSelected ? "#1e293b" : "white"}
                          strokeWidth={isSelected ? 2.5 : 2}
                          className="transition-all duration-200 hover:opacity-100"
                        />
                        <text
                          x={cx}
                          y={cy + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={radius > 20 ? "14" : "11"}
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
              x={LABEL_W + (probabilityLevels.length * CELL_SIZE) / 2}
              y={LABEL_H + gravityLevels.length * CELL_SIZE + 22}
              textAnchor="middle"
              fontSize="11"
              className="fill-muted-foreground font-medium"
            >
              Probabilité →
            </text>
            <text
              x={12}
              y={LABEL_H + (gravityLevels.length * CELL_SIZE) / 2}
              textAnchor="middle"
              fontSize="11"
              className="fill-muted-foreground font-medium"
              transform={`rotate(-90, 12, ${LABEL_H + (gravityLevels.length * CELL_SIZE) / 2})`}
            >
              Gravité →
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
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

        {/* Selected cell detail panel */}
        {selectedCell && selectedAnalyses.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {selectedAnalyses.length} poste
                {selectedAnalyses.length > 1 ? "s" : ""} — Gravité{" "}
                {selectedCell.split("-")[0]}, Probabilité{" "}
                {selectedCell.split("-")[1]}
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {selectedAnalyses.map((a) => (
                <li key={a.id}>
                  <button
                    className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => onAnalysisClick?.(a.id)}
                  >
                    <div>
                      <span className="font-medium">{a.titre_activite}</span>
                      <span className="ml-2 text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
