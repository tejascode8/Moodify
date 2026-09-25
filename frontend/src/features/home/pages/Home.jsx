import React, { useState, useEffect } from "react";
import Navbar from "../../shared/components/Navbar";
import FaceExpression from "../../expressions/components/FaceExpression";
import Playlist from "../components/Playlist";
import Player from "../components/player";
import UploadModal from "../components/UploadModal";
import LikedDrawer from "../components/LikedDrawer";
import { staggerEntrance } from "../../shared/utils/gsapAnimations";
import { useSong } from "../hooks/useSong";
import MoodAtmosphere from "../../shared/components/MoodAtmosphere";
import "../style/Home.scss";

export default function Home() {
  const { handleGetSong, currentMood, playlist } = useSong();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLikedOpen, setIsLikedOpen] = useState(false);

  // GSAP Smooth Stagger Entrance on mount
  useEffect(() => {
    staggerEntrance([".page-header", ".camera-section", ".playlist-container"], {
      delay: 0.1,
      stagger: 0.12,
      duration: 0.7,
    });
  }, []);

  const onMoodScan = (detectedMood) => {
    handleGetSong({ mood: detectedMood, autoPlay: true });
  };

  const onTabSelectMood = (selectedMood) => {
    handleGetSong({ mood: selectedMood, autoPlay: false });
  };

  return (
    <div className="app-layout">
      {/* Dynamic Mood-Adaptive Atmosphere & Floating Badges */}
      <MoodAtmosphere currentMood={currentMood} />

      {/* Site Navigation */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenLiked={() => setIsLikedOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Clean Page Title Header */}
        <div className="page-header">
          <div className="hero-status-tag">
            <span>AI Real-Time Emotion Recognition Engine</span>
          </div>
          <h1>Emotion-Responsive Music</h1>
          <p>Real-time facial expression analysis to curate soundtracks matching your current state.</p>
        </div>

        {/* AI Camera Emotion Card with Clean Audio Visualizer */}
        <FaceExpression
          onMoodDetected={onMoodScan}
          currentActiveMood={currentMood}
        />

        {/* Curated Soundtracks Playlist */}
        <Playlist
          songs={playlist}
          onSelectMood={onTabSelectMood}
        />
      </main>

      {/* Sleek Fixed Audio Player */}
      <Player />

      {/* Upload Track Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Liked Tracks Drawer */}
      <LikedDrawer
        isOpen={isLikedOpen}
        onClose={() => setIsLikedOpen(false)}
      />
    </div>
  );
}
