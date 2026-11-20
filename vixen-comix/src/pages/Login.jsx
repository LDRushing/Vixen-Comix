import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MIN_PASSWORD_LENGTH, useAuth } from "../auth/AuthContext.jsx";
import { safeNextPath } from "../lib/nav.js";

const NEXT_KEY = "vc.next";

// sessionStorage can be blocked by browser privacy settings: never let that crash the page.
function rememberNext(path) {
  try {
    sessionStorage.setItem(NEXT_KEY, path);
  } catch {
    // Without storage the reader simply lands on the default page after login.
  }
}

function takeNext() {
  try {
    const stored = sessionStorage.getItem(NEXT_KEY);
    sessionStorage.removeItem(NEXT_KEY);
    return stored;
  } catch {
    return null;
  }
}

// One page for both /login (mode="login") and /register (mode="register").
export default function Login({ mode = "login" }) {
  const isRegister = mode === "register";
  const { available, loading, user, signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Remember where to go afterwards. Google sign-in leaves the site, so this lives in sessionStorage.
  useEffect(() => {
    if (nextParam !== null) rememberNext(safeNextPath(nextParam));
  }, [nextParam]);

  // Once signed in (by form, by Google, or by the email link), go to the remembered page.
  // The ref stops React's development double-run from reading the stored path a second time.
  const redirected = useRef(false);
  useEffect(() => {
    if (loading || !user || redirected.current) return;
    redirected.current = true;
    navigate(safeNextPath(takeNext()), { replace: true });
  }, [loading, user, navigate]);

  const nextSuffix = nextParam !== null ? `?next=${safeNextPath(nextParam)}` : "";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!available || busy) return;
    setError("");
    setNotice("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
      return;
    }
    setBusy(true);
    if (isRegister) {
      const result = await signUpWithEmail(email, password);
      if (result.error) setError(result.error);
      else if (result.needsConfirmation) {
        setNotice("Check your email to confirm your account.");
        setPassword("");
      }
    } else {
      const result = await signInWithEmail(email, password);
      if (result.error) setError(result.error);
    }
    setBusy(false);
  }

  async function handleGoogle() {
    if (!available || busy) return;
    setError("");
    setNotice("");
    setBusy(true);
    const result = await signInWithGoogle();
    if (result.error) setError(result.error);
    setBusy(false);
  }

  async function handleForgot() {
    if (!available || busy) return;
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email address first, then choose Forgot password.");
      return;
    }
    setBusy(true);
    const result = await sendPasswordReset(email);
    if (result.error) setError(result.error);
    else setNotice("If that email has an account, a link to reset your password is on its way.");
    setBusy(false);
  }

  return (
    <div className="auth-card">
      <h2 className="hub-title">{isRegister ? "Create an account" : "Log in"}</h2>
      <p className="auth-intro">
        {isRegister
          ? "Save your spot in a comic and pick up where you left off."
          : "Log in to save your spot and see your Continue Reading list."}
      </p>

      {!available && (
        <p className="auth-message auth-message-warn" role="status">
          Sign-in is unavailable right now. You can still read every comic.
        </p>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <fieldset disabled={!available} className="auth-fieldset">
          <button type="button" className="auth-google" onClick={handleGoogle} disabled={busy}>
            <FcGoogle size={22} aria-hidden="true" />
            <span>Continue with Google</span>
          </button>

          <p className="auth-divider">or use your email</p>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="auth-field">
            <span>Password (at least {MIN_PASSWORD_LENGTH} characters)</span>
            <input
              type="password"
              name="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={MIN_PASSWORD_LENGTH}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <p className="auth-message auth-message-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="auth-message auth-message-ok" role="status">
              {notice}
            </p>
          )}

          <button type="submit" className="hub-btn auth-submit" disabled={busy}>
            {isRegister ? "Create account" : "Log in"}
          </button>

          {!isRegister && (
            <button type="button" className="auth-linklike" onClick={handleForgot} disabled={busy}>
              Forgot password?
            </button>
          )}
        </fieldset>
      </form>

      <p className="auth-switch">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link to={`/login${nextSuffix}`} className="hub-link">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link to={`/register${nextSuffix}`} className="hub-link">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
