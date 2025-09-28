import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react'

const ACCEPTED = ['image/jpeg','image/png']

export default function Upload(){
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [patientName, setPatientName] = useState('')
  const [notes, setNotes] = useState('')
  const previewUrl = useMemo(()=> file ? URL.createObjectURL(file) : '', [file])

  const onFiles = useCallback(async (files)=>{
    const f = files?.[0]
    if(!f) return
    if(!ACCEPTED.includes(f.type)){
      setError('Invalid file type. Please upload .jpg or .png')
      setFile(null)
      return
    }
    if(f.size > 10 * 1024 * 1024){
      setError('File too large. Max 10MB.')
      setFile(null)
      return
    }
    setError('')
    setFile(f)
  },[])

  const handleDrop = (e)=>{
    e.preventDefault()
    onFiles(e.dataTransfer.files)
  }

  const handleAnalyze = async ()=>{
    // Navigate to loading and include the File so the Loading screen can call the API
    navigate('/loading', { state: { file, fileName: file?.name, previewUrl, patientName, notes } })
  }

  return (
    <section>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="card p-6">
          <div
            onDragOver={(e)=>e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 rounded-xl p-10 text-center hover:border-neon-blue/40 transition"
          >
            <UploadCloud className="text-neon-cyan mb-3"/>
            <p className="text-white/80">Drag & drop X-ray here</p>
            <p className="text-white/50 text-sm">or</p>
            <label className="mt-3 btn-ghost cursor-pointer">
              Browse File
              <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e)=>onFiles(e.target.files)} />
            </label>
            <p className="mt-3 text-xs text-white/50">Accepted: .jpg, .png • Max 10MB</p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400">
              <AlertCircle size={16}/> <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm text-white/70">Patient Name (optional)</label>
              <input value={patientName} onChange={(e)=>setPatientName(e.target.value)} placeholder="e.g., John Doe"
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40"/>
            </div>
            <div>
              <label className="text-sm text-white/70">Notes (optional)</label>
              <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={3} placeholder="Any clinical notes"
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-blue/40"/>
            </div>
          </div>

          <button disabled={!file} onClick={handleAnalyze} className={`mt-6 w-full btn-primary ${!file ? 'opacity-50 cursor-not-allowed':''}`}>
            Analyze X-Ray
          </button>
        </motion.div>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="card p-6">
          <h3 className="font-semibold">Preview</h3>
          <div className="mt-4 aspect-square w-full rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="h-full w-full object-contain"/>
            ) : (
              <div className="text-white/40 flex flex-col items-center">
                <ImageIcon />
                <span className="text-sm mt-2">No image selected</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}


