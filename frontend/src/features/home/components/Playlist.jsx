import React from "react";

export default function Playlist({ songs, playSong }) {
  if (!songs) return <p>No songs available</p>;

  return (
    <div>
      {songs.map((song, index) => (
        <div key={song._id || index} onClick={() => playSong(index)}>
          <img src={song.posterUrl} alt={song.title} width="80" />
          <p>{song.title}</p>
        </div>
      ))}
    </div>
  );
}
