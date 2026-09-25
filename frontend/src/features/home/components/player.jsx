import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSong } from "../hooks/useSong";
import { useAuth } from "../../auth/hooks/useAuth";
import { animateTrackChange, pulseScale } from "../../shared/utils/gsapAnimations";
import { MOOD_DETAILS } from "../data/defaultSongs";
import "../style/player.scss";

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export default function Player() {
  const {
    song,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrev,
    repeatMode,
    setRepeatMode,
    isShuffle,
    setIsShuffle,
    toggleLike,
    isLiked,
    currentMood,
  } = useSong();
  const { requireAuth } = useAuth();


  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const playButtonRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState(null);
  const [hoverSeekPos, setHoverSeekPos] = useState(0);

  const currentMoodInfo = MOOD_DETAILS[currentMood] || MOOD_DETAILS.happy;

  // Track switch animation
  useEffect(() => {
    if (song?.title) {
      animateTrackChange(".bottom-player__track");
    }
  }, [song?.url, song?.title]);

  // Sync play/pause with audio ref
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.url) return;

    let isMounted = true;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (!isMounted) return;
          // AbortError is completely normal when changing tracks while loading
          if (e.name === "AbortError") {
            return;
          }
          if (e.name === "NotAllowedError") {
            setIsPlaying(false);
            return;
          }
        });
      }
    } else {
      audio.pause();
    }

    return () => {
      isMounted = false;
    };
  }, [isPlaying, song?.url, setIsPlaying]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.75;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const skip = useCallback(
    (secs) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = Math.min(Math.max(audio.currentTime + secs, 0), duration || 0);
    },
    [duration]
  );

  const adjustVolume = useCallback(
    (delta) => {
      setVolume((prev) => {
        const next = Math.max(0, Math.min(1, Math.round((prev + delta) * 100) / 100));
        if (audioRef.current) {
          audioRef.current.volume = next;
        }
        setIsMuted(next === 0);
        return next;
      });
    },
    []
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === "ArrowRight") {
        skip(5);
      } else if (e.code === "ArrowLeft") {
        skip(-5);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        adjustVolume(0.05);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        adjustVolume(-0.05);
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume, isMuted, skip, toggleMute, adjustVolume, setIsPlaying]);

  const togglePlay = () => {
    if (playButtonRef.current) {
      pulseScale(playButtonRef.current);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (s) => {
    setSpeed(s);
    if (audioRef.current) {
      audioRef.current.playbackRate = s;
    }
    setShowSpeed(false);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  const handleTimelineHover = (e) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverSeekTime(ratio * duration);
    setHoverSeekPos(ratio * 100);
  };

  const handleTopScrubberHover = (e) => {
    const bar = e.currentTarget;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverSeekTime(ratio * duration);
    setHoverSeekPos(ratio * 100);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(song);

  if (!song) return null;

  return (
    <footer className="bottom-player" role="region" aria-label="Audio Player">
      <audio
        ref={audioRef}
        src={song.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
      />

      {/* Top Edge Ambient Timeline Bar */}
      <div
        className="player-top-scrubber"
        onClick={handleProgressClick}
        onMouseMove={handleTopScrubberHover}
        onMouseLeave={() => setHoverSeekTime(null)}
        title="Seek audio track"
      >
        <div className="player-top-scrubber__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="bottom-player__inner">
        {/* Left: Track Details & Artwork */}
        <div className="bottom-player__track">
          <div className="track-art-wrap">
            <img src={song.posterUrl} alt={song.title} className="track-cover-art" />
            {isPlaying && (
              <div className="track-playing-wave">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className="track-info">
            <div className="title-row">
              <span className="track-title" title={song.title}>{song.title}</span>
            </div>
            <span className="track-artist">{song.artist || "Moodify Soundscape"}</span>
          </div>
        </div>


        {/* Center: Controls & Scrubber */}
        <div className="bottom-player__center">
          <div className="player-controls">
            {/* Shuffle */}
            <button
              type="button"
              className={`btn--icon control-action ${isShuffle ? "active" : ""}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title={isShuffle ? "Shuffle Mode Active" : "Shuffle Mode Off"}
              aria-label="Toggle shuffle"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            {/* Previous Track */}
            <button
              type="button"
              className="btn--icon control-action"
              onClick={playPrev}
              title="Previous Track"
              aria-label="Previous track"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play / Pause Toggle */}
            <button
              ref={playButtonRef}
              type="button"
              className={`play-toggle-button ${isPlaying ? "is-playing" : ""}`}
              onClick={togglePlay}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <rect x="5.5" y="4" width="4" height="16" rx="1.5" />
                  <rect x="14.5" y="4" width="4" height="16" rx="1.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginLeft: "2px" }}>
                  <path d="M7 4.5v15c0 .65.71 1.05 1.27.72l12-7.5c.56-.35.56-1.19 0-1.54l-12-7.5c-.56-.33-1.27.07-1.27.72z" />
                </svg>
              )}
            </button>



            {/* Next Track */}
            <button
              type="button"
              className="btn--icon control-action"
              onClick={playNext}
              title="Next Track"
              aria-label="Next track"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Repeat Mode */}
            <button
              type="button"
              className={`btn--icon control-action ${repeatMode !== "off" ? "active" : ""}`}
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
              aria-label={`Repeat mode: ${repeatMode}`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {repeatMode === "one" && <span className="repeat-one-tag">1</span>}
            </button>
          </div>

          {/* Scrubber Timeline */}
          <div className="player-timeline">
            <span className="time-display">{formatTime(currentTime)}</span>
            <div
              className="timeline-track"
              ref={progressRef}
              onClick={handleProgressClick}
              onMouseMove={handleTimelineHover}
              onMouseLeave={() => setHoverSeekTime(null)}
            >
              <div className="timeline-fill" style={{ width: `${progress}%` }} />
              {hoverSeekTime !== null && (
                <div
                  className="timeline-hover-bubble"
                  style={{ left: `${hoverSeekPos}%` }}
                >
                  {formatTime(hoverSeekTime)}
                </div>
              )}
            </div>
            <span className="time-display">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Sound Tools (Speed, Shortcuts & Volume) */}
        <div className="bottom-player__tools">
          {/* Shortcuts Popover Trigger */}
          <div className="shortcut-popover-wrap">
            <button
              type="button"
              className="btn--icon shortcut-hint-btn"
              onClick={() => setShowShortcuts(!showShortcuts)}
              title="Keyboard Shortcuts"
              aria-label="Keyboard shortcuts"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
              </svg>
            </button>

            {showShortcuts && (
              <div className="shortcuts-card">
                <div className="shortcuts-card__header">
                  <span>Player Shortcuts</span>
                  <button type="button" onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="shortcuts-list">
                  <div className="shortcut-row">
                    <kbd>Space</kbd>
                    <span>Play / Pause</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>←</kbd> <kbd>→</kbd>
                    <span>Seek ±5s</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>↑</kbd> <kbd>↓</kbd>
                    <span>Volume ±5%</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>M</kbd>
                    <span>Mute / Unmute</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Speed Preset Switcher */}
          <div className="speed-picker-wrap">
            <button
              type="button"
              className="speed-toggle-btn"
              onClick={() => setShowSpeed(!showSpeed)}
              title="Playback Speed"
            >
              <span>{speed}×</span>
            </button>

            {showSpeed && (
              <div className="speed-dropdown">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`speed-item ${s === speed ? "selected" : ""}`}
                    onClick={() => handleSpeedChange(s)}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="volume-control">
            <button
              type="button"
              className="btn--icon volume-btn"
              onClick={toggleMute}
              title={isMuted ? "Unmute (M)" : "Mute (M)"}
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.87 8.87 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolume}
              className="volume-slider"
              aria-label="Volume level"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Favorite / Like Button on far right corner */}
          <button
            type="button"
            className={`btn--icon favorite-btn ${liked ? "is-liked" : ""}`}
            onClick={() =>
              requireAuth(() => toggleLike(song), {
                title: "Sign In to Save Tracks",
                message: "Register or sign in to save your favorite soundtracks to your personal library.",
              })
            }
            title={liked ? "Remove from Library" : "Save to Library"}
            aria-label={liked ? "Remove from Library" : "Save to Library"}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill={liked ? "var(--accent-color)" : "none"}
              stroke={liked ? "var(--accent-color)" : "currentColor"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

        </div>
      </div>
    </footer>

  );
}
