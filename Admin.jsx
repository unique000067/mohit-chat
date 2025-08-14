// src/pages/Admin.jsx
import React from "react";
import Header from "../components/Header";
import { auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const ADMIN_EMAIL = "c8376325@gmail.com"; // admin

export default function Admin({ currentUser }) {
  const [users, setUsers] = React.useState([]);
  const [echoes, setEchoes] = React.useState([]);

  React.useEffect(()=> {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;
    const uQ = query(collection(db, "users"), orderBy("createdAt","desc"));
    const eQ = query(collection(db, "echo"), orderBy("createdAt","desc"));
    const unsubU = onSnapshot(uQ, s => setUsers(s.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubE = onSnapshot(eQ, s => setEchoes(s.docs.map(d=>({id:d.id,...d.data()}))));
    return ()=>{ unsubU(); unsubE(); };
  }, [currentUser]);

  if (!currentUser) return <div style={{padding:20}}>Sign in as admin to view this page.</div>;
  if (currentUser.email !== ADMIN_EMAIL) return <div style={{padding:20}}>Access denied. Admin only.</div>;

  async function deleteEcho(id) {
    if (!confirm("Delete this echo?")) return;
    await deleteDoc(doc(db, "echo", id));
  }

  async function blockUser(id) {
    await updateDoc(doc(db, "users", id), { blocked: true });
    alert("User blocked");
  }

  return (
    <>
      <Header user={currentUser} onSignOut={()=>auth.signOut()} />
      <div className="container">
        <div className="card">
          <h3>Admin Panel</h3>
          <h4>Users</h4>
          {users.map(u => (
            <div key={u.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0'}}>
              <div><strong>{u.displayName}</strong> <div className="small">@{u.username} • {u.email}</div></div>
              <div>
                <button className="btn" onClick={()=>blockUser(u.id)}>Block</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h4>Echoes</h4>
          {echoes.map(e => (
            <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0'}}>
              <div><div style={{fontWeight:700}}>{e.content}</div><div className="small">by {e.authorId}</div></div>
              <div><button className="btn" onClick={()=>deleteEcho(e.id)}>Delete</button></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
