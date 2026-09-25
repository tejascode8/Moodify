import React from "react";
import "../style/MoodAtmosphere.scss";

export default function MoodAtmosphere({ currentMood = "happy" }) {
  return (
    <div className={`mood-atmosphere-wrapper mood--${currentMood}`} aria-hidden="true">
      {/* Upper Page Hero Spotlight Beam */}
      <div className="hero-spotlight-beam" />

      {/* Atmospheric Ambient Color Mesh Orbs */}
      <div className="ambient-orb ambient-orb--primary" />
      <div className="ambient-orb ambient-orb--secondary" />
      <div className="ambient-orb ambient-orb--tertiary" />

      {/* Acoustic Resonance Rings (Concentric Soundwaves) */}
      <div className="resonance-cluster">
        <div className="acoustic-resonance-ring resonance-ring--1" />
        <div className="acoustic-resonance-ring resonance-ring--2" />
        <div className="acoustic-resonance-ring resonance-ring--3" />
      </div>

      {/* Harmonic Wave Ribbon SVG Elements */}
      <div className="harmonic-wave-container wave-pos--left">
        <svg viewBox="0 0 500 200" className="harmonic-wave-svg" fill="none">
          <path
            d="M 10,100 C 130,20 220,180 340,90 C 420,30 480,140 500,100"
            stroke="var(--accent-border)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="wave-path wave-path--1"
          />
          <path
            d="M 10,120 C 140,50 210,160 330,110 C 400,60 460,130 500,115"
            stroke="var(--accent-color)"
            strokeWidth="1"
            opacity="0.4"
            className="wave-path wave-path--2"
          />
        </svg>
      </div>

      <div className="harmonic-wave-container wave-pos--right">
        <svg viewBox="0 0 500 200" className="harmonic-wave-svg" fill="none">
          <path
            d="M 0,80 C 120,160 200,30 320,120 C 410,170 470,60 500,90"
            stroke="var(--accent-border)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            className="wave-path wave-path--3"
          />
          <path
            d="M 0,100 C 110,140 190,45 310,105 C 390,150 450,75 500,85"
            stroke="var(--accent-color)"
            strokeWidth="1"
            opacity="0.35"
            className="wave-path wave-path--4"
          />
        </svg>
      </div>

      {/* Dynamic Specular Sound Prisms (Frosted Glass Refraction Discs) */}
      <div className="sound-prism-cluster">
        <div className="sound-prism prism--top-left">
          <div className="prism-inner-glow" />
        </div>
        <div className="sound-prism prism--top-right">
          <div className="prism-inner-glow" />
        </div>
        <div className="sound-prism prism--bottom-right">
          <div className="prism-inner-glow" />
        </div>
        <div className="sound-prism prism--bottom-left">
          <div className="prism-inner-glow" />
        </div>
      </div>

      {/* Floating Ambient Stardust Embers */}
      <div className="stardust-container">
        <span className="light-ember ember--1" />
        <span className="light-ember ember--2" />
        <span className="light-ember ember--3" />
        <span className="light-ember ember--4" />
        <span className="light-ember ember--5" />
        <span className="light-ember ember--6" />
      </div>

      {/* Dynamic Geometric Orbitals */}
      <div className="orbital-ring orbital-ring--outer" />
      <div className="orbital-ring orbital-ring--inner" />
      <div className="orbital-ring orbital-ring--dashed" />
    </div>
  );
}
