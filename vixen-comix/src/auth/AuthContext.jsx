import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase, authAvailable } from "../lib/supabaseClient.js";

export const MIN_PASSWORD_LENGTH = 8;

const UNAVAILABLE = "Sign-in is unavailable right now.";

const AuthContext = createContext({
  available: false,
  loading: false,
  user: null,
  signInWithEmail: async () => ({ error: UNAVAILABLE }),
  signUpWithEmail: async () => ({ error: UNAVAILABLE }),
  signInWithGoogle: async () => ({ error: UNAVAILABLE }),
  signOut: async () => ({ error: UNAVAILABLE }),
  sendPasswordReset: async () => ({ error: UNAVAILABLE }),
  updatePassword: async () => ({ error: UNAVAILABLE }),
});

// Runs a Supabase call and turns any failure into { error: "message" }.
// Nothing here throws to the page.
async function attempt(action) {
  if (!supabase) return { error: UNAVAILABLE };
  try {
    const result = await action(supabase);
    if (result?.error) return { error: result.error.message || "Something went wrong. Please try again." };
    return { error: null, data: result?.data };
  } catch (error) {
    console.error("Auth request failed", error);
    return { error: "Something went wrong. Please try again." };
  }
}

function checkPassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`;
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(authAvailable);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setUser(data?.session?.user ?? null);
      })
      .catch((error) => console.error("Could not read the saved session", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(
    (email, password) =>
      attempt((client) => client.auth.signInWithPassword({ email: String(email).trim(), password })),
    [],
  );

  // Resolves { error, needsConfirmation }. With "Confirm email" on, Supabase
  // returns no session, so the reader must click the link in their email.
  const signUpWithEmail = useCallback(async (email, password) => {
    const passwordProblem = checkPassword(password);
    if (passwordProblem) return { error: passwordProblem, needsConfirmation: false };
    const result = await attempt((client) =>
      client.auth.signUp({
        email: String(email).trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      }),
    );
    if (result.error) return { error: result.error, needsConfirmation: false };
    return { error: null, needsConfirmation: !result.data?.session };
  }, []);

  const signInWithGoogle = useCallback(
    () =>
      attempt((client) =>
        client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/login` } }),
      ),
    [],
  );

  const signOut = useCallback(() => attempt((client) => client.auth.signOut()), []);

  const sendPasswordReset = useCallback(
    (email) =>
      attempt((client) =>
        client.auth.resetPasswordForEmail(String(email).trim(), { redirectTo: `${window.location.origin}/reset-password` }),
      ),
    [],
  );

  const updatePassword = useCallback(async (password) => {
    const passwordProblem = checkPassword(password);
    if (passwordProblem) return { error: passwordProblem };
    return attempt((client) => client.auth.updateUser({ password }));
  }, []);

  const value = useMemo(
    () => ({
      available: authAvailable,
      loading,
      user,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
      updatePassword,
    }),
    [loading, user, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, sendPasswordReset, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
