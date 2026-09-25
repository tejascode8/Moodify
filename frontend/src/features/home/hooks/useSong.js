import { useContext } from "react";
import SongContext from "../service/SongContext";

export const useSong = () => {
  const context = useContext(SongContext);

  if (!context) {
    throw new Error("useSong must be used within a SongContextProvider");
  }

  const {
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
  } = context;

  const handleGetSong = async ({ mood, autoPlay = true }) => {
    await changeMood(mood, autoPlay);
  };

  return {
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
    handleGetSong,
  };
};

