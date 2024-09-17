import { auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogIn } from 'lucide-react';

export function LoginComponent() {
  const [user] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const signInWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        console.error("Error signing in with email and password", error);
      });
  };

  const signOut = () => {
    auth.signOut();
  };

  const LoginContent = () => (
    <div className="flex flex-col space-y-4">
      <Button onClick={signInWithGoogle}>Sign In with Google</Button>
      <form onSubmit={signInWithEmail} className="flex flex-col space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Sign In with Email</Button>
      </form>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" />
          {user ? 'Logout' : 'Login'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>{user ? 'Logout' : 'Login'}</DialogTitle>
          <DialogDescription>
            {user ? 'Are you sure you want to logout?' : 'Enter your credentials to log in.'}
          </DialogDescription>
        </DialogHeader>
        {user ? (
          <Button onClick={signOut}>Sign Out</Button>
        ) : (
          <LoginContent />
        )}
      </DialogContent>
    </Dialog>
  );
}
