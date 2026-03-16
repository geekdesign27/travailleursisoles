import { Link, Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-2 focus:ring-suva-primary focus:ring-offset-2"
      >
        Aller au contenu principal
      </a>

      <header className="border-b border-border bg-background">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
          aria-label="Navigation principale"
        >
          <Link to="/" className="text-lg font-semibold text-foreground">
            SUVA 44094.F
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <Toaster />
    </div>
  );
}
