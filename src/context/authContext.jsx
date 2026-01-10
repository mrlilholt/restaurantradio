import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Login Function
  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // 2. Logout Function
  const logout = () => signOut(auth);

  // 3. Check Trial Status
  const checkAccess = (profile) => {
    if (!profile) return { hasAccess: false };
    if (profile.isPremium) return { hasAccess: true, plan: 'lifetime' };

    // Calculate trial days left
    const now = new Date();
    const created = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays <= 7) {
      return { hasAccess: true, plan: 'trial', daysLeft: 7 - diffDays };
    } else {
      return { hasAccess: false, reason: 'trial_expired' };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          // New User? Start Trial NOW.
          const newProfile = {
            email: user.email,
            createdAt: serverTimestamp(),
            isPremium: false, 
          };
          await setDoc(userRef, newProfile);
          // Fake timestamp for immediate UI update
          setUserProfile({ ...newProfile, createdAt: { toDate: () => new Date() } }); 
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const accessStatus = checkAccess(userProfile);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, accessStatus, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}