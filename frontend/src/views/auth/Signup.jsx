import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../state/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Signup(){
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)

  const onChange = (e)=> setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e)=>{
    e.preventDefault()
    if(!form.name || !form.email || !form.password || !form.confirm) return toast.error('All fields are required')
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return toast.error('Invalid email')
    if(form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if(form.password !== form.confirm) return toast.error('Passwords do not match')
    try{
      setLoading(true)
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.name })
      await setDoc(doc(db, 'users', cred.user.uid), { name: form.name, email: form.email, createdAt: serverTimestamp() })
      toast.success('Signup successful. Please login.')
      navigate('/login')
    } catch(err){
      toast.error(err.message)
    } finally{
      setLoading(false)
    }
  }

  return (
    <section className="max-w-md mx-auto">
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="font-poppins text-2xl font-bold">Create account</motion.h2>
      <form onSubmit={onSubmit} className="mt-6 card p-6 space-y-4">
        <div>
          <label className="text-sm text-white/70">Name</label>
          <input name="name" value={form.name} onChange={onChange} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40" />
        </div>
        <div>
          <label className="text-sm text-white/70">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40" />
        </div>
        <div>
          <label className="text-sm text-white/70">Password</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40" />
        </div>
        <div>
          <label className="text-sm text-white/70">Confirm Password</label>
          <input type="password" name="confirm" value={form.confirm} onChange={onChange} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40" />
        </div>
        <button disabled={loading} className={`btn-primary w-full ${loading?'opacity-50 cursor-not-allowed':''}`}>Sign up</button>
        <p className="text-sm text-white/60">Already have an account? <Link to="/login" className="text-neon-blue">Login</Link></p>
      </form>
    </section>
  )
}


