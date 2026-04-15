import React from "react";
import { useRef } from "react";
import { SongContext } from "../service/SongContext";
import { useSong } from "../hooks/useSong";

export default function MusicPlayer({ song }) {
  const audioRef = useRef();

  return (
    <div>
      <audio ref={audioRef} src={song?.url} controls autoPlay />
    </div>
  );
}
