import React from "react";
import MoodAtmosphere from "./MoodAtmosphere";
import "../style/GlobalLoader.scss";

export default function GlobalLoader({
  status = "Calibrating emotional soundscapes...",
  title = "Moodify",
  fullScreen = true,
  mood = "happy",
}) {
  return (
    <div
      className={`global-loader-container ${fullScreen ? "fullscreen" : "inline"}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Dynamic ambient particles & soft mesh backdrop */}
      <MoodAtmosphere currentMood={mood} />

      <div className="global-loader-content">
        {/* Holographic glowing orb with counter-rotating rings */}
        <div className="loader-brand-orb">
          <div className="orb-ring" />
          <div className="orb-ring-outer" />
          <div className="orb-glow-core" />
          <div className="orb-icon">
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
              <path d="M12 3v3m0 12v3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Audio Visualizer Waveform Equalizer */}
        <div className="loader-waveform" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* Brand & Status Text */}
        <div className="loader-text-wrap">
          <h2 className="loader-brand-title">{title}</h2>
          <p className="loader-status-msg">{status}</p>
        </div>
      </div>
    </div>
  );
}
