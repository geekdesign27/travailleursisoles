import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type { GoogleAuthState } from "@/features/sync/googleAuth";
import {
  initGoogleAuth,
  signIn,
  signOut,
  getAccessToken,
  isAuthenticated as checkAuth,
} from "@/features/sync/googleAuth";
import {
  createSpreadsheetStructure,
  parseSpreadsheetId,
} from "@/features/sync/sheetsService";
import { toast } from "sonner";

type SyncStatus = "idle" | "syncing" | "success" | "error";

interface GoogleSheetsState {
  auth: GoogleAuthState;
  spreadsheetId: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
}

type GoogleSheetsAction =
  | { type: "CONNECT_START" }
  | { type: "CONNECT_SUCCESS" }
  | { type: "CONNECT_ERROR"; payload: string }
  | { type: "DISCONNECT" }
  | { type: "SET_SPREADSHEET"; payload: string }
  | { type: "SYNC_START" }
  | { type: "SYNC_SUCCESS" }
  | { type: "SYNC_ERROR"; payload: string };

const initialState: GoogleSheetsState = {
  auth: { isAuthenticated: false, isLoading: false, error: null },
  spreadsheetId: null,
  syncStatus: "idle",
  syncError: null,
};

function reducer(
  state: GoogleSheetsState,
  action: GoogleSheetsAction,
): GoogleSheetsState {
  switch (action.type) {
    case "CONNECT_START":
      return {
        ...state,
        auth: { isAuthenticated: false, isLoading: true, error: null },
      };
    case "CONNECT_SUCCESS":
      return {
        ...state,
        auth: { isAuthenticated: true, isLoading: false, error: null },
      };
    case "CONNECT_ERROR":
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          isLoading: false,
          error: action.payload,
        },
      };
    case "DISCONNECT":
      return {
        ...state,
        auth: { isAuthenticated: false, isLoading: false, error: null },
        syncStatus: "idle",
        syncError: null,
      };
    case "SET_SPREADSHEET":
      return { ...state, spreadsheetId: action.payload };
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
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setSpreadsheet: (urlOrId: string) => Promise<void>;
  dispatchSync: React.Dispatch<GoogleSheetsAction>;
}

const GoogleSheetsContext = createContext<GoogleSheetsContextValue | null>(
  null,
);

export function GoogleSheetsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const connect = useCallback(async () => {
    dispatch({ type: "CONNECT_START" });
    try {
      await initGoogleAuth();
      await signIn();
      dispatch({ type: "CONNECT_SUCCESS" });
      toast.success("Connecté à Google Sheets");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de connexion à Google.";
      dispatch({ type: "CONNECT_ERROR", payload: message });
      toast.error(message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await signOut();
      dispatch({ type: "DISCONNECT" });
      toast.info("Déconnecté de Google Sheets");
    } catch {
      toast.error("Erreur lors de la déconnexion.");
    }
  }, []);

  const setSpreadsheet = useCallback(async (urlOrId: string) => {
    const id = parseSpreadsheetId(urlOrId);
    if (!id) {
      toast.error("URL ou ID de feuille Google Sheets invalide.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toast.error("Connectez-vous d'abord à Google.");
      return;
    }

    try {
      dispatch({ type: "SYNC_START" });
      await createSpreadsheetStructure(token, id);
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

  return (
    <GoogleSheetsContext.Provider
      value={{
        state,
        connect,
        disconnect,
        setSpreadsheet,
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

/**
 * Convenience: returns current auth check without context (for sync services).
 */
export { checkAuth as isGoogleAuthenticated, getAccessToken };
