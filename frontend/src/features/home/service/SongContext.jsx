import React from "react";
import { useState } from "react";
import { createContext } from "react";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  const [song, setSong] = useState({
    url: "https://ik.imagekit.io/y2zxdkmq5/cohort-2/moodify/songs/Naino_Ke_Saamne__DOWNLOAD_MING__fZ6kUxai7p.mp3",
    posterUrl:
      "https://ik.imagekit.io/y2zxdkmq5/cohort-2/moodify/posters/Naino_Ke_Saamne__DOWNLOAD_MING__GFbzQ2hry.jpeg",
    title: "Naino Ke Saamne [DOWNLOAD MING]",
    mood: "happy",
  });

  const [loading, setLoading] = useState(false);
  return (
    <SongContext.Provider value={{ loading, setLoading, song, setSong }}>
      {children}
    </SongContext.Provider>
  );
};

export default SongContext;
