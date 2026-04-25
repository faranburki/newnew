import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// Create Auth Context
const AuthContext = createContext();

// Auth Context Provider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Register user with role
  const register = async (email, password, role, name = "", additionalData = {}) => {
    try {
      setError(null);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore with role and name
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name || user.displayName || email.split("@")[0],
        email: user.email,
        role: role, // 'patient' or 'doctor'
        createdAt: new Date(),
        ...additionalData,
      });

      // Special handling for doctors
      if (role === "doctor") {
        await setDoc(doc(db, "doctors", user.uid), {
          name: name || user.displayName || email.split("@")[0],
          specialty: "General Physician", // Default
          fee: 1000, // Default
          availabilityStatus: true, // Default to available
          rating: 4.5, // Starting rating
          bio: "Medical professional dedicated to patient care.",
          pmdc_number: "Not Verified",
        });
      }

      setCurrentUser(user);
      setUserRole(role);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }

      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, fetch their role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (err) {
          setError(err.message);
        }
        setCurrentUser(user);
      } else {
        // User is logged out
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
