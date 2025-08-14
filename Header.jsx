// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Header({ user, onSignOut }) {
  return (
    <div className="header">
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <img src="/logo.png" alt="logo" style={{width:36,height:36,borderRadius:8}}/>
        <Link to="/" style={{textDecoration:'none', color:'#111', fontWeight:700}}>Mohit Chat</Link>
      </div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        {user ? <>
          <Link to={`/profile/${user.uid}`} style={{textDecoration:'none'}}>{user.displayName || user.phoneNumber || user.email}</Link>
          <button className="btn" onClick={onSignOut}>Sign out</button>
        </> : <Link to="/auth"><button className="btn">Sign in</button></Link>}
      </div>
    </div>
  );
}
