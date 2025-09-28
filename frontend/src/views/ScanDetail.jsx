import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext.jsx'
import { db, storage } from '../state/AuthContext.jsx'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ScanDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      if(!user || !id) return
      const d = await getDoc(doc(db, 'users', user.uid, 'scans', id))
      if(d.exists()) setScan({ id: d.id, ...d.data() })
      setLoading(false)
    }
    load()
  },[user, id])

  const created = useMemo(()=> scan?.createdAt?.toDate?.()?.toLocaleString?.() || '—', [scan])

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

  const downloadReport = async ()=>{
    if(!scan) return
    const docPdf = new jsPDF()
    docPdf.setFontSize(16)
    docPdf.text('Pneumonia Detector - Diagnosis Report', 14, 18)
    docPdf.setFontSize(11)
    docPdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)

    autoTable(docPdf, {
      startY: 32,
      head: [['Field','Value']],
      body: [
        ['Name', profile?.name || user?.displayName || '—'],
        ['Email', user?.email || '—'],
        ['User ID', user?.uid || '—'],
      ],
      styles: { fontSize: 10 }
    })

    autoTable(docPdf, {
      startY: docPdf.lastAutoTable.finalY + 8,
      head: [['Diagnosis Detail','Value']],
      body: [
        ['Result', scan.result],
        ['Confidence', `${scan.confidence}%`],
        ['File Name', scan.fileName || '—'],
        ['Timestamp', created],
      ],
      styles: { fontSize: 10 }
    })

    if(scan.imageUrl){
      const dataUrl = await fetchAsDataURL(scan.imageUrl)
      if(dataUrl){
        const y = docPdf.lastAutoTable.finalY + 10
        try{ docPdf.addImage(dataUrl, 'JPEG', 14, y, 80, 80) }catch{}
      }
    }
    const safeName = (scan.fileName || 'scan').replace(/[^a-zA-Z0-9._-]/g,'_')
    docPdf.save(`Diagnosis_${safeName}_${created.replaceAll(':','-')}.pdf`)
  }

  const downloadOriginal = ()=>{
    if(!scan?.imageUrl) return
    const a = document.createElement('a')
    a.href = scan.imageUrl
    a.download = scan.fileName || 'scan.jpg'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const deleteReport = async ()=>{
    if(!user || !scan) return
    const confirmed = window.confirm('Delete this report? This will remove the record and the stored image (if any).')
    if(!confirmed) return
    try{
      if(scan.storagePath){
        try{ await deleteObject(storageRef(storage, scan.storagePath)) }catch{}
      }
      await deleteDoc(doc(db, 'users', user.uid, 'scans', scan.id))
      navigate('/dashboard', { replace: true })
    }catch(e){ /* optionally show toast */ }
  }

  if(loading) return <div className="text-center py-10">Loading…</div>
  if(!scan) return <div className="text-center py-10">Report not found.</div>

  const isPneumonia = (scan.result || '').toLowerCase() === 'pneumonia'

  return (
    <section>
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="font-poppins text-2xl font-bold">Scan Detail</motion.h2>

      <div className="mt-6 grid md:grid-cols-2 gap-8 items-start">
        <div className="card p-6">
          <h3 className="font-semibold">Uploaded Image</h3>
          <div className="mt-4 aspect-square w-full rounded-xl bg-white/5 overflow-hidden">
            {scan.imageUrl ? (
              <img src={scan.imageUrl} alt={scan.fileName || 'scan'} className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full grid place-items-center text-white/40">No image available</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold">Report</h3>
          <div className="mt-3 text-3xl font-poppins font-bold" style={{ color: isPneumonia ? '#f87171' : '#34d399' }}>
            {scan.result} <span className="text-white/70 text-base font-normal">({scan.confidence}%)</span>
          </div>
          <div className="mt-4 text-white/80 space-y-1">
            <div><span className="text-white/60">Filename:</span> {scan.fileName || '—'}</div>
            <div><span className="text-white/60">Timestamp:</span> {created}</div>
            <div><span className="text-white/60">Storage Path:</span> {scan.storagePath || '—'}</div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn-primary" onClick={downloadReport}>Download Report</button>
            {scan.imageUrl && <button className="btn-ghost" onClick={downloadOriginal}>Download Image</button>}
            <button className="btn-ghost text-red-300" onClick={deleteReport}>Delete</button>
          </div>
        </div>
      </div>
    </section>
  )
}
