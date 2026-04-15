import { useEffect, useState } from "react";
import { getSong } from "../service/song.api";
import Playlist from "../components/Playlist";
import MusicPlayer from "../components/MusicPlayer";
import FaceExpression from "../../expressions/components/FaceExpression";

export default function PlaylistPage() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getSong("happy").then((data) => {
      setSongs(data.songs);
    });
  }, []);

  return (
    <div>
      <Playlist songs={songs} playSong={setCurrentIndex} />

      <MusicPlayer song={songs[currentIndex]} />
    </div>
  );
}
