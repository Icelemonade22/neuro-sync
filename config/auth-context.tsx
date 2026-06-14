// This file defines the authentication context for the application, providing functions
// for signing up, signing in, logging out, and resetting passwords using Firebase Authentication.
// It also manages the user's online status in Firestore and provides a context for accessing
// authentication state throughout the app.
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";

// Define the shape of the authentication context, including the user object,
// loading state, and functions for authentication actions
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
};

// Create the authentication context with an initial value of undefined,
// which will be provided by the AuthProvider component
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component wraps the application and provides the authentication context to its children.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes and update the user state accordingly.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Update the user state with the current user object, which will be null if
      // no user is logged in.
      setUser(currentUser);

      // If a user is logged in, update their online status in Firestore.
      // If the user document doesn't exist, create it.
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        // If the user document exists, update the online status and last active timestamp.
        if (userSnap.exists()) {
          await updateDoc(userRef, {
            online: true,
            lastActive: serverTimestamp(),
          });
        } else {
          // If the user document doesn't exist, create it with the user's information
          // and online status.
          await setDoc(
            userRef,
            {
              uid: currentUser.uid,
              email: currentUser.email,
              online: true,
              lastActive: serverTimestamp(),
            },
            { merge: true },
          );
        }
      }
      setLoading(false);
    });

    // Clean up the authentication state listener when the component unmounts to prevent
    // memory leaks.
    return unsubscribe;
  }, []);

  // Function to handle user sign-up using Firebase Authentication.
  // It returns null on success or an error message on failure.
  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred during signup";
    }
  };

  // Function to handle user sign-in using Firebase Authentication.
  // It returns null on success or an error message on failure.
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred during signin";
    }
  };

  // Function to handle user logout.
  // It updates the user's online status in Firestore before signing out from
  // Firebase Authentication.
  const logout = async () => {
    if (auth.currentUser) {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          online: false,
          lastActive: serverTimestamp(),
        },
        { merge: true },
      );
    }

    await signOut(auth);
  };

  // Function to handle password reset by sending a password reset email using
  // Firebase Authentication.
  const resetPassword = async (email: string) => {
    try {
      // Send a password reset email using Firebase Authentication.
      // If successful, return null.
      await sendPasswordResetEmail(auth, email);
      return null;
    } catch (error) {
      // Return the error message if it's an instance of Error, otherwise return a
      // generic error message.
      if (error instanceof Error) return error.message;
      return "An error occurred while sending reset email";
    }
  };

  // Provide the authentication context to child components,
  // including the user object, loading state, and authentication functions.
  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access the authentication context.
// It ensures that the hook is used within an AuthProvider and returns the
// context value.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
