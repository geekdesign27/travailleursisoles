import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router";
import { useCallback } from "react";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { GoogleSheetsProvider } from "@/contexts/GoogleSheetsContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/shared/AppLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { WizardLayout } from "@/features/wizard/WizardLayout";
import type { WizardStep } from "@/components/shared/WizardStepper";
import { Step01Identification } from "@/features/wizard/steps/Step01Identification";
import { Step02Level1Gate } from "@/features/wizard/steps/Step02Level1Gate";
import { Step03Level2Risk } from "@/features/wizard/steps/Step03Level2Risk";
import { Step04Level3Rescue } from "@/features/wizard/steps/Step04Level3Rescue";
import { Step05Level4Alert } from "@/features/wizard/steps/Step05Level4Alert";
import { Step06Documentation } from "@/features/wizard/steps/Step06Documentation";
import { Step07Finalisation } from "@/features/wizard/steps/Step07Finalisation";
import { ReportPage } from "@/features/report/ReportPage";
import { ConfigPage } from "@/features/config/ConfigPage";
import { OnboardingPage } from "@/features/help/OnboardingPage";

// Map step IDs to route segments
const STEP_ROUTES: Record<number, string> = {
  1: "",
  2: "/level-1",
  3: "/level-2",
  4: "/level-3",
  5: "/level-4",
  6: "/level-5",
  7: "/finalisation",
};

function useStepNavigation() {
  const navigate = useNavigate();
  const { id } = useParams();

  const onStepClick = useCallback(
    (step: WizardStep) => {
      const basePath = id ? `/analysis/${id}` : "/analysis/new";
      const route = STEP_ROUTES[step.id] ?? "";
      navigate(`${basePath}${route}`);
    },
    [navigate, id],
  );

  return onStepClick;
}

function WizardNewAnalysis() {
  const onStepClick = useStepNavigation();
  return (
    <WizardLayout currentStep={1} onStepClick={onStepClick}>
      <Step01Identification />
    </WizardLayout>
  );
}

function WizardLevel1() {
  const onStepClick = useStepNavigation();
  return (
    <WizardLayout currentStep={2} onStepClick={onStepClick}>
      <Step02Level1Gate />
    </WizardLayout>
  );
}

function WizardLevel2() {
  const onStepClick = useStepNavigation();
  return (
    <WizardLayout currentStep={3} onStepClick={onStepClick}>
      <Step03Level2Risk />
    </WizardLayout>
  );
}

function WizardLevel3() {
  const onStepClick = useStepNavigation();
  return (
    <WizardLayout currentStep={4} onStepClick={onStepClick}>
      <Step04Level3Rescue />
    </WizardLayout>
  );
}

function WizardLevel4() {
  const onStepClick = useStepNavigation();
  return (
    <WizardLayout currentStep={5} onStepClick={onStepClick}>
      <Step05Level4Alert />
    </WizardLayout>
  );
}

function WizardDocumentation() {
  const onStepClick = useStepNavigation();
  return (
    <WizardLayout currentStep={6} onStepClick={onStepClick}>
      <Step06Documentation />
    </WizardLayout>
  );
}

function WizardFinalisation() {
  const onStepClick = useStepNavigation();
  return (
    <WizardLayout currentStep={7} onStepClick={onStepClick}>
      <Step07Finalisation />
    </WizardLayout>
  );
}

// Placeholder for future story pages
function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-4 text-muted-foreground">
        Cette page sera implémentée dans une story ultérieure.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <GoogleSheetsProvider>
        <AnalysisProvider>
          <TooltipProvider>
            <BrowserRouter basename="/travailleursisoles">
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/analysis/new" element={<WizardNewAnalysis />} />
                  <Route
                    path="/analysis/:id"
                    element={<PlaceholderPage title="Résumé de l'analyse" />}
                  />
                  <Route
                    path="/analysis/:id/level-1"
                    element={<WizardLevel1 />}
                  />
                  <Route
                    path="/analysis/:id/level-2"
                    element={<WizardLevel2 />}
                  />
                  <Route
                    path="/analysis/:id/level-3"
                    element={<WizardLevel3 />}
                  />
                  <Route
                    path="/analysis/:id/level-4"
                    element={<WizardLevel4 />}
                  />
                  <Route
                    path="/analysis/:id/level-5"
                    element={<WizardDocumentation />}
                  />
                  <Route
                    path="/analysis/:id/finalisation"
                    element={<WizardFinalisation />}
                  />
                  <Route
                    path="/analysis/:id/level-:level"
                    element={<PlaceholderPage title="Wizard — Niveau" />}
                  />
                  <Route path="/analysis/:id/report" element={<ReportPage />} />
                  <Route path="/config" element={<ConfigPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AnalysisProvider>
      </GoogleSheetsProvider>
    </ConfigProvider>
  );
}
