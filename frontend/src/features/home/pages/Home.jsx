import React from "react";
import FaceExpression from "../../expressions/components/FaceExpression";
import Player from "../components/player";
import { useSong } from "../hooks/useSong";
import PlaylistPage from "./PlaylistPage";

const Home = () => {
  const { handleGetSong } = useSong();

  return (
    <>
      <FaceExpression
        onClick={(expression) => {
          handleGetSong({
            mood: expression,
          });
        }}
      ></FaceExpression>
      <Player />
      {/* <PlaylistPage /> */}
    </>
  );
};

export default Home;
