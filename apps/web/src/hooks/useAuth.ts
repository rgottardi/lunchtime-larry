import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Fetch user profile
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        // If profile doesn't exist, redirect to profile setup
        if (!userSnap.exists() && router.pathname !== '/profile/setup') {
          router.push('/profile/setup');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signin = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return { user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error.message,
      };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      return { user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error.message,
      };
    }
  };

  const signout = async () => {
    try {
      await signOut(auth);
      router.push('/');
      return { error: null };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  };

  const signinWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      return { user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error.message,
      };
    }
  };

  return {
    user,
    loading,
    signin,
    signup,
    signout,
    signinWithGoogle,
  };
}