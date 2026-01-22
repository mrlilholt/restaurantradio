import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'; 
import { auth, db } from '../utils/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [favorites, setFavorites] = useState([]); 
  
  // 1. ADD NEW STATE FOR USER DATA
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data); // Save full data to check createdAt
                setIsPro(data.isPro || data.earnedFreeAccess || false);
                setFavorites(data.favorites || []);
            }
        });
      } else {
        setIsPro(false);
        setUserData(null);
        setFavorites([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 2. ADD THE TRIAL CALCULATION
  // Inside AuthProvider...

const getTrialStatus = () => {
  if (isPro) return { active: true, daysLeft: null };
  if (!userData?.createdAt) return { active: true, daysLeft: 7 };

  const now = new Date();
  const signupDate = userData.createdAt.toDate();
  const diffInMs = now - signupDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  const daysLeft = Math.max(0, 7 - diffInDays);
  return {
    active: daysLeft > 0,
    daysLeft: daysLeft
  };
};

const trialStatus = getTrialStatus();

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    // Only run this if it's a NEW user
    if (!snap.exists()) {
        // 1. GET THE CODE (Must match 'referralCode' from App.jsx)
        const storedReferralCode = localStorage.getItem('referralCode'); 
        
        await setDoc(userRef, { 
            email: user.email,
            isPro: false, 
            createdAt: serverTimestamp(),
            favorites: [],
            
            // 2. REFERRAL SETUP (Your robust version)
            referralCode: user.uid,            // Their own code to share
            referredBy: storedReferralCode || null, // Who invited them
            referralCount: 0,                  // Start at 0
            earnedFreeAccess: false            // Start as false
        }, { merge: true });
    }
  };

  const emailSignUp = async (email, password) => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // 1. GET THE CODE
      const storedReferralCode = localStorage.getItem('referralCode');

      await setDoc(doc(db, 'users', user.uid), { 
        email: user.email, 
        isPro: false,
        createdAt: serverTimestamp(),
        favorites: [],
        
        // 2. REFERRAL SETUP
        referralCode: user.uid,
        referredBy: storedReferralCode || null,
        referralCount: 0,
        earnedFreeAccess: false
      });
  };

  const emailSignIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    isPro,
    favorites,      
    googleSignIn,
    emailSignUp,
    userData,
    emailSignIn,
    logout,
    accessStatus: {
        hasAccess: trialStatus.active,
        daysLeft: trialStatus.daysLeft,
        plan: isPro ? 'premium' : 'trial'
    },
    isTrialActive: trialStatus.active,
    trialDaysLeft: trialStatus.daysLeft 
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
