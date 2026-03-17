// Hook to fetch analyses from connected Google Sheet

import { useState, useEffect } from "react";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";
import { fetchAnalyses } from "./sheetsService";
import type { Analysis } from "@/types/analysis.schema";

interface UseSheetAnalysesResult {
  sheetAnalyses: Analysis[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSheetAnalyses(): UseSheetAnalysesResult {
  const { state } = useGoogleSheets();
  const [sheetAnalyses, setSheetAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    if (!state.configured || !state.spreadsheetId) {
      setSheetAnalyses([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAnalyses(state.spreadsheetId)
      .then((analyses) => {
        if (!cancelled) setSheetAnalyses(analyses);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : "Erreur de lecture Google Sheets.",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state.configured, state.spreadsheetId, fetchCount]);

  const refetch = () => setFetchCount((c) => c + 1);

  return { sheetAnalyses, isLoading, error, refetch };
}
