// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { firebaseConfig } from './firebaseConfig';

const firebaseConfig = {
  apiKey: "AIzaSyCZzhbFyWZNfm8pg8oyEl_TUOAJopaDGFo",
  authDomain: "proof-of-heist-quiz.firebaseapp.com",
  projectId: "proof-of-heist-quiz",
  storageBucket: "proof-of-heist-quiz.firebasestorage.app",
  messagingSenderId: "80703880832",
  appId: "1:80703880832:web:491f52269e669a71f73065"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
