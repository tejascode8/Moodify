import React from "react";
import { Link, useLocation } from "react-router-dom";
import MoodAtmosphere from "../components/MoodAtmosphere";
import "../style/NotFound.scss";

export default function NotFound() {
  const location = useLocation();

  return (
    <main className="not-found-container">
      <MoodAtmosphere currentMood="happy" />

      <div className="not-found-card">
        <div className="glitch-code-badge">
          <span>Error 404 • Uncharted Frequencies</span>
        </div>

        <div className="not-found-icon-wrap">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>

        <div className="not-found-text">
          <h1>Lost in the Soundscape</h1>
          <p>
            The emotional frequency or route you are attempting to reach does not exist.
          </p>
          <code className="requested-path">{location.pathname}</code>
        </div>

        <div className="not-found-actions">
          <Link to="/" className="btn btn--primary return-home-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Return to Soundtracks</span>
          </Link>

          <Link to="/login" className="btn btn--secondary explore-guest-btn">
            <span>Account Portal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
