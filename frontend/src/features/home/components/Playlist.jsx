import React, { useState, useMemo } from "react";
import { useSong } from "../hooks/useSong";
import { useAuth } from "../../auth/hooks/useAuth";
import { MOOD_DETAILS, DEFAULT_SONGS } from "../data/defaultSongs";
import "../style/Playlist.scss";

export default function Playlist({ songs = [], onSelectMood = () => {} }) {
  const {
    song: currentPlaying,
    isPlaying,
    playSong,
    currentMood,
    toggleLike,
    isLiked,
    deleteTrack,
    loading,
  } = useSong();
  const { requireAuth } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [songToDelete, setSongToDelete] = useState(null);


  const activeMoodInfo = MOOD_DETAILS[currentMood] || MOOD_DETAILS.happy;
  const rawSongs = songs.length > 0 ? songs : DEFAULT_SONGS[currentMood] || DEFAULT_SONGS.happy;

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return rawSongs;
    const q = searchQuery.toLowerCase();
    return rawSongs.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.album?.toLowerCase().includes(q)
    );
  }, [rawSongs, searchQuery]);

  const confirmDelete = async () => {
    if (!songToDelete) return;
    await deleteTrack(songToDelete);
    setSongToDelete(null);
  };

  return (
    <section className="playlist-container card">
      {/* Header & Tabs */}
      <div className="playlist-header">
        <div className="playlist-title-wrap">
          <div className="title-row">
            <h2>Curated Soundtracks</h2>
            <span className="track-count-badge">
              {loading ? "Loading..." : `${filteredSongs.length} ${filteredSongs.length === 1 ? "track" : "tracks"}`}
            </span>
          </div>
          <p>{activeMoodInfo.tagline}</p>
        </div>

        {/* Mood Filter Pills & Quick Actions */}
        <div className="playlist-actions-wrap">
          <div className="search-bar-wrap">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search title, artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="playlist-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mood-pill-group">
            {Object.entries(MOOD_DETAILS).map(([key, details]) => (
              <button
                key={key}
                type="button"
                className={`pill-btn ${currentMood === key ? "active" : ""}`}
                onClick={() => onSelectMood(key)}
              >
                {details.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="track-table">
        <div className="track-table__head">
          <span className="col-index">#</span>
          <span className="col-title">Title</span>
          <span className="col-album">Album</span>
          <span className="col-time">Duration</span>
          <span className="col-actions"></span>
        </div>

        <div className="track-table__body">
          {loading ? (
            [1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="track-skeleton-row" aria-hidden="true">
                <div className="skeleton-box sk-index" />
                <div className="sk-artwork-group">
                  <div className="skeleton-box sk-art" />
                  <div className="sk-text-col">
                    <div className="skeleton-box sk-title" />
                    <div className="skeleton-box sk-artist" />
                  </div>
                </div>
                <div className="skeleton-box sk-album" />
                <div className="skeleton-box sk-time" />
                <div />
              </div>
            ))
          ) : filteredSongs.length === 0 ? (
            <div className="empty-search-state">
              <p>No tracks found matching "{searchQuery}".</p>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setSearchQuery("")}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredSongs.map((track, index) => {
              const isCurrent = currentPlaying?.url === track.url || currentPlaying?.title === track.title;
              const liked = isLiked(track);

              return (
                <div
                  key={track._id || `${track.title}-${index}`}
                  className={`track-item ${isCurrent ? "is-active" : ""}`}
                  onClick={() => playSong(track, filteredSongs)}
                >
                  {/* Index / Play Icon */}
                  <div className="col-index">
                    {isCurrent && isPlaying ? (
                      <div className="audio-wave-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <span className="num-label">{index + 1}</span>
                    )}
                  </div>

                  {/* Track Artwork & Details */}
                  <div className="col-title">
                    <div className="track-artwork">
                      <img src={track.posterUrl} alt={track.title} />
                      <div className="play-icon-overlay">
                        {isCurrent && isPlaying ? "⏸" : "▶"}
                      </div>
                    </div>

                    <div className="title-text-group">
                      <p className="track-title">{track.title}</p>
                      <span className="track-artist">{track.artist || "Moodify Artist"}</span>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="col-album">
                    <span>{track.album || "Emotion Spectrum"}</span>
                  </div>

                  {/* Duration */}
                  <div className="col-time">
                    <span>{track.duration || "3:20"}</span>
                  </div>

                  {/* Action Buttons (Like & Delete) */}
                  <div className="col-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`btn--icon like-btn ${liked ? "is-liked" : ""}`}
                      onClick={() =>
                        requireAuth(() => toggleLike(track), {
                          title: "Sign In to Save Tracks",
                          message: "Register or sign in to save your favorite soundtracks to your personal library.",
                        })
                      }
                      title={liked ? "Remove from Library" : "Save to Library"}
                      aria-label="Like Track"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill={liked ? "var(--accent-color)" : "none"} stroke={liked ? "var(--accent-color)" : "currentColor"} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="btn--icon delete-btn"
                      onClick={() =>
                        requireAuth(() => setSongToDelete(track), {
                          title: "Sign In to Delete Tracks",
                          message: "Register or sign in with an authorized account to delete soundtracks.",
                        })
                      }
                      title="Delete Track"
                      aria-label="Delete Track"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Popup Modal for Song Deletion */}
      {songToDelete && (
        <div className="delete-modal-overlay" onClick={() => setSongToDelete(null)}>
          <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-warning-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="delete-modal-title-wrap">
                <h3>Delete Soundtrack</h3>
                <p>Are you sure you want to delete this track?</p>
              </div>
            </div>

            <div className="delete-modal-track-preview">
              <img src={songToDelete.posterUrl} alt={songToDelete.title} />
              <div className="preview-info">
                <span className="preview-title">{songToDelete.title}</span>
                <span className="preview-artist">{songToDelete.artist || "Moodify Artist"}</span>
              </div>
            </div>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setSongToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={confirmDelete}
              >
                Delete Track
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

