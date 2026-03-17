// Google Identity Services OAuth2 authentication service

export interface GoogleAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface TokenClient {
  requestAccessToken: (config?: { prompt?: string }) => void;
  callback: (response: TokenResponse & { error?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse & { error?: string }) => void;
          }) => TokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
}

const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";

let tokenClient: TokenClient | null = null;
let currentToken: string | null = null;
let gisLoaded = false;

function loadGisScript(): Promise<void> {
  if (gisLoaded && window.google?.accounts) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.accounts) {
      gisLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () =>
      reject(new Error("Impossible de charger Google Identity Services."));
    document.head.appendChild(script);
  });
}

export async function initGoogleAuth(): Promise<void> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "VITE_GOOGLE_CLIENT_ID non configuré. Ajoutez-le dans .env.local.",
    );
  }

  await loadGisScript();

  tokenClient = window.google!.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {
      // Will be overridden in signIn()
    },
  });
}

export function signIn(): Promise<TokenResponse> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(
        new Error(
          "Service d'authentification non initialisé. Appelez initGoogleAuth() d'abord.",
        ),
      );
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        currentToken = null;
        reject(new Error(`Erreur d'authentification : ${response.error}`));
        return;
      }
      currentToken = response.access_token;
      resolve(response);
    };

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export function signOut(): Promise<void> {
  return new Promise((resolve) => {
    if (currentToken && window.google?.accounts) {
      window.google.accounts.oauth2.revoke(currentToken, () => {
        currentToken = null;
        resolve();
      });
    } else {
      currentToken = null;
      resolve();
    }
  });
}

export function getAccessToken(): string | null {
  return currentToken;
}

export function isAuthenticated(): boolean {
  return currentToken !== null;
}
