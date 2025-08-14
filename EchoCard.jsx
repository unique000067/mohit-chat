// src/components/EchoCard.jsx
import React from "react";
import { doc, collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EchoCard({ echo, currentUser, refresh }) {
  const [likesCount, setLikesCount] = React.useState(echo.likesCount || 0);
  const [liked, setLiked] = React.useState(false);
  const [repliesCount, setRepliesCount] = React.useState(echo.repliesCount || 0);

  React.useEffect(() => {
    // Quick counts are read from echo document if present (denormalized), otherwise can be calculated
    setLikesCount(echo.likesCount || 0);
    setRepliesCount(echo.repliesCount || 0);
    if (!currentUser) { setLiked(false); return; }
    // check if current user already liked (simple query)
    (async () => {
      const q = query(collection(db, "likes"), where("echoId", "==", echo.id), where("userId", "==", currentUser.uid));
      const s = await getDocs(q);
      setLiked(!s.empty);
    })();
  }, [echo, currentUser]);

  async function doLike() {
    if (!currentUser) return alert("Sign in first");
    if (liked) {
      // remove like
      const q = query(collection(db, "likes"), where("echoId", "==", echo.id), where("userId", "==", currentUser.uid));
      const s = await getDocs(q);
      for (const d of s.docs) await deleteDoc(doc(db, "likes", d.id));
      setLiked(false);
      setLikesCount(c => Math.max(0, c - 1));
      if (refresh) refresh();
      return;
    }
    await addDoc(collection(db, "likes"), {
      userId: currentUser.uid,
      echoId: echo.id,
      createdAt: serverTimestamp()
    });
    setLiked(true);
    setLikesCount(c => c + 1);
    if (refresh) refresh();
  }

  async function doReply() {
    if (!currentUser) return alert("Sign in first");
    const content = prompt("Reply:");
    if (!content) return;
    await addDoc(collection(db, "replies"), {
      authorId: currentUser.uid,
      echoId: echo.id,
      content,
      createdAt: serverTimestamp()
    });
    setRepliesCount(c => c + 1);
    if (refresh) refresh();
  }

  return (
    <div className="card">
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <img src={echo.author?.profileImageUrl || '/logo.png'} alt="" className="profile-img" />
        <div>
          <div style={{fontWeight:700}}>{echo.author?.displayName || 'Anonymous'} <span className="small">@{echo.author?.username || ''}</span></div>
          <div className="small">{new Date(echo.createdAt?.toDate ? echo.createdAt.toDate() : echo.createdAt || Date.now()).toLocaleString()}</div>
        </div>
      </div>
      <div className="echotext">{echo.content}</div>
      <div style={{display:'flex',gap:12,marginTop:10}}>
        <button className="btn" onClick={doLike}>{liked ? 'Unlike' : 'Like'} ({likesCount})</button>
        <button className="btn" onClick={doReply}>Reply ({repliesCount})</button>
      </div>
    </div>
  );
}
