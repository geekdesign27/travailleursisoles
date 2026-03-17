import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import {
  isConfigured,
  isAuthenticated,
  getServiceAccountEmail,
} from "@/features/sync/googleAuth";
import {
  createSpreadsheetStructure,
  parseSpreadsheetId,
} from "@/features/sync/sheetsService";
import { toast } from "sonner";

type SyncStatus = "idle" | "syncing" | "success" | "error";

interface GoogleSheetsState {
  /** Whether SA credentials are present in env vars */
  configured: boolean;
  /** SA email for sharing sheets */
  serviceAccountEmail: string | null;
  spreadsheetId: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
}

type GoogleSheetsAction =
  | { type: "SET_SPREADSHEET"; payload: string }
  | { type: "CLEAR_SPREADSHEET" }
  | { type: "SYNC_START" }
  | { type: "SYNC_SUCCESS" }
  | { type: "SYNC_ERROR"; payload: string };

const SPREADSHEET_KEY = "app:google-sheets-id";

function loadSpreadsheetId(): string | null {
  try {
    return localStorage.getItem(SPREADSHEET_KEY);
  } catch {
    return null;
  }
}

const initialState: GoogleSheetsState = {
  configured: isConfigured(),
  serviceAccountEmail: getServiceAccountEmail(),
  spreadsheetId: loadSpreadsheetId(),
  syncStatus: "idle",
  syncError: null,
};

function reducer(
  state: GoogleSheetsState,
  action: GoogleSheetsAction,
): GoogleSheetsState {
  switch (action.type) {
    case "SET_SPREADSHEET":
      return { ...state, spreadsheetId: action.payload, syncStatus: "idle" };
    case "CLEAR_SPREADSHEET":
      return {
        ...state,
        spreadsheetId: null,
        syncStatus: "idle",
        syncError: null,
      };
    case "SYNC_START":
      return { ...state, syncStatus: "syncing", syncError: null };
    case "SYNC_SUCCESS":
      return { ...state, syncStatus: "success", syncError: null };
    case "SYNC_ERROR":
      return {
        ...state,
        syncStatus: "error",
        syncError: action.payload,
      };
    default:
      return state;
  }
}

interface GoogleSheetsContextValue {
  state: GoogleSheetsState;
  setSpreadsheet: (urlOrId: string) => Promise<void>;
  clearSpreadsheet: () => void;
  dispatchSync: React.Dispatch<GoogleSheetsAction>;
}

const GoogleSheetsContext = createContext<GoogleSheetsContextValue | null>(
  null,
);

export function GoogleSheetsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setSpreadsheet = useCallback(async (urlOrId: string) => {
    const id = parseSpreadsheetId(urlOrId);
    if (!id) {
      toast.error("URL ou ID de feuille Google Sheets invalide.");
      return;
    }

    try {
      dispatch({ type: "SYNC_START" });
      await createSpreadsheetStructure(id);
      localStorage.setItem(SPREADSHEET_KEY, id);
      dispatch({ type: "SET_SPREADSHEET", payload: id });
      dispatch({ type: "SYNC_SUCCESS" });
      toast.success("Feuille Google Sheets configurée avec succès.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la configuration de la feuille.";
      dispatch({ type: "SYNC_ERROR", payload: message });
      toast.error(message);
    }
  }, []);

  const clearSpreadsheet = useCallback(() => {
    localStorage.removeItem(SPREADSHEET_KEY);
    dispatch({ type: "CLEAR_SPREADSHEET" });
    toast.info("Synchronisation Google Sheets désactivée.");
  }, []);

  return (
    <GoogleSheetsContext.Provider
      value={{
        state,
        setSpreadsheet,
        clearSpreadsheet,
        dispatchSync: dispatch,
      }}
    >
      {children}
    </GoogleSheetsContext.Provider>
  );
}

export function useGoogleSheets(): GoogleSheetsContextValue {
  const context = useContext(GoogleSheetsContext);
  if (!context) {
    throw new Error(
      "useGoogleSheets must be used within a GoogleSheetsProvider",
    );
  }
  return context;
}

/** Re-export for sync services that need auth check. */
export { isAuthenticated as isGoogleAuthenticated };
