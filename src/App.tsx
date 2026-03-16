import { BrowserRouter, Routes, Route } from "react-router";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { AppLayout } from "@/components/shared/AppLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { WizardLayout } from "@/features/wizard/WizardLayout";
import { WizardSidebar } from "@/features/wizard/WizardSidebar";
import { Step01Identification } from "@/features/wizard/steps/Step01Identification";
import { Step02Level1Gate } from "@/features/wizard/steps/Step02Level1Gate";
import { Step03Level2Risk } from "@/features/wizard/steps/Step03Level2Risk";

function WizardNewAnalysis() {
  return (
    <WizardLayout sidebar={<WizardSidebar />}>
      <Step01Identification />
    </WizardLayout>
  );
}

function WizardLevel1() {
  return (
    <WizardLayout sidebar={<WizardSidebar />}>
      <Step02Level1Gate />
    </WizardLayout>
  );
}

function WizardLevel2() {
  return (
    <WizardLayout sidebar={<WizardSidebar />}>
      <Step03Level2Risk />
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
    <AnalysisProvider>
      <BrowserRouter basename="/travailleursisoles">
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analysis/new" element={<WizardNewAnalysis />} />
            <Route
              path="/analysis/:id"
              element={<PlaceholderPage title="Résumé de l'analyse" />}
            />
            <Route path="/analysis/:id/level-1" element={<WizardLevel1 />} />
            <Route path="/analysis/:id/level-2" element={<WizardLevel2 />} />
            <Route
              path="/analysis/:id/level-:level"
              element={<PlaceholderPage title="Wizard — Niveau" />}
            />
            <Route
              path="/analysis/:id/report"
              element={<PlaceholderPage title="Rapport" />}
            />
            <Route
              path="/config"
              element={<PlaceholderPage title="Configuration" />}
            />
            <Route
              path="/onboarding"
              element={<PlaceholderPage title="Onboarding" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AnalysisProvider>
  );
}
