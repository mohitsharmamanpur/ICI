import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../state/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Login(){
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/upload'
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  const onChange = (e)=> setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e)=>{
    e.preventDefault()
    try{
      setLoading(true)
      await signInWithEmailAndPassword(auth, form.email, form.password)
      toast.success('Welcome back!')
      navigate(redirectTo, { replace: true })
    } catch(err){
      toast.error(err.message)
    } finally{
      setLoading(false)
    }
  }

  const onReset = async ()=>{
    if(!form.email) return toast.error('Enter your email to reset password')
    try{
      await sendPasswordResetEmail(auth, form.email)
      toast.success('Password reset email sent')
    } catch(err){ toast.error(err.message) }
  }

  return (
    <section className="max-w-md mx-auto">
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="font-poppins text-2xl font-bold">Login</motion.h2>
      <form onSubmit={onSubmit} className="mt-6 card p-6 space-y-4">
        <div>
          <label className="text-sm text-white/70">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40" />
        </div>
        <div>
          <label className="text-sm text-white/70">Password</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40" />
        </div>
        <button disabled={loading} className={`btn-primary w-full ${loading?'opacity-50 cursor-not-allowed':''}`}>Login</button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={onReset} className="text-neon-blue">Forgot password?</button>
          <span className="text-white/60">No account? <Link to="/signup" className="text-neon-purple">Sign up</Link></span>
        </div>
      </form>
    </section>
  )
}


