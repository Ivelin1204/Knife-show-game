import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbDpbBpK6CSR2jZcFcRkE1KLofWx1XIJ0",
  authDomain: "knife-show.firebaseapp.com",
  projectId: "knife-show",
  storageBucket: "knife-show.firebasestorage.app",
  messagingSenderId: "34751794046",
  appId: "1:34751794046:web:7f084dcec09fc7f41c812f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const scoresRef = collection(db, "scores");

export async function submitScore(name, score, level) {
  try {
    await addDoc(scoresRef, {
      name: String(name || "Player").slice(0, 20),
      score: Math.max(0, Math.floor(Number(score) || 0)),
      level: Math.max(0, Math.floor(Number(level) || 0)),
      ts: serverTimestamp(),
    });
  } catch (err) {
    console.error("submitScore failed:", err);
  }
}

export async function fetchTopScores(topN = 20) {
  try {
    const q = query(scoresRef, orderBy("score", "desc"), limit(topN));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("fetchTopScores failed:", err);
    return [];
  }
}
