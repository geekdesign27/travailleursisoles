import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Analysis } from "@/types/analysis.schema";

// Fields that can be updated via UPDATE_FIELD (excludes readonly fields)
type UpdatableField = Exclude<keyof Analysis, "id" | "createdAt" | "updatedAt">;

type AnalysisAction =
  | { type: "analysis/CREATE"; payload: Analysis }
  | {
      type: "analysis/UPDATE_FIELD";
      payload: { field: UpdatableField; value: Analysis[UpdatableField] };
    }
  | { type: "analysis/SET_STEP"; payload: { step: number; level: number } }
  | { type: "analysis/LOAD"; payload: Analysis }
  | { type: "analysis/RESET" }
  | { type: "analysis/MARK_SAVED" };

interface AnalysisState {
  current: Analysis | null;
  isDirty: boolean;
}

const initialState: AnalysisState = {
  current: null,
  isDirty: false,
};

function analysisReducer(
  state: AnalysisState,
  action: AnalysisAction,
): AnalysisState {
  switch (action.type) {
    case "analysis/CREATE":
      return { current: action.payload, isDirty: true };

    case "analysis/UPDATE_FIELD":
      if (!state.current) return state;
      return {
        current: {
          ...state.current,
          [action.payload.field]: action.payload.value,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };

    case "analysis/SET_STEP":
      if (!state.current) return state;
      return {
        current: {
          ...state.current,
          currentStep: action.payload.step,
          currentLevel: action.payload.level,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };

    case "analysis/LOAD":
      return { current: action.payload, isDirty: false };

    case "analysis/RESET":
      return initialState;

    case "analysis/MARK_SAVED":
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

interface AnalysisContextValue {
  state: AnalysisState;
  dispatch: React.Dispatch<AnalysisAction>;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextValue {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
