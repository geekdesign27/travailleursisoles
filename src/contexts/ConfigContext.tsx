import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";

// 5 configurable taxonomy fields
export interface CompanyConfig {
  departements: string[];
  typesEquipement: string[];
  typesAlerte: string[];
  libellesFrequence: string[];
  prestatairesFormation: string[];
}

export type TaxonomyField = keyof CompanyConfig;

const STORAGE_KEY = "app:config";

const defaultConfig: CompanyConfig = {
  departements: [],
  typesEquipement: [],
  typesAlerte: [],
  libellesFrequence: [],
  prestatairesFormation: [],
};

function loadFromStorage(): CompanyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw) as Partial<CompanyConfig>;
    return {
      departements: Array.isArray(parsed.departements)
        ? parsed.departements
        : [],
      typesEquipement: Array.isArray(parsed.typesEquipement)
        ? parsed.typesEquipement
        : [],
      typesAlerte: Array.isArray(parsed.typesAlerte) ? parsed.typesAlerte : [],
      libellesFrequence: Array.isArray(parsed.libellesFrequence)
        ? parsed.libellesFrequence
        : [],
      prestatairesFormation: Array.isArray(parsed.prestatairesFormation)
        ? parsed.prestatairesFormation
        : [],
    };
  } catch {
    return defaultConfig;
  }
}

function saveToStorage(config: CompanyConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Silently fail if localStorage is full
  }
}

type ConfigAction =
  | {
      type: "config/SET_TAXONOMY";
      payload: { field: TaxonomyField; items: string[] };
    }
  | { type: "config/ADD_ITEM"; payload: { field: TaxonomyField; item: string } }
  | {
      type: "config/REMOVE_ITEM";
      payload: { field: TaxonomyField; index: number };
    }
  | {
      type: "config/UPDATE_ITEM";
      payload: { field: TaxonomyField; index: number; value: string };
    };

function configReducer(
  state: CompanyConfig,
  action: ConfigAction,
): CompanyConfig {
  switch (action.type) {
    case "config/SET_TAXONOMY":
      return { ...state, [action.payload.field]: action.payload.items };

    case "config/ADD_ITEM": {
      const current = state[action.payload.field];
      return {
        ...state,
        [action.payload.field]: [...current, action.payload.item],
      };
    }

    case "config/REMOVE_ITEM": {
      const current = state[action.payload.field];
      return {
        ...state,
        [action.payload.field]: current.filter(
          (_, i) => i !== action.payload.index,
        ),
      };
    }

    case "config/UPDATE_ITEM": {
      const current = [...state[action.payload.field]];
      current[action.payload.index] = action.payload.value;
      return { ...state, [action.payload.field]: current };
    }

    default:
      return state;
  }
}

interface ConfigContextValue {
  config: CompanyConfig;
  dispatch: React.Dispatch<ConfigAction>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, dispatch] = useReducer(
    configReducer,
    undefined,
    loadFromStorage,
  );

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(config);
  }, [config]);

  return (
    <ConfigContext.Provider value={{ config, dispatch }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
