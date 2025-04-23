'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserCredential | void>;
  signInWithGoogle: () => Promise<UserCredential | void>;
  signUp: (email: string, password: string) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run auth state observer on client side
    if (typeof window !== 'undefined') {
      console.log('Setting up Firebase Auth state observer');
      try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
          setUser(user);
          setLoading(false);
        }, (error) => {
          console.error('Firebase auth error:', error);
          setError(error.message);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (err) {
        console.error('Error setting up auth state observer:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
        setLoading(false);
      }
    } else {
      // If we're on the server, set loading to false immediately
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string): Promise<UserCredential | void> => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', result.user.email);
      return result;
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    }
  };

  const signIn = async (email: string, password: string): Promise<UserCredential | void> => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', result.user.email);
      return result;
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    }
  };

  const signInWithGoogle = async (): Promise<UserCredential | void> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in with Google:', result.user.email);
      return result;
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      console.log('User signed out');
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 