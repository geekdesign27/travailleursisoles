import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

export interface WizardStep {
  id: number;
  label: string;
  shortLabel?: string;
  level?: number;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, label: "Identification", shortLabel: "ID", level: 0 },
  { id: 2, label: "Niveau 1 — Gate", shortLabel: "N1", level: 1 },
  { id: 3, label: "Niveau 2 — Risques", shortLabel: "N2", level: 2 },
  { id: 4, label: "Niveau 3 — Sauvetage", shortLabel: "N3", level: 3 },
  { id: 5, label: "Niveau 4 — Alerte", shortLabel: "N4", level: 4 },
  { id: 6, label: "Documentation", shortLabel: "Doc", level: 0 },
  { id: 7, label: "Finalisation", shortLabel: "Fin", level: 0 },
];

type StepState = "completed" | "active" | "upcoming";

function getStepState(stepId: number, currentStep: number): StepState {
  if (stepId < currentStep) return "completed";
  if (stepId === currentStep) return "active";
  return "upcoming";
}

interface WizardStepperProps {
  currentStep: number;
  onStepClick?: (step: WizardStep) => void;
}

/**
 * Horizontal variant — visible on lg screens
 */
function HorizontalStepper({ currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div className="hidden lg:block">
      <ol className="flex items-center gap-0">
        {WIZARD_STEPS.map((step, index) => {
          const state = getStepState(step.id, currentStep);
          const isLast = index === WIZARD_STEPS.length - 1;

          return (
            <li
              key={step.id}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <button
                type="button"
                onClick={() => state === "completed" && onStepClick?.(step)}
                disabled={state === "upcoming"}
                aria-current={state === "active" ? "step" : undefined}
                aria-disabled={state === "upcoming"}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  state === "completed" &&
                    "cursor-pointer text-suva-success hover:text-suva-success/80",
                  state === "active" && "cursor-default text-suva-primary",
                  state === "upcoming" &&
                    "cursor-not-allowed text-muted-foreground opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                    state === "completed" &&
                      "border-suva-success bg-suva-success text-white",
                    state === "active" &&
                      "border-suva-primary bg-suva-primary/10 text-suva-primary",
                    state === "upcoming" &&
                      "border-muted-foreground/40 bg-transparent text-muted-foreground",
                  )}
                >
                  {state === "completed" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : state === "active" ? (
                    <Circle
                      className="h-3 w-3 fill-current"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="text-xs">{step.id}</span>
                  )}
                </span>
                <span className="hidden xl:inline">{step.label}</span>
              </button>

              {!isLast && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    state === "completed"
                      ? "bg-suva-success"
                      : "bg-muted-foreground/20",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Compact variant — visible on md screens (hidden on sm and lg+)
 */
function CompactStepper({ currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div className="hidden md:block lg:hidden">
      <ol className="flex items-center justify-center gap-1">
        {WIZARD_STEPS.map((step) => {
          const state = getStepState(step.id, currentStep);

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => state === "completed" && onStepClick?.(step)}
                disabled={state === "upcoming"}
                aria-current={state === "active" ? "step" : undefined}
                aria-disabled={state === "upcoming"}
                aria-label={`${step.label}${state === "completed" ? " (terminé)" : state === "active" ? " (en cours)" : ""}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  state === "completed" &&
                    "cursor-pointer border-suva-success bg-suva-success text-white",
                  state === "active" &&
                    "border-suva-primary bg-suva-primary/10 text-suva-primary",
                  state === "upcoming" &&
                    "cursor-not-allowed border-muted-foreground/40 text-muted-foreground opacity-50",
                )}
              >
                {state === "completed" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  step.shortLabel
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Textual variant — visible on small screens only
 */
function TextualStepper({ currentStep }: { currentStep: number }) {
  const step = WIZARD_STEPS.find((s) => s.id === currentStep);
  const label = step?.label ?? "Inconnu";

  return (
    <div className="block md:hidden">
      <p className="text-center text-sm font-medium text-foreground">
        <span className="text-suva-primary">
          Étape {currentStep}/{WIZARD_STEPS.length}
        </span>
        {" — "}
        <span>{label}</span>
      </p>
    </div>
  );
}

export function WizardStepper({
  currentStep,
  onStepClick,
}: WizardStepperProps) {
  return (
    <nav
      role="navigation"
      aria-label="Progression du wizard"
      className="w-full border-b border-border bg-background px-4 py-3"
    >
      <HorizontalStepper currentStep={currentStep} onStepClick={onStepClick} />
      <CompactStepper currentStep={currentStep} onStepClick={onStepClick} />
      <TextualStepper currentStep={currentStep} />
    </nav>
  );
}
