import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormGroup from "../components/FormGroup";
import { useAuth } from "../hooks/useAuth";
import MoodAtmosphere from "../../shared/components/MoodAtmosphere";
import "../authStyle/login.scss";

const Login = () => {
  const { loading, handleLogin, handleDemoLogin, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("moodify_theme") || document.documentElement.getAttribute("data-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("moodify_theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await handleLogin({ email, password });
      navigate("/");
    } catch (err) {
      console.warn("Login notice:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDemoClick = () => {
    handleDemoLogin();
    navigate("/");
  };

  return (
    <main className="auth-container">
      <MoodAtmosphere currentMood="happy" />

      {/* Floating Header Actions */}
      <div className="auth-top-nav">
        <Link to="/" className="auth-nav-brand">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
            <path d="M12 3v3m0 12v3" strokeLinecap="round" />
          </svg>
          <span>Moodify</span>
        </Link>

        <button
          type="button"
          className="btn--icon auth-theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>

      {/* Clean Centered Card */}
      <div className="auth-box card">
        <div className="auth-box__header">
          <h2>Welcome back</h2>
          <p>Enter your account details to access your soundtrack</p>
        </div>

        {authError && (
          <div className="auth-error-banner" role="alert">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <FormGroup
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (authError) setAuthError(null);
            }}
            autoComplete="email"
            required
          />

          <FormGroup
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (authError) setAuthError(null);
            }}
            autoComplete="current-password"
            required
          />

          <button
            className="btn btn--primary auth-action-btn"
            type="submit"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <span className="loading-inline">
                <span className="clean-spinner-sm" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="auth-separator">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn btn--secondary auth-demo-btn"
            onClick={handleDemoClick}
          >
            Continue as Guest
          </button>
        </form>

        <div className="auth-box__footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
