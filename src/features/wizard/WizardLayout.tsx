import type { ReactNode } from "react";
import {
  WizardStepper,
  type WizardStep,
} from "@/components/shared/WizardStepper";
import {
  WizardSidebar,
  WizardSidebarTabletToggle,
  WizardSidebarMobileFab,
} from "@/features/wizard/WizardSidebar";
import { useAutoSave } from "@/features/persistence/useAutoSave";

interface WizardLayoutProps {
  children: ReactNode;
  currentStep: number;
  onStepClick?: (step: WizardStep) => void;
}

export function WizardLayout({
  children,
  currentStep,
  onStepClick,
}: WizardLayoutProps) {
  // Auto-save analysis on timer and step change
  useAutoSave();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Wizard stepper — responsive */}
      <WizardStepper currentStep={currentStep} onStepClick={onStepClick} />

      <div className="flex flex-1 gap-6">
        {/* Wizard content — 65% on desktop */}
        <main className="w-full max-w-[720px] flex-1 px-6 py-8 lg:px-8">
          {children}
        </main>

        {/* Sidebar — 35% on desktop, hidden below lg */}
        <aside
          className="hidden w-[35%] min-w-[320px] max-w-[400px] border-l border-border bg-muted/30 p-6 lg:block"
          role="complementary"
          aria-label="Résumé de l'analyse"
        >
          <div className="sticky top-4">
            <WizardSidebar currentStep={currentStep} />
          </div>
        </aside>
      </div>

      {/* Tablet toggle — Sheet from right (md only) */}
      <WizardSidebarTabletToggle currentStep={currentStep} />

      {/* Mobile FAB — Sheet from bottom (<md) */}
      <WizardSidebarMobileFab currentStep={currentStep} />
    </div>
  );
}
