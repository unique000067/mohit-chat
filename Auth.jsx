// src/pages/Auth.jsx
import React from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithPhoneNumber } from "firebase/auth";
import { auth, createRecaptcha, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Header from "../components/Header";

export default function Auth() {
  const [phone, setPhone] = React.useState("");
  const [verificationCode, setVerificationCode] = React.useState("");
  const [confirmationResult, setConfirmationResult] = React.useState(null);
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(()=> {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  },[]);

  async function googleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      const u = res.user;
      // Upsert user doc
      await setDoc(doc(db, "users", u.uid), {
        username: (u.displayName || "user").replace(/\s+/g,'').toLowerCase(),
        email: u.email,
        displayName: u.displayName,
        createdAt: serverTimestamp(),
        bio: "",
        profileImageUrl: u.photoURL || null
      }, { merge: true });
    } catch (e) { alert(e.message); }
  }

  async function startPhone() {
    try {
      const verifier = createRecaptcha();
      const res = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(res);
      alert("OTP sent");
    } catch (e) { alert(e.message); }
  }

  async function verifyCode() {
    try {
      if (!confirmationResult) return alert("request otp first");
      const cred = await confirmationResult.confirm(verificationCode);
      const u = cred.user;
      await setDoc(doc(db, "users", u.uid), {
        username: (u.phoneNumber || "user").replace(/\D+/g,''),
        email: u.email || null,
        displayName: u.displayName || u.phoneNumber,
        createdAt: serverTimestamp(),
        bio: "",
        profileImageUrl: u.photoURL || null
      }, { merge: true });
    } catch (e) { alert(e.message); }
  }

  async function signOutNow() { await signOut(auth); }

  return (
    <>
      <Header user={user} onSignOut={signOutNow} />
      <div className="container">
        <div className="card">
          <h3>Sign in</h3>
          <button className="btn" onClick={googleSignIn}>Sign in with Google</button>
          <hr />
          <div>
            <input placeholder="+91xxxxxxxxxx" value={phone} onChange={e=>setPhone(e.target.value)} />
            <button className="btn" onClick={startPhone}>Send OTP</button>
            <div style={{marginTop:8}}>
              <input placeholder="Enter OTP" value={verificationCode} onChange={e=>setVerificationCode(e.target.value)} />
              <button className="btn" onClick={verifyCode}>Verify OTP</button>
            </div>
            <div id="recaptcha-container"></div>
          </div>
        </div>

        <div className="card">
          <h4>Developer contact</h4>
          <p>Mohit Donawat</p>
          <p><a href="mailto:c8376325@gmail.com">c8376325@gmail.com</a></p>
          <p><a target="_blank" rel="noreferrer" href="https://instagram.com/mohit.donawat.unique">instagram/mohit.donawat.unique</a></p>
        </div>
      </div>
      <div className="footer-watermark">
        <img src="/logo.png" alt="logo" style={{width:18,height:18,verticalAlign:'middle'}} /> © Mohit Donawat
      </div>
    </>
  );
}
