"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect, // <-- Added useEffect
  ReactNode,
} from "react";
import type {
  AppState,
  Screen,
  User,
  VaultData,
  ActivityEntry,
  Asset,
} from "./types";

// ─── Initial state ───────────────────────────────────────────────
const initial: AppState = {
  screen:          "landing",
  user:            null,
  vault:           null,
  vaultCreated:    false,
  pendingProvider: null,
  isDark:          true, // Defaulting to true is usually preferred for Web3, change if needed
  activityLog:     [],
  assets:          [],
};

// ─── Actions ─────────────────────────────────────────────────────
type Action =
  | { type: "GOTO";             payload: Screen }
  | { type: "SET_SCREEN";       payload: Screen }
  | { type: "LOGIN";            payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_PROVIDER";     payload: { name: string; icon: string } | null }
  | { type: "VAULT_CREATED";    payload: VaultData }
  | { type: "ADD_ACTIVITY";     payload: ActivityEntry }
  | { type: "ADD_ASSET";        payload: Asset }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_THEME";        payload: boolean };

// ─── Reducer ─────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "GOTO":
    case "SET_SCREEN":
      return { ...state, screen: action.payload };
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...initial };
    case "SET_PROVIDER":
      return { ...state, pendingProvider: action.payload };
    case "VAULT_CREATED":
      return {
        ...state,
        vault:        action.payload,
        vaultCreated: true,
        activityLog:  [
          { label: `Vault #${action.payload.vaultId} created on Solana`,    time: "Just now", color: "#5c9c7a" },
          { label: `Beneficiary ${action.payload.bName} registered`,        time: "Just now", color: "#c9a96e" },
          { label: `${action.payload.delegates.filter(Boolean).length} delegate invitation(s) sent`, time: "Just now", color: "#c9843a" },
        ],
      };
    case "ADD_ACTIVITY":
      return { ...state, activityLog: [action.payload, ...state.activityLog].slice(0, 20) };
    case "ADD_ASSET":
      return { ...state, assets: [...state.assets, action.payload] };
    case "TOGGLE_THEME":
      return { ...state, isDark: !state.isDark };
    case "SET_THEME":
      return { ...state, isDark: action.payload };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────
interface AppContextValue {
  state:    AppState;
  goTo:     (screen: Screen) => void;
  login:    (user: User) => void;
  logout:   () => void;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // --- Sync React State with Browser DOM for Tailwind ---
  useEffect(() => {
    if (state.isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.isDark]);

  const goTo = useCallback((screen: Screen) => {
    dispatch({ type: "GOTO", payload: screen });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const login = useCallback((user: User) => {
    dispatch({ type: "LOGIN", payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AppContext.Provider value={{ state, goTo, login, logout, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}