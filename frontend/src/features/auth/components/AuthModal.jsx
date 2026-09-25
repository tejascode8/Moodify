import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import "../authStyle/AuthModal.scss";

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  title = "Sign In Required",
  message = "Register or sign in to your personal account to customize soundscapes, save favorites, and manage tracks.",
  onSuccess = () => {},
}) {
  const { handleLogin, handleRegister, handleDemoLogin, loading, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLocalError("");
      if (setAuthError) setAuthError(null);
    }
  }, [isOpen, initialMode, setAuthError]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError("");
    if (setAuthError) setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (mode === "register" && !formData.username.trim()) {
      setLocalError("Username is required to create an account.");
      return;
    }

    try {
      if (mode === "login") {
        await handleLogin({ email: formData.email, password: formData.password });
      } else {
        await handleRegister({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setLocalError(err.message || "Authentication failed. Please try again.");
    }
  };

  const handleContinueGuest = () => {
    handleDemoLogin();
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="auth-modal-header">
          <span className="brand-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
            </svg>
            Moodify Account
          </span>
          <h2>{mode === "login" ? "Sign In to Moodify" : "Create Your Account"}</h2>
          <p>{message || (mode === "login" ? "Sign in to sync your customized soundtracks and personal library." : "Join Moodify to personalize and control your emotion-responsive audio spectrum.")}</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setLocalError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setLocalError("");
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {(localError || authError) && (
            <div className="auth-error-banner">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{localError || authError}</span>
            </div>
          )}

          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="modal-username">Username</label>
              <input
                id="modal-username"
                type="text"
                name="username"
                placeholder="e.g. alex_waves"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="modal-email">Email Address</label>
            <input
              id="modal-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-password">Password</label>
            <input
              id="modal-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-inline" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="clean-spinner-sm" style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                {mode === "login" ? "Signing In..." : "Registering..."}
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Register Account"
            )}
          </button>
        </form>

        <div className="auth-modal-divider">or explore</div>

        <button
          type="button"
          className="btn btn--secondary guest-continue-btn"
          onClick={handleContinueGuest}
        >
          <span>Continue as Guest Explorer</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
