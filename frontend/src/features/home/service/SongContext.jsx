import React, { createContext, useState, useEffect } from "react";
import { DEFAULT_SONGS } from "../data/defaultSongs";
import { getSong, deleteSong } from "./song.api";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  const [currentMood, setCurrentMood] = useState("happy");
  const [playlist, setPlaylist] = useState(DEFAULT_SONGS.happy);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [song, setSong] = useState(DEFAULT_SONGS.happy[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState("all"); // 'off' | 'all' | 'one'
  const [isShuffle, setIsShuffle] = useState(false);

  // Liked songs state persisted in localStorage
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem("moodify_liked_songs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep HTML root data-mood synchronized with current mood for dynamic theme gradients
  useEffect(() => {
    const root = document.documentElement;
    const moodKey = (currentMood || "happy").toLowerCase();
    const validMood = ["happy", "sad", "surprised", "calm", "neutral"].includes(moodKey)
      ? (moodKey === "neutral" ? "calm" : moodKey)
      : "happy";
    root.setAttribute("data-mood", validMood);
  }, [currentMood]);

  // Persist liked songs
  useEffect(() => {
    try {
      localStorage.setItem("moodify_liked_songs", JSON.stringify(likedSongs));
    } catch (e) {
      console.error("Failed to save liked songs:", e);
    }
  }, [likedSongs]);

  const toggleLike = (targetSong) => {
    const songToToggle = targetSong || song;
    if (!songToToggle) return;

    setLikedSongs((prev) => {
      const exists = prev.some((s) => s.url === songToToggle.url || s.title === songToToggle.title);
      if (exists) {
        return prev.filter((s) => s.url !== songToToggle.url && s.title !== songToToggle.title);
      } else {
        return [songToToggle, ...prev];
      }
    });
  };

  const isLiked = (targetSong) => {
    const checkSong = targetSong || song;
    if (!checkSong) return false;
    return likedSongs.some((s) => s.url === checkSong.url || s.title === checkSong.title);
  };

  // Switch mood and load songs
  const changeMood = async (newMood, autoPlay = true) => {
    const normalized = (newMood || "happy").toLowerCase();
    const moodKey = normalized === "neutral" ? "calm" : normalized;
    setCurrentMood(moodKey);

    setLoading(true);
    let songsForMood = DEFAULT_SONGS[moodKey] || DEFAULT_SONGS.happy;

    try {
      // Attempt backend fetch
      const res = await getSong({ mood: moodKey });
      if (res && res.song) {
        // If backend returned single or array
        const backendSongs = Array.isArray(res.song) ? res.song : [res.song];
        if (backendSongs.length > 0) {
          // Combine or override with backend
          songsForMood = [...backendSongs, ...songsForMood.filter(s => s.url !== backendSongs[0].url)];
        }
      }
    } catch (err) {
      // Backend offline or error -> smoothly use curated songs
      console.info("Using local curated library for mood:", moodKey);
    } finally {
      setPlaylist(songsForMood);
      setCurrentIndex(0);
      setSong(songsForMood[0]);
      if (autoPlay) {
        setIsPlaying(true);
      }
      setLoading(false);
    }
  };

  const playSong = (selectedSong, customPlaylist = null) => {
    if (customPlaylist) {
      setPlaylist(customPlaylist);
      const idx = customPlaylist.findIndex(s => s.url === selectedSong.url);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = playlist.findIndex(s => s.url === selectedSong.url);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
    setSong(selectedSong);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (!playlist || playlist.length === 0) return;

    if (repeatMode === "one") {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
      return;
    }

    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(randomIdx);
      setSong(playlist[randomIdx]);
      setIsPlaying(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      setCurrentIndex(nextIndex);
      setSong(playlist[nextIndex]);
      setIsPlaying(true);
    } else if (repeatMode === "all") {
      setCurrentIndex(0);
      setSong(playlist[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const playPrev = () => {
    if (!playlist || playlist.length === 0) return;

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      setSong(playlist[prevIndex]);
      setIsPlaying(true);
    } else {
      setCurrentIndex(playlist.length - 1);
      setSong(playlist[playlist.length - 1]);
      setIsPlaying(true);
    }
  };

  const deleteTrack = async (targetSong) => {
    if (!targetSong) return;

    // 1. If backend ID exists, call API
    if (targetSong._id) {
      try {
        await deleteSong(targetSong._id);
      } catch (err) {
        console.warn("Could not delete from backend database:", err.message);
      }
    }

    // 2. Remove from active playlist
    const newPlaylist = playlist.filter(
      (s) => s._id !== targetSong._id && s.url !== targetSong.url && s.title !== targetSong.title
    );
    setPlaylist(newPlaylist);

    // 3. Remove from liked songs
    setLikedSongs((prev) =>
      prev.filter((s) => s._id !== targetSong._id && s.url !== targetSong.url && s.title !== targetSong.title)
    );

    // 4. Handle currently playing if deleted
    const isCurrentPlaying = song && (song.url === targetSong.url || song._id === targetSong._id || song.title === targetSong.title);
    if (isCurrentPlaying) {
      if (newPlaylist.length > 0) {
        const nextIdx = currentIndex < newPlaylist.length ? currentIndex : 0;
        setCurrentIndex(nextIdx);
        setSong(newPlaylist[nextIdx]);
        // Keep playing if it was playing
      } else {
        setSong(null);
        setCurrentIndex(0);
        setIsPlaying(false);
      }
    } else {
      // Recompute current index in new playlist
      if (song && newPlaylist.length > 0) {
        const newIdx = newPlaylist.findIndex((s) => s.url === song.url || s.title === song.title);
        if (newIdx !== -1) {
          setCurrentIndex(newIdx);
        }
      }
    }
  };

  return (
    <SongContext.Provider
      value={{
        song,
        setSong,
        playlist,
        setPlaylist,
        currentIndex,
        setCurrentIndex,
        currentMood,
        setCurrentMood,
        changeMood,
        isPlaying,
        setIsPlaying,
        loading,
        setLoading,
        repeatMode,
        setRepeatMode,
        isShuffle,
        setIsShuffle,
        likedSongs,
        toggleLike,
        isLiked,
        playSong,
        playNext,
        playPrev,
        deleteTrack,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};


export default SongContext;
