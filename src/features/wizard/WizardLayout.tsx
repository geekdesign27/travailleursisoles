import type { ReactNode } from "react";

interface WizardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function WizardLayout({ children, sidebar }: WizardLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-6">
      {/* Wizard content — 65% on desktop */}
      <main className="w-full max-w-[720px] flex-1 px-6 py-8 lg:px-8">
        {children}
      </main>

      {/* Sidebar — 35% on desktop, hidden on mobile */}
      {sidebar && (
        <aside
          className="hidden w-[35%] min-w-[320px] max-w-[400px] border-l border-border bg-muted/30 p-6 lg:block"
          role="complementary"
          aria-label="Résumé de l'analyse"
        >
          {sidebar}
        </aside>
      )}
    </div>
  );
}
