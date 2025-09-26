import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldPlus, Activity, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <section className="relative">
      <div className="absolute -top-10 right-10 h-24 w-24 rounded-full border border-neon-blue/40 animate-float" />
      <div className="absolute top-10 left-10 h-16 w-16 rounded-xl border border-neon-purple/40 animate-float" />

      <div className="mx-auto max-w-4xl text-center">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.5}}
          className="font-poppins text-4xl md:text-6xl font-bold tracking-tight">
          AI Pneumonia Detector
        </motion.h1>
        <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.1,duration:.5}}
          className="mt-4 text-white/80 text-lg">
          Upload chest X-rays for instant AI-powered pneumonia detection.
        </motion.p>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.2}} className="mt-8">
          <Link to="/upload" className="btn-primary">
            Start Diagnosis <ArrowRight size={18}/>
          </Link>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {icon: <ShieldPlus className="text-neon-cyan"/>, title:'Secure', text:'Your images stay private in this demo.'},
            {icon: <Activity className="text-neon-blue"/>, title:'Fast', text:'Results in seconds with AI inference.'},
            {icon: <Sparkles className="text-neon-purple"/>, title:'Accurate', text:'Model trained on public X-ray datasets.'},
          ].map((f,idx)=> (
            <motion.div key={idx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.2+idx*0.1}}
              className="card p-6">
              <div className="flex items-center gap-3">
                {f.icon}
                <h3 className="font-semibold">{f.title}</h3>
              </div>
              <p className="mt-2 text-white/70 text-sm">{f.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 text-sm text-white/60">
          <p>Demo only. Not for clinical use.</p>
        </div>
      </div>
    </section>
  )
}


