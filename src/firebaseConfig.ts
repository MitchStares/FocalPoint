import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

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
const auth = getAuth(app);

export function FirebaseAuth() {
  const [user] = useAuthState(auth);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setToken);
    }
  }, [user]);

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const signOut = () => {
    auth.signOut();
    setToken(null);
  };

  return (
    <div>
      {user ? (
        <Button onClick={signOut}>Sign Out</Button>
      ) : (
        <Button onClick={signIn}>Sign In with Google</Button>
      )}
    </div>
  );
}

export { auth, User };