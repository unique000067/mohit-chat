// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/index.css"; // alias usage

import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

function AppRouter() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile/:uid" element={<Profile currentUser={user} />} />
        <Route path="/admin" element={<Admin currentUser={user} />} />
        <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<AppRouter />);
