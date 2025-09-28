import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../state/AuthContext.jsx'
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { db, storage } from '../../state/AuthContext.jsx'
import { deleteObject, ref as storageRef } from 'firebase/storage'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Profile(){
  const { user, profile } = useAuth()
  const [scans, setScans] = useState([])

  useEffect(()=>{
    async function load(){
      if(!user) return
      const qy = query(collection(db, 'users', user.uid, 'scans'), orderBy('createdAt','desc'))
      const snap = await getDocs(qy)
      const list = snap.docs.map(d=>({ id: d.id, ...d.data() }))
      setScans(list)
    }
    load()
  },[user])

  const rows = useMemo(()=>scans.map(s=>({
    ...s,
    created: s.createdAt?.toDate?.()?.toLocaleString?.() || '—'
  })),[scans])

  const fetchAsDataURL = async (url)=>{
    try{
      const res = await fetch(url)
      const blob = await res.blob()
      return await new Promise((resolve)=>{
        const reader = new FileReader()
        reader.onloadend = ()=> resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    } catch{ return null }
  }

  const downloadReport = async (scan)=>{
    const doc = new jsPDF()

    // Header
    doc.setFontSize(16)
    doc.text('Pneumonia Detector - Diagnosis Report', 14, 18)
    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)

    // Patient details
    autoTable(doc, {
      startY: 32,
      head: [['Field','Value']],
      body: [
        ['Name', profile?.name || user?.displayName || '—'],
        ['Email', user?.email || '—'],
        ['User ID', user?.uid || '—'],
      ],
      styles: { fontSize: 10 }
    })

    // Diagnosis details
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Diagnosis Detail','Value']],
      body: [
        ['Result', scan.result],
        ['Confidence', `${scan.confidence}%`],
        ['File Name', scan.fileName || '—'],
        ['Timestamp', scan.created],
      ],
      styles: { fontSize: 10 }
    })

    // Thumbnail if available
    if(scan.imageUrl){
      const dataUrl = await fetchAsDataURL(scan.imageUrl)
      if(dataUrl){
        const y = doc.lastAutoTable.finalY + 10
        try{ doc.addImage(dataUrl, 'JPEG', 14, y, 60, 60) }catch{}
      }
    }

    // Save
    const safeName = (scan.fileName || 'scan').replace(/[^a-zA-Z0-9._-]/g,'_')
    doc.save(`Diagnosis_${safeName}_${scan.created.replaceAll(':','-')}.pdf`)
  }

  const downloadOriginal = async (scan)=>{
    if(!scan?.imageUrl){ return }
    // Trigger browser download of the original image URL
    const a = document.createElement('a')
    a.href = scan.imageUrl
    a.download = scan.fileName || 'scan.jpg'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const deleteReport = async (scan)=>{
    if(!user) return
    const confirmed = window.confirm('Delete this report? This will remove the record and the stored image (if any).')
    if(!confirmed) return
    try{
      // Delete storage object first (if exists)
      if(scan.storagePath){
        try{ await deleteObject(storageRef(storage, scan.storagePath)) }catch{}
      }
      // Delete Firestore doc
      await deleteDoc(doc(db, 'users', user.uid, 'scans', scan.id))
      // Update UI
      setScans(prev => prev.filter(s => s.id !== scan.id))
    } catch(e){ /* optionally add toast */ }
  }

  return (
    <section>
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="font-poppins text-2xl font-bold">Your Profile</motion.h2>
      <div className="mt-6 card p-6 space-y-3 max-w-md">
        <div><span className="text-white/60 text-sm">Name</span><div className="mt-1">{profile?.name || user?.displayName || '—'}</div></div>
        <div><span className="text-white/60 text-sm">Email</span><div className="mt-1">{user?.email}</div></div>
        <div><span className="text-white/60 text-sm">Join Date</span><div className="mt-1">{user?.metadata?.creationTime || '—'}</div></div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold">Your Diagnosis Reports</h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s)=> (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white/80">{s.created}</td>
                  <td className="px-4 py-3">{s.result}</td>
                  <td className="px-4 py-3">{s.confidence}%</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={()=>downloadReport(s)} className="btn-primary text-xs">Download Report</button>
                    {s.imageUrl && (
                      <button onClick={()=>downloadOriginal(s)} className="btn-ghost text-xs">Download Image</button>
                    )}
                    <button onClick={()=>deleteReport(s)} className="btn-ghost text-xs text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length===0 && (
                <tr><td className="px-4 py-6 text-white/60" colSpan={4}>No reports yet. Upload an X-ray to generate your first report.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}


