import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSong } from "../../home/hooks/useSong";
import { MOOD_DETAILS } from "../../home/data/defaultSongs";
import "../style/Navbar.scss";

export default function Navbar({ onOpenUpload = () => {}, onOpenLiked = () => {} }) {
  const { user, isRegistered, handleLogout, updateThemePreference, openAuthModal } = useAuth();
  const { currentMood, likedSongs } = useSong();
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("moodify_theme") || "dark";
  });


  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const currentMoodInfo = MOOD_DETAILS[currentMood] || MOOD_DETAILS.happy;

  // Sync theme when user logs in with their saved database theme preference
  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme);
      document.documentElement.setAttribute("data-theme", user.theme);
      localStorage.setItem("moodify_theme", user.theme);
    }
  }, [user?.theme]);

  // Sync theme with document attribute & localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("moodify_theme", theme);
  }, [theme]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (updateThemePreference) {
      updateThemePreference(nextTheme);
    }
  };

  const onLogoutClick = async () => {
    await handleLogout();
  };

  const handleUploadClick = () => {
    if (!isRegistered) {
      openAuthModal({
        mode: "login",
        title: "Sign In to Upload Tracks",
        message: "Register or sign in to your personal account to upload custom soundtracks.",
        onSuccess: onOpenUpload,
      });
    } else {
      onOpenUpload();
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* Left: Brand Identity */}
        <Link to="/" className="site-header__brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
              <path d="M12 3v3m0 12v3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="brand-name">Moodify</span>
        </Link>

        {/* Right: Actions & Profile */}
        <div className="site-header__actions">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            className="btn btn--icon theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
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

          {/* Upload Track Button */}
          <button
            type="button"
            className="btn btn--secondary upload-btn"
            onClick={handleUploadClick}
            title="Upload audio track"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
            </svg>
            <span>Upload</span>
          </button>

          {/* Liked Tracks Library Button */}
          <button
            type="button"
            className="btn btn--secondary liked-btn"
            onClick={onOpenLiked}
            title="Saved Tracks"
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill={likedSongs.length > 0 ? "var(--accent-color)" : "none"}
              stroke={likedSongs.length > 0 ? "var(--accent-color)" : "currentColor"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Library</span>
          </button>

          {/* User Account / Sign In */}
          {isRegistered ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="avatar-circle">
                  {(user.username || user.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="username-label">{user.username || "Account"}</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" opacity="0.6">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {showDropdown && (
                <div className="user-dropdown-menu">
                  <div className="user-info">
                    <p className="user-name">{user.username}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    type="button"
                    className="dropdown-item logout"
                    onClick={onLogoutClick}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                      <polyline points="16 17 21 12 16 7" strokeLinecap="round" />
                      <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--primary sign-in-btn"
              onClick={() => openAuthModal({ mode: "login" })}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


