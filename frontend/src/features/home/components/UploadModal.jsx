import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSong } from "../hooks/useSong";
import { useAuth } from "../../auth/hooks/useAuth";
import "../style/UploadModal.scss";

// Curated mood-matched aesthetic cover images for automatic random assignment
const MOOD_COVER_POOLS = {
  happy: [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
  ],
  calm: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
  ],
  surprised: [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
  ],
  sad: [
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  ],
};

const getRandomCoverForMood = (moodName) => {
  const pool = MOOD_COVER_POOLS[moodName] || MOOD_COVER_POOLS.happy;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

const MOODS = [
  { id: "happy", label: "Happy" },
  { id: "calm", label: "Calm" },
  { id: "surprised", label: "Energetic" },
  { id: "sad", label: "Melancholy" },
];

export default function UploadModal({ isOpen, onClose }) {
  const { currentMood, playSong } = useSong();
  const { isRegistered, openAuthModal } = useAuth();
  const [file, setFile] = useState(null);
  const [mood, setMood] = useState(currentMood || "happy");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);


  const fileInputRef = useRef(null);

  // Dynamically sync theme atmosphere with selected mood
  useEffect(() => {
    if (isOpen) {
      document.documentElement.setAttribute("data-mood", mood);
    }
    return () => {
      if (currentMood) {
        document.documentElement.setAttribute("data-mood", currentMood);
      }
    };
  }, [isOpen, mood, currentMood]);

  useEffect(() => {
    if (isOpen && window.gsap) {
      window.gsap.fromTo(
        ".upload-dialog",
        { scale: 0.95, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    document.documentElement.setAttribute("data-mood", selectedMood);
  };

  const handleAudioSelection = (selected) => {
    if (!selected) return;
    setFile(selected);

    const baseName = selected.name.replace(/\.[^/.]+$/, "");
    if (baseName.includes(" - ")) {
      const parts = baseName.split(" - ");
      if (!artist) setArtist(parts[0].trim());
      if (!title) setTitle(parts[1].trim());
    } else {
      if (!title) setTitle(baseName);
      if (!artist) setArtist("Custom Soundscape");
    }

    setPreviewUrl(URL.createObjectURL(selected));
    setMessage(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.includes("audio")) {
      handleAudioSelection(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRegistered) {
      openAuthModal({
        mode: "register",
        title: "Sign In to Complete Upload",
        message: "Create an account or sign in to save and upload soundtracks to the Moodify library.",
      });
      return;
    }

    if (!file) {
      setMessage({ type: "error", text: "Please select an audio file." });
      return;
    }

    if (!title.trim()) {
      setMessage({ type: "error", text: "Track Title is required." });
      return;
    }

    if (!artist.trim()) {
      setMessage({ type: "error", text: "Artist / Producer is required." });
      return;
    }

    setIsUploading(true);
    setMessage(null);


    // Pick random cover for this mood if user did not provide a custom URL
    const finalCoverUrl = coverUrl.trim() || getRandomCoverForMood(mood);

    const formData = new FormData();
    formData.append("song", file);
    formData.append("mood", mood);
    formData.append("title", title.trim());
    formData.append("artist", artist.trim());
    formData.append("coverUrl", finalCoverUrl);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      await axios.post(`${backendUrl}/api/songs`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setMessage({ type: "success", text: "Track uploaded successfully." });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      // Local session playback fallback
      const newSongObj = {
        _id: `custom-${Date.now()}`,
        title: title.trim(),
        artist: artist.trim(),
        mood: mood,
        duration: "3:30",
        posterUrl: finalCoverUrl,
        url: previewUrl,
      };

      playSong(newSongObj);
      setMessage({
        type: "success",
        text: "Track added and playing in current session.",
      });

      setTimeout(() => {
        onClose();
      }, 1100);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (e) => {
    if (e) e.stopPropagation();
    setFile(null);
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {}
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setTitle("");
    setArtist("");
    setMessage(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="upload-dialog card" data-mood={mood} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upload-dialog__header">
          <div>
            <h3>Upload Soundscape</h3>
            <p className="dialog-subtitle">Add custom audio to your personal soundtrack</p>
          </div>
          <button
            type="button"
            className="btn--icon close-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className={`form-alert ${message.type}`} role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-dialog__form">
          {/* Minimal File Dropzone */}
          <div
            className={`file-dropzone ${file ? "has-file" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => handleAudioSelection(e.target.files?.[0])}
            />

            {file ? (
              <div className="file-loaded-row">
                <div className="file-preview-group">
                  <div className="file-icon-box">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <div className="file-info-col">
                    <span className="file-name" title={file.name}>{file.name}</span>
                    <span className="file-meta">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Audio Ready
                    </span>
                  </div>
                </div>

                <div className="file-actions-column">
                  <button
                    type="button"
                    className="btn-file-action btn-change"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    title="Choose a different audio file"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    className="btn-file-action btn-remove"
                    onClick={handleRemoveFile}
                    title="Remove selected file"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="dropzone-empty-state">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>Click to select audio file or drag & drop</p>
                <small>MP3, WAV, AAC up to 25MB</small>
              </div>
            )}
          </div>

          {/* Audio Preview Strip */}
          {previewUrl && (
            <div className="audio-preview-strip">
              <span className="preview-label">Preview:</span>
              <audio src={previewUrl} controls />
            </div>
          )}

          {/* Compulsory Title & Artist Grid */}
          <div className="form-row-2">
            <div className="form-group">
              <label>
                Track Title <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Morning Calm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Artist / Producer <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ambient Flow"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Clean Mood Tone Selector */}
          <div className="form-group">
            <label>Mood Tone</label>
            <div className="mood-segmented-group">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`mood-segment-btn ${m.id} ${mood === m.id ? "active" : ""}`}
                  onClick={() => handleMoodSelect(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Cover Art URL */}
          <div className="form-group">
            <label>Cover Art URL (Optional — auto-assigned from {MOODS.find(m => m.id === mood)?.label} pool)</label>
            <input
              type="url"
              placeholder="Leave blank for auto random cover art..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="upload-dialog__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <span className="loading-inline" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <span className="clean-spinner-sm" style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Uploading Track...
                </span>
              ) : (
                "Upload Track"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
