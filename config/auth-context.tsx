// import { createContext, useContext } from "react";
// import { auth } from "./firebase";

// type AuthContextType = {
//   //user: FirebaseAuthTypes.User<FirebaseAuthTypes.Preferences> | null;
//   signUp: (email: string, password: string) => Promise<string | null>;
//   signIn: (email: string, password: string) => Promise<string | null>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const signUp = async (email: string, password: string) => {
//     try {
//       await auth.create(email, password);
//       await signIn(email, password);
//       return null;
//     } catch (error) {
//       if (error instanceof Error) {
//         return error.message;
//       }
//       return "An error occured during signup";
//     }
//   };
//   const signIn = async (email: string, password: string) => {
//     try {
//       await auth.createEmailPasswordSession(email, password);
//       return null;
//     } catch (error) {
//       if (error instanceof Error) {
//         return error.message;
//       }
//       return "An error occured during signin";
//     }
//   };
//   return (
//     <AuthContext.Provider value={{ user, signUp, signIn }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//     const context = useContext(AuthContext)
// }

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

type AuthContextType = {
  user: User | null;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred during signup";
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred during signin";
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred while sending reset email.";
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, signUp, signIn, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
