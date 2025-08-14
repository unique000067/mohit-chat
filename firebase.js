// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCNctFUQpl8UCn2oDly2IyHlB9tHTR12XE",
  authDomain: "mohit-chat-ec9ed.firebaseapp.com",
  projectId: "mohit-chat-ec9ed",
  storageBucket: "mohit-chat-ec9ed.appspot.com",
  messagingSenderId: "747506881046",
  appId: "1:747506881046:web:2a233d8e03088338e8db37",
  measurementId: "G-X77X7S7HB8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export function createRecaptcha(containerId = "recaptcha-container") {
  // ensures a hidden div exists for reCAPTCHA
  if (!document.getElementById(containerId)) {
    const d = document.createElement("div");
    d.id = containerId;
    d.style.display = "none";
    document.body.appendChild(d);
  }
  return new RecaptchaVerifier(containerId, { size: "invisible" }, auth);
}
