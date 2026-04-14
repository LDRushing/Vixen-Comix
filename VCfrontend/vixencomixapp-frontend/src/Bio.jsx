import React from "react";

export default function Bio() {
  return (
    <div className="bio-container">
      <h2>About Vixen Comix!</h2>
      <div className="bio-content">
        <div className="bio-image">
          <img 
            src="/selfportraitsite2026.png" 
            alt="Lucy Rushing - Creator of Vixen Comix" 
          />
        </div>
        <div className="bio-text">
          <p className="indented-paragraph">
            Vixen Comix is a small comics handle started by art hobbyist, Lucy Rushing. 
            Currently working out of Fort Worth, TX, Lucy creates comics inspired by 
            classic Disney, Don Bluth, and her Christian upbringing. Her work often 
            explores themes of faith and perseverance through a mystical, hand-drawn lens.
          </p>
          <p className="indented-paragraph">
            Beyond the drawing board, Lucy finds joy in the simple things. Her favorite 
            things in life are her faith, her family, and the whimsical world of 
            Winnie the Pooh. Whether she's exploring the trails of Texas or planning 
            the next chapter of Annwn, she aims to bring a touch of classic animation 
            magic to the modern webcomic scene.
          </p>
        </div>
      </div>
    </div>
  );
}