import React, { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowLeftRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { db, storage } from '../state/AuthContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import toast from 'react-hot-toast'

export default function Results(){
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result || 'Normal'
  const confidence = state?.confidence ?? 85
  const previewUrl = state?.previewUrl
  const file = state?.file
  const patientName = state?.patientName || ''
  const notes = state?.notes || ''

  const isPneumonia = result.toLowerCase() === 'pneumonia'
  const data = [
    { name: 'Confidence', value: confidence },
    { name: 'Other', value: 100 - confidence },
  ]

  const { user } = useAuth()
  useEffect(()=>{
    async function save(){
      if(!user) return
      let imageUrl = ''
      let storagePath = ''
      try{
        // Upload original image to Firebase Storage if available
        if(file){
          const safeName = (state?.fileName || 'scan').replace(/[^a-zA-Z0-9._-]/g,'_')
          const stamp = Date.now()
          storagePath = `users/${user.uid}/scans/${stamp}-${safeName}`
          const storageRef = ref(storage, storagePath)
          await uploadBytes(storageRef, file)
          imageUrl = await getDownloadURL(storageRef)
        }
      } catch(e){
        console.error('Storage upload failed:', e)
        toast.error('Saved report without image (storage upload failed).')
        // continue to save Firestore doc without imageUrl
      }

      try{
        await addDoc(collection(db, 'users', user.uid, 'scans'), {
          result,
          confidence,
          fileName: state?.fileName || '',
          imageUrl,
          storagePath,
          userId: user.uid,
          patientName,
          notes,
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        })
        // optional success toast
        // toast.success('Report saved to your dashboard')
      } catch(e){
        console.error('Failed to save report to Firestore:', e)
        toast.error('Could not save report to your account. Check Firestore rules and config.')
      }
    }
    save()
  },[])

  return (
    <section>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="card p-6">
          <h3 className="font-semibold">Uploaded X-ray</h3>
          <div className="mt-4 aspect-square w-full rounded-xl bg-white/5 overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="h-full w-full object-contain"/>
            ) : (
              <div className="h-full w-full grid place-items-center text-white/40">No preview</div>
            )}
          </div>
          <div className="mt-3 text-xs text-white/50">Heatmap overlay coming soon.</div>
        </motion.div>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="card p-6">
          <div className="flex items-center gap-3">
            {isPneumonia ? (
              <XCircle className="text-red-400"/>
            ) : (
              <CheckCircle2 className="text-green-400"/>
            )}
            <h3 className="font-semibold">Prediction Result</h3>
          </div>
          <div className="mt-3 text-3xl font-poppins font-bold" style={{ color: isPneumonia ? '#f87171' : '#34d399' }}>
            {result}
          </div>

          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell key="c1" fill={isPneumonia ? '#f87171' : '#34d399'} />
                  <Cell key="c2" fill="#1f2937" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-white/70">Confidence: {confidence}%</p>

          <div className="mt-6 flex gap-3">
            <button className="btn-ghost" onClick={()=>navigate('/upload')}><ArrowLeftRight size={16}/> Upload Another Image</button>
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


