import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAnalysis } from "@/contexts/AnalysisContext";
import {
  listAnalyses,
  loadAnalysis,
  type AnalysisIndexEntry,
} from "@/features/persistence/localStorageService";

// Map currentStep to route segments
const STEP_ROUTES: Record<number, string> = {
  1: "",
  2: "/level-1",
  3: "/level-2",
  4: "/level-3",
  5: "/level-4",
  6: "/level-5",
  7: "/finalisation",
};

export interface ResumableAnalysis {
  id: string;
  titre_activite: string;
  updatedAt: string;
}

export interface AnalysisResumeResult {
  /** Draft/in-progress analysis available for resume, if any */
  resumable: ResumableAnalysis | null;
  /** Resume the analysis: load into context and navigate to last step */
  resume: () => void;
  /** Dismiss the resume prompt for this session */
  dismiss: () => void;
}

/**
 * On mount, checks localStorage for a draft/in_progress analysis.
 * Returns resume info and actions. Only triggers once per session.
 */
export function useAnalysisResume(): AnalysisResumeResult {
  const { dispatch } = useAnalysis();
  const navigate = useNavigate();
  const hasCheckedRef = useRef(false);
  const [resumable, setResumable] = useState<ResumableAnalysis | null>(null);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const entries = listAnalyses();
    const candidate = findResumableEntry(entries);
    if (candidate) {
      setResumable({
        id: candidate.id,
        titre_activite: candidate.titre_activite,
        updatedAt: candidate.updatedAt,
      });
    }
  }, []);

  const resume = () => {
    if (!resumable) return;
    const analysis = loadAnalysis(resumable.id);
    if (!analysis) {
      setResumable(null);
      return;
    }
    dispatch({ type: "analysis/LOAD", payload: analysis });
    const route = STEP_ROUTES[analysis.currentStep] ?? "";
    navigate(`/analysis/${analysis.id}${route}`);
    setResumable(null);
  };

  const dismiss = () => {
    setResumable(null);
  };

  return { resumable, resume, dismiss };
}

/**
 * Find the most recently updated draft or in_progress analysis.
 */
function findResumableEntry(
  entries: AnalysisIndexEntry[],
): AnalysisIndexEntry | null {
  const resumableEntries = entries.filter(
    (e) => e.status === "draft" || e.status === "in_progress",
  );
  if (resumableEntries.length === 0) return null;

  // Sort by updatedAt descending, pick the most recent
  resumableEntries.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return resumableEntries[0];
}
