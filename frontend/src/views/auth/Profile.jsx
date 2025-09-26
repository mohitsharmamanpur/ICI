import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../state/AuthContext.jsx'

export default function Profile(){
  const { user, profile } = useAuth()
  return (
    <section className="max-w-md mx-auto">
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="font-poppins text-2xl font-bold">Your Profile</motion.h2>
      <div className="mt-6 card p-6 space-y-3">
        <div><span className="text-white/60 text-sm">Name</span><div className="mt-1">{profile?.name || user?.displayName || '—'}</div></div>
        <div><span className="text-white/60 text-sm">Email</span><div className="mt-1">{user?.email}</div></div>
        <div><span className="text-white/60 text-sm">Join Date</span><div className="mt-1">{user?.metadata?.creationTime || '—'}</div></div>
      </div>
    </section>
  )
}


