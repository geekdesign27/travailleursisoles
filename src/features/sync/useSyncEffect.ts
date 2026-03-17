// Automatic sync effect — processes queue periodically and on reconnect

import { useEffect, useRef } from "react";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";
import { getAccessToken } from "@/features/sync/googleAuth";
import { processQueue, getQueueSize } from "./syncQueue";
import { toast } from "sonner";

const SYNC_INTERVAL_MS = 30_000; // 30 seconds

export function useSyncEffect(): void {
  const { state, dispatchSync } = useGoogleSheets();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSync = async () => {
    const token = getAccessToken();
    if (!token || !state.spreadsheetId) return;
    if (getQueueSize() === 0) return;

    dispatchSync({ type: "SYNC_START" });
    try {
      const result = await processQueue(token, state.spreadsheetId);
      if (result.processed > 0) {
        dispatchSync({ type: "SYNC_SUCCESS" });
        toast.success(`${result.processed} analyse(s) synchronisée(s).`);
      } else {
        dispatchSync({ type: "SYNC_SUCCESS" });
      }
      if (result.failed > 0) {
        toast.warning(
          `${result.failed} opération(s) en erreur, nouvelle tentative prévue.`,
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de synchronisation.";
      dispatchSync({ type: "SYNC_ERROR", payload: message });
      toast.error(message);
    }
  };

  // Periodic sync
  useEffect(() => {
    if (!state.auth.isAuthenticated || !state.spreadsheetId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Run immediately on connect
    runSync();

    intervalRef.current = setInterval(runSync, SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.auth.isAuthenticated, state.spreadsheetId]);

  // Sync on coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (state.auth.isAuthenticated && state.spreadsheetId) {
        runSync();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.auth.isAuthenticated, state.spreadsheetId]);
}
