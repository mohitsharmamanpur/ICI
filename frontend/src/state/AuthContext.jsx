import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dev',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dev',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE || 'dev',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || 'dev',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'dev',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      setUser(u)
      if(u){
        const snap = await getDoc(doc(db, 'users', u.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return ()=>unsub()
  },[])

  const logout = async ()=>{ await signOut(auth) }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }


