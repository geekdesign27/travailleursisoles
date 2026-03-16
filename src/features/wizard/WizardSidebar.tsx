import { useState } from "react";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import { WIZARD_STEPS } from "@/components/shared/WizardStepper";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ZoneRisque } from "@/constants/suvaMatrix";

interface SidebarContentProps {
  currentStep: number;
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-muted">
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function SidebarContent({ currentStep }: SidebarContentProps) {
  const { state } = useAnalysis();
  const analysis = state.current;

  const completedSteps = Math.max(0, currentStep - 1);
  const totalSteps = WIZARD_STEPS.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const zone: ZoneRisque | null = analysis?.level2Result?.zone ?? null;
  const gravity = analysis?.level2Result?.gravity ?? null;
  const probability = analysis?.level2Result?.probability ?? null;
  const tmax = analysis?.level3Result?.tmaxResult?.tmax ?? null;
  const cognitiveLoad = analysis?.level4Result?.cognitiveLoad ?? null;
  const measures = analysis?.level4Result?.validationResult?.measures ?? [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Résumé de l'analyse</h3>

      {/* Identification */}
      <CollapsibleSection title="Identification">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Entreprise</dt>
            <dd className="max-w-[60%] truncate text-right font-medium">
              {analysis?.entreprise || "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Activité</dt>
            <dd className="max-w-[60%] truncate text-right font-medium">
              {analysis?.titre_activite || "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Période</dt>
            <dd className="font-medium capitalize">
              {analysis?.periode_travail || "—"}
            </dd>
          </div>
        </dl>
      </CollapsibleSection>

      {/* Zone actuelle */}
      <CollapsibleSection title="Zone actuelle">
        <div aria-live="polite" aria-atomic="true" className="py-1">
          {zone ? (
            <ZoneBadge zone={zone} variant="prominent" />
          ) : (
            <p className="text-sm text-muted-foreground">
              Pas encore déterminée
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Mesures requises */}
      {measures.length > 0 && (
        <CollapsibleSection title="Mesures requises">
          <ul className="space-y-1 text-sm">
            {measures.map((measure, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-suva-warning"
                  aria-hidden="true"
                />
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Scores intermédiaires */}
      <CollapsibleSection title="Scores intermédiaires" defaultOpen={false}>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gravité</dt>
            <dd className="font-medium">{gravity ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Probabilité</dt>
            <dd className="font-medium">{probability ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">T_max</dt>
            <dd className="font-medium">
              {tmax !== null ? `${tmax} min` : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Charge cognitive</dt>
            <dd className="font-medium">{cognitiveLoad ?? "—"}</dd>
          </div>
        </dl>
      </CollapsibleSection>

      {/* Progression */}
      <div className="space-y-2 pt-2">
        <Progress value={progressPercent}>
          <ProgressLabel>Progression</ProgressLabel>
          <ProgressValue>
            {() => `${completedSteps}/${totalSteps}`}
          </ProgressValue>
        </Progress>
      </div>
    </div>
  );
}

interface WizardSidebarProps {
  currentStep: number;
}

/**
 * Desktop sidebar — rendered inline via WizardLayout aside slot.
 * This component also manages responsive Sheet drawers for tablet/mobile.
 */
export function WizardSidebar({ currentStep }: WizardSidebarProps) {
  return <SidebarContent currentStep={currentStep} />;
}

/**
 * Tablet toggle button — shows Sheet drawer from right.
 * Visible on md screens (768-1023px).
 */
export function WizardSidebarTabletToggle({ currentStep }: WizardSidebarProps) {
  const { state } = useAnalysis();
  const zone: ZoneRisque | null = state.current?.level2Result?.zone ?? null;

  return (
    <div className="fixed right-4 top-20 z-40 hidden md:block lg:hidden">
      <Sheet>
        <SheetTrigger
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-md",
            "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Ouvrir le résumé de l'analyse"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          {zone && <ZoneBadge zone={zone} variant="inline" />}
          {!zone && <span>Résumé</span>}
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[350px] overflow-y-auto p-6 sm:max-w-[400px]"
        >
          <SheetHeader>
            <SheetTitle>Résumé de l'analyse</SheetTitle>
            <SheetDescription>
              Suivi en temps réel de votre progression
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <SidebarContent currentStep={currentStep} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/**
 * Mobile FAB — shows Sheet drawer from bottom.
 * Visible on sm screens (<768px).
 */
export function WizardSidebarMobileFab({ currentStep }: WizardSidebarProps) {
  const { state } = useAnalysis();
  const zone: ZoneRisque | null = state.current?.level2Result?.zone ?? null;

  return (
    <div className="fixed bottom-4 right-4 z-40 md:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-suva-primary text-white shadow-lg hover:bg-suva-primary-hover"
              aria-label="Ouvrir le résumé de l'analyse"
            />
          }
        >
          {zone ? (
            <span className="text-xs font-bold">Z{String(zone)}</span>
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[80vh] overflow-y-auto rounded-t-xl p-6"
        >
          <SheetHeader>
            <SheetTitle>Résumé de l'analyse</SheetTitle>
            <SheetDescription>
              Suivi en temps réel de votre progression
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <SidebarContent currentStep={currentStep} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
