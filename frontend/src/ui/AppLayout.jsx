import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCog, UploadCloud, Home, LayoutGrid, Moon, Sun, LogIn, UserPlus, User, LogOut } from 'lucide-react'
import { useAuth } from '../state/AuthContext.jsx'

function Navbar({ isDark, toggleDark }) {
  const { user, profile, logout } = useAuth()
  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-5 glass rounded-2xl border border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <NavLink to="/" className="flex items-center gap-2">
              <BrainCog className="text-neon-cyan" />
              <span className="font-poppins text-lg font-bold tracking-wide">AI Pneumonia Detector</span>
            </NavLink>
            <div className="flex items-center gap-2">
              <NavLink to="/" className={({isActive})=>`btn-ghost ${isActive? 'bg-white/10':''}`}><Home size={18}/> Home</NavLink>
              <NavLink to="/upload" className={({isActive})=>`btn-ghost ${isActive? 'bg-white/10':''}`}><UploadCloud size={18}/> Start Diagnosis</NavLink>
              <NavLink to="/dashboard" className={({isActive})=>`btn-ghost ${isActive? 'bg-white/10':''}`}><LayoutGrid size={18}/> Dashboard</NavLink>
              <button onClick={toggleDark} className="btn-ghost" aria-label="Toggle dark mode">
                {isDark ? <Sun size={18}/> : <Moon size={18}/>} Theme
              </button>
              {!user && (
                <>
                  <NavLink to="/login" className={({isActive})=>`btn-ghost ${isActive? 'bg-white/10':''}`}><LogIn size={18}/> Login</NavLink>
                  <NavLink to="/signup" className={({isActive})=>`btn-ghost ${isActive? 'bg-white/10':''}`}><UserPlus size={18}/> Signup</NavLink>
                </>
              )}
              {user && (
                <>
                  <NavLink to="/profile" className={({isActive})=>`btn-ghost ${isActive? 'bg-white/10':''}`}><User size={18}/> {profile?.name || 'Profile'}</NavLink>
                  <button onClick={logout} className="btn-ghost"><LogOut size={18}/> Logout</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 py-8 text-center text-sm text-white/70">
      <p>This is a demo for hackathon purposes. Not for clinical use.</p>
      <p className="mt-2">Team NeoMed • Hackathon 2025</p>
    </footer>
  )
}

export default function AppLayout() {
  const location = useLocation()
  const [isDark, setIsDark] = useState(true)

  useEffect(()=>{
    const root = document.documentElement
    if(isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  },[isDark])

  return (
    <div className="min-h-screen neon-gradient">
      <Navbar isDark={isDark} toggleDark={()=>setIsDark(v=>!v)} />
      <main className="mx-auto max-w-7xl px-4 pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <Footer />
      </main>
    </div>
  )
}


