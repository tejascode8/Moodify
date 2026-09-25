import React from "react";
import Navbar from "../../shared/components/Navbar";
import Playlist from "../components/Playlist";
import Player from "../components/player";
import { useSong } from "../hooks/useSong";

export default function PlaylistPage() {
  const { playlist, changeMood } = useSong();

  return (
    <div className="home-container">
      <Navbar />
      <main className="home-main">
        <Playlist songs={playlist} onSelectMood={(mood) => changeMood(mood, false)} />
      </main>
      <Player />
    </div>
  );
}
