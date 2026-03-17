import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, BarChart3, Clock, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ONBOARDING_KEY = "app:onboarding-shown";

const LEVELS = [
  {
    icon: Shield,
    title: "Niveau 1",
    subtitle: "Gate réglementaire",
    description:
      "Vérification des interdictions légales (travaux réglementés, personnel mineur).",
  },
  {
    icon: BarChart3,
    title: "Niveau 2",
    subtitle: "Évaluation des risques",
    description:
      "Analyse de la gravité et de la probabilité selon la matrice SUVA.",
  },
  {
    icon: Clock,
    title: "Niveau 3",
    subtitle: "Faisabilité du sauvetage",
    description:
      "Calcul du temps de sauvetage disponible et évaluation des délais de secours.",
  },
  {
    icon: Bell,
    title: "Niveau 4",
    subtitle: "Validation outil d'alerte",
    description:
      "Compatibilité du DATI avec la charge cognitive et les conditions de travail.",
  },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // If already seen, redirect immediately
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY) === "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  function completeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    navigate("/", { replace: true });
  }

  function skipOnboarding() {
    completeOnboarding();
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      {step === 0 && (
        <Card className="w-full max-w-lg text-center">
          <CardContent className="space-y-6 pt-8 pb-8">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-suva-primary/10">
              <Shield className="size-8 text-suva-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              Bienvenue dans Analyse Travailleurs Isolés
            </h1>
            <p className="text-muted-foreground">
              Cet outil vous guide dans l'évaluation des postes de travail isolé
              selon la méthode SUVA 44094.F, en 4 niveaux d'analyse progressifs.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                onClick={() => setStep(1)}
                className="bg-suva-primary text-white hover:bg-suva-primary-hover"
              >
                Voir les étapes
                <ChevronRight className="ml-1 size-4" />
              </Button>
              <button
                onClick={skipOnboarding}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Passer
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="w-full max-w-2xl">
          <CardContent className="space-y-6 pt-8 pb-8">
            <h2 className="text-center text-xl font-bold">
              Les 4 niveaux d'analyse
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {LEVELS.map((level) => {
                const Icon = level.icon;
                return (
                  <div
                    key={level.title}
                    className="rounded-lg border border-border p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-md bg-suva-primary/10">
                        <Icon className="size-5 text-suva-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{level.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {level.description}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                onClick={completeOnboarding}
                className="bg-suva-primary text-white hover:bg-suva-primary-hover"
              >
                Commencer une analyse
                <ChevronRight className="ml-1 size-4" />
              </Button>
              <button
                onClick={skipOnboarding}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Passer
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
