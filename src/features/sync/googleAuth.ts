// Service Account JWT authentication for Google Sheets API
// Signs a JWT with the SA private key using Web Crypto, then exchanges it for an access token.

const TOKEN_URI = "https://oauth2.googleapis.com/token";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_LIFETIME_S = 3600; // 1 hour

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export interface GoogleAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function getServiceAccountConfig() {
  const email = import.meta.env.VITE_SA_CLIENT_EMAIL;
  const privateKeyBase64 = import.meta.env.VITE_SA_PRIVATE_KEY_B64;

  if (!email || !privateKeyBase64) {
    throw new Error(
      "Variables VITE_SA_CLIENT_EMAIL et VITE_SA_PRIVATE_KEY_B64 requises dans .env.local.",
    );
  }

  // Decode base64-encoded PEM key
  const privateKeyPem = atob(privateKeyBase64);

  return { email, privateKeyPem };
}

/** Base64url-encode a buffer (no padding). */
function base64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Base64url-encode a string. */
function base64urlStr(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Parse PEM private key and import as CryptoKey for RS256 signing. */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

/** Create and sign a JWT for the Google OAuth2 token endpoint. */
async function createSignedJwt(
  email: string,
  privateKeyPem: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: SCOPES,
    aud: TOKEN_URI,
    iat: now,
    exp: now + TOKEN_LIFETIME_S,
  };

  const encodedHeader = base64urlStr(JSON.stringify(header));
  const encodedPayload = base64urlStr(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64url(signature)}`;
}

/** Exchange a signed JWT for a Google OAuth2 access token. */
async function exchangeJwtForToken(jwt: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });

  const response = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Erreur d'authentification Google (${response.status}): ${text}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // Refresh 60s early
  return data.access_token;
}

/**
 * Returns a valid access token, refreshing if necessary.
 * This is the main entry point for all Sheets API calls.
 */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const { email, privateKeyPem } = getServiceAccountConfig();
  const jwt = await createSignedJwt(email, privateKeyPem);
  return exchangeJwtForToken(jwt);
}

/**
 * Checks whether the service account credentials are configured.
 * Does NOT validate them — call getAccessToken() for that.
 */
export function isConfigured(): boolean {
  try {
    getServiceAccountConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the service account email (for sharing sheets).
 */
export function getServiceAccountEmail(): string | null {
  try {
    return getServiceAccountConfig().email;
  } catch {
    return null;
  }
}

/** Force-clear the cached token. */
export function clearToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

export function isAuthenticated(): boolean {
  return cachedToken !== null && Date.now() < tokenExpiresAt;
}
