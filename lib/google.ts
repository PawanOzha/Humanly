export type GoogleProfile = {
  email: string;
  name: string;
  picture?: string;
};

type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: (override?: { prompt?: string }) => void };
type GoogleNamespace = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (error: { type?: string }) => void;
      }) => TokenClient;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleNamespace;
  }
}

const SCRIPT = "https://accounts.google.com/gsi/client";
let loading: Promise<void> | null = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google sign-in is not available right now."));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google couldn't be reached.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google couldn't be reached."));
    document.head.appendChild(script);
  });
  return loading;
}

function messageFor(type?: string) {
  if (type === "popup_closed") return "Google sign-in was cancelled.";
  if (type === "popup_failed_to_open") return "Allow pop-ups to continue with Google.";
  return "Google sign-in didn't complete.";
}

export async function signInWithGoogle(): Promise<GoogleProfile> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in is not available right now.");
  await loadScript();
  const google = window.google;
  if (!google?.accounts?.oauth2) throw new Error("Google couldn't be reached.");

  const token = await new Promise<string>((resolve, reject) => {
    let settled = false;
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    };
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (settled) return;
        if (response.error || !response.access_token) {
          fail(response.error === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in didn't complete.");
          return;
        }
        settled = true;
        resolve(response.access_token);
      },
      error_callback: (error) => fail(messageFor(error.type)),
    });
    client.requestAccessToken({ prompt: "select_account" });
  });

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Couldn't read the Google account.");
  const data = (await res.json()) as { email?: string; name?: string; picture?: string };
  if (!data.email) throw new Error("That Google account has no email.");
  return { email: data.email, name: data.name || data.email, picture: data.picture };
}
