import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { saveAnalysis } from "@/features/persistence/localStorageService";

const AUTO_SAVE_INTERVAL_MS = 30_000;

/**
 * Auto-saves the current analysis every 30s (if dirty) and on step change.
 * Must be used within AnalysisProvider and a Router context.
 */
export function useAutoSave(): void {
  const { state, dispatch } = useAnalysis();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // Persist on interval (every 30s) if analysis exists and has changed
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!state.current || !state.isDirty) return;
      performSave(state.current);
      dispatch({ type: "analysis/MARK_SAVED" });
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [state, dispatch]);

  // Persist on step change (route change)
  useEffect(() => {
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    if (!state.current || !state.isDirty) return;
    performSave(state.current);
    dispatch({ type: "analysis/MARK_SAVED" });
  }, [location.pathname, state, dispatch]);
}

function performSave(
  analysis: import("@/types/analysis.schema").Analysis,
): void {
  try {
    const result = saveAnalysis(analysis);
    if (result.ok) {
      toast.success("Brouillon enregistré", { duration: 2000 });
    } else {
      toast.error(result.error ?? "Erreur de sauvegarde", { duration: 4000 });
    }
  } catch {
    // Non-blocking: silently ignore unexpected errors
  }
}
