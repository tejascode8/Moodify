import React, { useState, useEffect, useMemo } from "react";
import { useSong } from "../hooks/useSong";
import { useAuth } from "../../auth/hooks/useAuth";
import "../style/LikedDrawer.scss";

export default function LikedDrawer({ isOpen, onClose }) {
  const { likedSongs, playSong, toggleLike, song: currentPlaying, isPlaying, changeMood } = useSong();
  const { requireAuth } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("all");


  useEffect(() => {
    if (isOpen && window.gsap) {
      window.gsap.fromTo(
        ".library-drawer",
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  // Filtered list by query and mood
  const filteredTracks = useMemo(() => {
    return likedSongs.filter((track) => {
      const matchesSearch =
        !searchQuery ||
        track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMood =
        selectedMoodFilter === "all" ||
        track.mood?.toLowerCase() === selectedMoodFilter.toLowerCase();

      return matchesSearch && matchesMood;
    });
  }, [likedSongs, searchQuery, selectedMoodFilter]);

  if (!isOpen) return null;

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playSong(filteredTracks[0], filteredTracks);
    }
  };

  const handleShuffleAll = () => {
    if (filteredTracks.length > 0) {
      const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const handleDiscoverMood = (moodName) => {
    changeMood(moodName, true);
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="library-drawer card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="library-drawer__header">
          <div className="title-group">
            <h3>Saved Library</h3>
            <span className="count-badge">
              {likedSongs.length} {likedSongs.length === 1 ? "track" : "tracks"}
            </span>
          </div>
          <button type="button" className="close-drawer-btn" onClick={onClose} aria-label="Close saved library">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {likedSongs.length > 0 && (
          <div className="library-controls-bar">
            {/* Play All & Shuffle Buttons */}
            <div className="action-buttons-row">
              <button
                type="button"
                className="btn btn--primary lib-play-btn"
                onClick={handlePlayAll}
                disabled={filteredTracks.length === 0}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play All</span>
              </button>

              <button
                type="button"
                className="btn btn--secondary lib-shuffle-btn"
                onClick={handleShuffleAll}
                disabled={filteredTracks.length === 0}
                title="Shuffle saved tracks"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                <span>Shuffle</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="library-search-wrapper">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by track or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")} aria-label="Clear search">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Mood Category Filter Tabs */}
            <div className="mood-filter-chips">
              {[
                { id: "all", label: "All" },
                { id: "happy", label: "Happy" },
                { id: "calm", label: "Calm" },
                { id: "surprised", label: "Energetic" },
                { id: "sad", label: "Melancholy" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`filter-chip ${selectedMoodFilter === tab.id ? "active" : ""}`}
                  onClick={() => setSelectedMoodFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="library-drawer__content">
          {likedSongs.length === 0 ? (
            <div className="empty-library">
              <div className="empty-icon-circle">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h4 className="empty-title">Your library is currently empty</h4>
              <p className="empty-subtitle">
                Save your favorite soundtracks by clicking the heart icon while listening.
              </p>
              <button type="button" className="btn btn--secondary explore-cta-btn" onClick={onClose}>
                Explore Soundtracks
              </button>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="empty-search-state">
              <p>No saved tracks found matching "{searchQuery}".</p>
              <button
                type="button"
                className="btn btn--secondary reset-filter-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMoodFilter("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="saved-tracks-list">
              {filteredTracks.map((track, index) => {
                const isCurrent = currentPlaying?.url === track.url;

                return (
                  <div
                    key={track._id || `${track.url}-${index}`}
                    className={`saved-item ${isCurrent ? "is-playing" : ""}`}
                    onClick={() => playSong(track, filteredTracks)}
                  >
                    <div className="track-thumb-wrapper">
                      <img src={track.posterUrl} alt={track.title} className="track-thumb" />
                      {isCurrent && isPlaying && (
                        <div className="mini-equalizer-bars">
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                    </div>

                    <div className="track-meta">
                      <span className="title" title={track.title}>{track.title}</span>
                      <span className="artist">{track.artist || "Moodify Soundscape"}</span>
                    </div>

                    <span className="mood-pill-tag" data-mood={track.mood}>{track.mood}</span>

                    <button
                      type="button"
                      className="btn--icon remove-btn"
                      title="Remove from saved library"
                      aria-label="Remove track"
                      onClick={(e) => {
                        e.stopPropagation();
                        requireAuth(() => toggleLike(track), {
                          title: "Sign In to Manage Library",
                          message: "Register or sign in to customize and manage your personal saved library.",
                        });
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--accent-color)" stroke="var(--accent-color)" strokeWidth="1">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
