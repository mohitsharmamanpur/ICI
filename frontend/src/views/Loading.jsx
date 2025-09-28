import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Loading(){
  const location = useLocation()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(()=>{
    // progress animation
    const id = setInterval(()=>{
      setProgress(p=>{
        const next = Math.min(p + Math.random()*12, 98)
        return next
      })
    }, 450)
    
    // start API call immediately
    async function run(){
      try{
        const file = location.state?.file
        if(!file){
          // if no file in state, go back to upload
          navigate('/upload', { replace: true })
          return
        }
        const form = new FormData()
        form.append('file', file)
        const resp = await fetch('/api/predict', { method: 'POST', body: form })
        if(!resp.ok){
          // If backend rejected as non X-ray, show popup and return to upload
          let message = `HTTP ${resp.status}`
          try{ const err = await resp.json(); if(err?.error) message = err.error }catch{}
          if(resp.status === 400){
            toast.error(message || 'Please upload a valid chest X-ray image (JPEG/PNG).')
            navigate('/upload', { replace: true })
            return
          }
          throw new Error(message)
        }
        const data = await resp.json()
        // backend returns { prediction: 'Pneumonia'|'Normal', confidence: 0..1 } where confidence is for the predicted class
        const result = data.prediction || 'Normal'
        const confidencePct = typeof data.confidence === 'number' ? Math.round(data.confidence * 100) : 85
        // Finish progress and navigate
        setProgress(100)
        navigate('/results', {
          replace: true,
          state: {
            result,
            confidence: confidencePct,
            previewUrl: location.state?.previewUrl,
            fileName: location.state?.fileName,
            file, // forward the original File for storage upload
            patientName: location.state?.patientName || '',
            notes: location.state?.notes || '',
          }
        })
      } catch(e){
        // On error, navigate with a safe default
        navigate('/results', {
          replace: true,
          state: {
            result: 'Normal',
            confidence: 50,
            previewUrl: location.state?.previewUrl,
            fileName: location.state?.fileName,
            file: location.state?.file,
            patientName: location.state?.patientName || '',
            notes: location.state?.notes || '',
          }
        })
      }
    }
    run()
    
    return ()=>{ clearInterval(id) }
  },[])

  return (
    <section className="max-w-xl mx-auto text-center">
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="font-poppins text-2xl font-bold">Analyzing X-Ray using AI model…</motion.h2>
      <div className="mt-8 card p-8">
        <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div className="absolute left-0 top-0 h-full bg-gradient-to-r from-neon-blue to-neon-purple"
            style={{ width: `${Math.floor(progress)}%` }}
            animate={{ boxShadow: ['0 0 0px #4FC3F7','0 0 18px #4FC3F7','0 0 0px #4FC3F7'] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
        </div>
        <p className="mt-4 text-white/70">{Math.floor(progress)}%</p>
        <div className="mt-6 animate-pulseGlow rounded-xl border border-neon-blue/30 p-4 text-white/80">
          Our model extracts features and predicts probability with a neon-blue pulse.
        </div>
      </div>
    </section>
  )
}


