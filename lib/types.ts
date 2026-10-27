// ─── Screen names ───────────────────────────────────────────────
export type Screen =
  | "landing"
  | "auth"
  | "profile"
  | "create-vault"
  | "vault-success"
  | "owner"
  | "beneficiary"
  | "claim";

// ─── Auth ────────────────────────────────────────────────────────
export type AuthType = "web2" | "web2-oauth" | "web3";

export interface User {
  name:     string;
  email:    string;
  type:     AuthType;
  wallet?:  string; // wallet name for web3 users
}

// ─── Vault ───────────────────────────────────────────────────────
export type Plan = "free" | "premium";

export interface VaultData {
  vaultId:    string;
  owner:      string;
  email:      string;
  bName:      string;   // beneficiary name
  bEmail:     string;   // beneficiary email
  bPin:       string;   // shared PIN (hashed in production)
  delegates:  string[]; // up to 3 email addresses
  hbFreq:     string;   // "30" | "90" | "180" | "365" (days)
  hbLabel:    string;   // human-readable e.g. "Quarterly"
  plan:       Plan;
  deposit:    number;   // USD estimate for fee preview
  created:    string;   // human-readable date
}

// ─── App state ───────────────────────────────────────────────────
export interface AppState {
  screen:          Screen;
  user:            User | null;
  vault:           VaultData | null;
  vaultCreated:    boolean;
  pendingProvider: { name: string; icon: string } | null;
  isDark:          boolean;
  activityLog:     ActivityEntry[];
  assets:          Asset[];
}

export interface ActivityEntry {
  label: string;
  time:  string;
  color: string;
}

export interface Asset {
  symbol:  string;
  name:    string;
  addr:    string;
  amount:  string;
  usd:     string;
  usdRaw:  number;
  color:   string;
  type:    "crypto" | "doc";
}

// ─── Beneficiary vault state ─────────────────────────────────────
export type BeneState = "active" | "challenge" | "deceased";