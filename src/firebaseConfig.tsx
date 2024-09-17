import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPJw44_2hldqrxv50u3uq-KhSo3OFOkMA",
  authDomain: "focal-point-6b244.firebaseapp.com",
  projectId: "focal-point-6b244",
  storageBucket: "focal-point-6b244.appspot.com",
  messagingSenderId: "758325449894",
  appId: "1:758325449894:web:7371ddb09b0bb03dadd067"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export type { User } from 'firebase/auth';