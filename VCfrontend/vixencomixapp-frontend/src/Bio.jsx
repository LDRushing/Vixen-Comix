import "./App.css";

export default function Bio() {
  return (
    <div className="bio-container">
      <h2>About Vixen Comix!</h2>
      <div className="bio-content">
        <div className="bio-image">
          <img src="/selfportraitsite2026.png" alt="Lucy Rushing - Creator of Vixen Comix" />
        </div>
        <div className="bio-text">
          <p>Vixen Comix is a small comics name started by Lucy Rushing. Currently working out of Fort Worth, TX, Lucy creates comics inspired by classic Disney, Don Bluth and her Christian upbringing. Her favorite things in life are her faith, her family and Winnie the Pooh.</p>
        </div>
      </div>
    </div>
  );
}