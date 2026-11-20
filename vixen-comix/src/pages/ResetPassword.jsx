import { useState } from "react";
import { Link } from "react-router-dom";
import { MIN_PASSWORD_LENGTH, useAuth } from "../auth/AuthContext.jsx";

// Opened from the link in the "reset your password" email. That link signs the
// reader in for a moment so they can choose a new password here.
export default function ResetPassword() {
  const { available, loading, user, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    const result = await updatePassword(password);
    if (result.error) setError(result.error);
    else setDone(true);
    setBusy(false);
  }

  let body;
  if (!available) {
    body = (
      <p className="auth-message auth-message-warn" role="status">
        Sign-in is unavailable right now. You can still read every comic.
      </p>
    );
  } else if (loading) {
    body = <p role="status">Checking your reset link...</p>;
  } else if (!user) {
    body = (
      <>
        <p className="auth-message auth-message-warn" role="status">
          This reset link is not valid or has expired.
        </p>
        <p>
          <Link to="/login" className="hub-link">
            Go to Log in
          </Link>{" "}
          and choose Forgot password to get a new link.
        </p>
      </>
    );
  } else if (done) {
    body = (
      <>
        <p className="auth-message auth-message-ok" role="status">
          Your password has been changed.
        </p>
        <p>
          <Link to="/continue-reading" className="hub-btn">
            Go to Continue Reading
          </Link>
        </p>
      </>
    );
  } else {
    body = (
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <label className="auth-field">
          <span>New password (at least {MIN_PASSWORD_LENGTH} characters)</span>
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="auth-field">
          <span>Repeat the new password</span>
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </label>
        {error && (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="hub-btn auth-submit" disabled={busy}>
          Change password
        </button>
      </form>
    );
  }

  return (
    <div className="auth-card">
      <h2 className="hub-title">Choose a new password</h2>
      {body}
    </div>
  );
}
