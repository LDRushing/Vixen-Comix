import React from "react";             // ✅ React must be imported
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav>
      <Link to="/">Home</Link> | 
      <Link to="/bio">Bio</Link> | 
      <Link to="/comics">Comics</Link> | 
      <Link to="/prints">Prints</Link> | 
      <Link to="/film">Film Project</Link> | 
      <Link to="/contact">Contact</Link> | 
      <Link to="/login">Login</Link> | 
      <Link to="/register">Register</Link>
    </nav>
  );
}
