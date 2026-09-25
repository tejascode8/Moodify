import React, { useEffect, useRef, useState, useCallback } from "react";
import { detect, init, startCamera, stopCamera as stopHardwareCamera } from "../utils/utils";
import { MOOD_DETAILS } from "../../home/data/defaultSongs";
import "../style/FaceExpression.scss";

export default function FaceExpression({ onMoodDetected = () => {}, currentActiveMood = "happy" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const [expression, setExpression] = useState(currentActiveMood || "happy");
  const [scores, setScores] = useState({ happy: 75, sad: 10, surprised: 15, calm: 50 });
  const [cameraStatus, setCameraStatus] = useState("loading"); // 'loading' | 'ready' | 'off' | 'error'
  const [isContinuous, setIsContinuous] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const enableCamera = useCallback(async () => {
    setCameraStatus("loading");
    const ok = await startCamera({ videoRef, streamRef });
    setCameraStatus(ok ? "ready" : "error");
    return ok;
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Hardware camera track stop & release
    stopHardwareCamera({ videoRef, streamRef });

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setIsContinuous(false);
    setIsScanning(false);
    setCameraStatus("off");
  }, []);

  const toggleCamera = useCallback(async () => {
    if (cameraStatus === "ready") {
      stopCamera();
    } else {
      await enableCamera();
    }
  }, [cameraStatus, stopCamera, enableCamera]);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      await init({
        landmarkerRef,
        videoRef,
        streamRef,
        isMounted: () => mounted,
        onCameraReady: () => {
          if (mounted) setCameraStatus("ready");
        },
        onModelReady: () => {},
        onError: () => {
          if (mounted) setCameraStatus("error");
        },
      });
    }

    setup();


    return () => {
      mounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (landmarkerRef.current) landmarkerRef.current.close();
      stopHardwareCamera({ videoRef, streamRef });
    };
  }, []);


  const handleSingleDetect = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => {
      const result = detect({
        landmarkerRef,
        videoRef,
        setExpression,
        setScores,
        canvasRef,
      });

      setIsScanning(false);
      if (result?.mood) {
        onMoodDetected(result.mood);
      }
    }, 250);
  }, [onMoodDetected]);

  // Continuous tracking
  useEffect(() => {
    if (!isContinuous || cameraStatus !== "ready") {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = 0;
    const loop = (time) => {
      if (time - lastTime > 600) {
        lastTime = time;
        const result = detect({
          landmarkerRef,
          videoRef,
          setExpression,
          setScores,
          canvasRef,
        });
        if (result?.mood && result.mood !== expression) {
          onMoodDetected(result.mood);
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isContinuous, cameraStatus, expression, onMoodDetected]);

  const activeMoodInfo = MOOD_DETAILS[expression] || MOOD_DETAILS.happy;

  return (
    <section className="camera-section card">
      <div className="camera-section__grid">
        {/* Left: Clean Video Viewport */}
        <div className="camera-feed-container">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="camera-video"
            />
            <canvas ref={canvasRef} className="camera-canvas" />

            {/* Top HUD Bar on video */}
            <div className="camera-hud-bar">
              <div className={`camera-hud-badge ${cameraStatus} ${isContinuous ? "is-live" : ""}`}>
                <span className="hud-status-text">
                  {cameraStatus === "ready"
                    ? isContinuous
                      ? "LIVE AI TRACKING"
                      : "CAMERA READY"
                    : cameraStatus === "loading"
                    ? "INITIALIZING"
                    : cameraStatus === "off"
                    ? "CAMERA OFF"
                    : "CAMERA OFFLINE"}
                </span>
              </div>

              {cameraStatus === "ready" && (
                <div className="camera-hud-tech">
                  <span>HD • 468 PTS</span>
                </div>
              )}
            </div>

            {cameraStatus === "loading" && (
              <div className="camera-overlay-state">
                <div className="clean-spinner"></div>
                <p>Initializing camera...</p>
              </div>
            )}

            {cameraStatus === "off" && (
              <div className="camera-overlay-state">
                <div className="camera-off-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M21 21l-3.34-3.34L16 16v-1.66m0-4.68V7a2 2 0 0 0-2-2H9.34L7 2.66M1 1l22 22" />
                    <path d="M1 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 1.83-1.17" />
                    <polygon points="23 7 16 12 23 17 23 7" />
                  </svg>
                </div>
                <p>Camera is currently turned off.</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={enableCamera}
                >
                  Turn On Camera
                </button>
              </div>
            )}

            {cameraStatus === "error" && (
              <div className="camera-overlay-state">
                <p>Camera is currently inactive or permission was not granted.</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={enableCamera}
                >
                  Enable Camera
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions under video */}
          <div className="camera-controls">
            <button
              type="button"
              className="btn btn--primary scan-btn"
              onClick={cameraStatus === "ready" ? handleSingleDetect : enableCamera}
              disabled={isScanning}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              </svg>
              <span>{isScanning ? "Analyzing..." : "Analyze Mood"}</span>
            </button>

            <button
              type="button"
              className={`btn btn--secondary live-btn ${isContinuous ? "active" : ""}`}
              onClick={() => setIsContinuous(!isContinuous)}
              disabled={cameraStatus !== "ready"}
            >
              {isContinuous ? "Pause Live" : "Auto-Track"}
            </button>

            <button
              type="button"
              className={`btn btn--secondary camera-toggle-btn ${cameraStatus === "off" ? "is-off" : ""}`}
              onClick={toggleCamera}
              title={cameraStatus === "ready" ? "Turn off camera" : "Turn on camera"}
            >
              {cameraStatus === "ready" ? (
                <>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M21 21l-3.34-3.34L16 16v-1.66m0-4.68V7a2 2 0 0 0-2-2H9.34L7 2.66M1 1l22 22" />
                    <path d="M1 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 1.83-1.17" />
                    <polygon points="23 7 16 12 23 17 23 7" />
                  </svg>
                  <span>Camera Off</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span>Camera On</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* Right: Emotion Analysis & Manual Selection */}
        <div className="camera-meta-container">
          <div className="mood-current-card">
            <span className="section-subtitle">Current Emotional Tone</span>
            <div className="mood-heading-row">
              <h3>{activeMoodInfo.label}</h3>
            </div>
            <p className="mood-desc">{activeMoodInfo.description}</p>
          </div>

          {/* Clean Confidence Bars */}
          <div className="emotion-breakdown-list">
            <div className="breakdown-item">
              <div className="breakdown-header">
                <span>Joy & Positivity</span>
                <span>{scores.happy}%</span>
              </div>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: `${scores.happy}%`, backgroundColor: "var(--accent-color)" }}></div>
              </div>
            </div>

            <div className="breakdown-item">
              <div className="breakdown-header">
                <span>Surprise & Energy</span>
                <span>{scores.surprised}%</span>
              </div>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: `${scores.surprised}%`, backgroundColor: "#ec4899" }}></div>
              </div>
            </div>

            <div className="breakdown-item">
              <div className="breakdown-header">
                <span>Melancholy & Depth</span>
                <span>{scores.sad}%</span>
              </div>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: `${scores.sad}%`, backgroundColor: "#0ea5e9" }}></div>
              </div>
            </div>

            <div className="breakdown-item">
              <div className="breakdown-header">
                <span>Calm & Composure</span>
                <span>{scores.calm}%</span>
              </div>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: `${scores.calm}%`, backgroundColor: "#10b981" }}></div>
              </div>
            </div>
          </div>

          {/* Acoustic Tuning & Mood Stations */}
          <div className="acoustic-insight-card">
            <div className="insight-header">
              <span className="insight-label">Acoustic Resonance</span>
              <span className="frequency-badge">{activeMoodInfo.frequency || "432 Hz Harmonic"}</span>
            </div>
            <p className="insight-detail">{activeMoodInfo.resonanceNote || "Tailored psychoacoustic harmonies calibrated to elevate and synchronize your current brainwave state."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
