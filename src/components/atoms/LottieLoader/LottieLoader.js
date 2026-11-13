"use client";
import { Player } from "@lottiefiles/react-lottie-player";

import classes from "./LottieLoader.module.css";

const LottieLoader = ({ className }) => {
  return (
    <div className={`${classes?.container} ${className && className}`}>
      <Player
        autoplay
        loop
        src={"/lottie/loadingSecondary.json"}
        style={{ height: "300px", width: "300px" }}
      ></Player>
    </div>
  );
};

export default LottieLoader;
``;
