// src/pages/Profile.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, storage, auth } from "../firebase";
import Header from "../components/Header";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile({ currentUser }) {
  const { uid } = useParams();
  const [profile, setProfile] = React.useState(null);
  const [bio, setBio] = React.useState("");
  const me = auth.currentUser;

  React.useEffect(() => {
    async function load() {
      if (!uid) return;
      const d = await getDoc(doc(db, "users", uid));
      if (d.exists()) {
        setProfile(d.data());
        setBio(d.data().bio || "");
      } else {
        // fallback: create basic public user doc if missing
        await setDoc(doc(db, "users", uid), { createdAt: serverTimestamp() }, { merge: true });
        const d2 = await getDoc(doc(db, "users", uid));
        setProfile(d2.data());
      }
    }
    load();
  }, [uid]);

  async function saveBio() {
    if (!me || me.uid !== uid) return alert("Only owner can edit");
    await setDoc(doc(db, "users", uid), { bio, updatedAt: serverTimestamp() }, { merge: true });
    alert("Saved");
  }

  async function uploadImage(e) {
    if (!me || me.uid !== uid) return alert("Only owner can edit");
    const f = e.target.files[0];
    if (!f) return;
    const r = ref(storage, `profile_images/${uid}/${f.name}`);
    await uploadBytes(r, f);
    const url = await getDownloadURL(r);
    await setDoc(doc(db, "users", uid), { profileImageUrl: url, updatedAt: serverTimestamp() }, { merge: true });
    setProfile(prev=> ({...prev, profileImageUrl: url}));
  }

  return (
    <>
      <Header user={currentUser} onSignOut={()=>import("firebase/auth").then(m=>m.signOut())} />
      <div className="container">
        <div className="card">
          <h3>Profile</h3>
          {profile ? <>
            <img src={profile.profileImageUrl || "/logo.png"} alt="" className="profile-img" />
            <div style={{fontWeight:700}}>{profile.displayName || 'User'}</div>
            <div className="small">@{profile.username || ''}</div>
            <div className="small">{profile.email || ''}</div>
            <p>{profile.bio}</p>
            {currentUser && currentUser.uid === uid && <>
              <input type="file" onChange={uploadImage} />
              <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} style={{width:'100%'}} />
              <button className="btn" onClick={saveBio}>Save</button>
            </>}
          </> : <div>Loading...</div>}
        </div>
      </div>
    </>
  );
}
