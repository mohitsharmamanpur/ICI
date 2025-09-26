import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useAuth } from '../state/AuthContext.jsx'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../state/AuthContext.jsx'

export default function Dashboard(){
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [queryText, setQueryText] = useState('')
  useEffect(()=>{
    async function load(){
      if(!user) return
      const qy = query(collection(db, 'users', user.uid, 'scans'), orderBy('createdAt','desc'))
      const snap = await getDocs(qy)
      const list = snap.docs.map(d=>({ id: d.id, ...d.data() }))
      setRows(list)
    }
    load()
  },[user])

  const filtered = useMemo(()=>{
    const q = queryText.toLowerCase()
    return rows.filter(r =>
      (r.result || '').toLowerCase().includes(q) ||
      (r.fileName || '').toLowerCase().includes(q)
    )
  },[queryText, rows])

  return (
    <section>
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="font-poppins text-2xl font-bold">Dashboard</motion.h2>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16}/>
          <input value={queryText} onChange={(e)=>setQueryText(e.target.value)} placeholder="Search by filename or result"
            className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2 outline-none focus:border-neon-blue/40"/>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Thumbnail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r)=> (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white/80">{r.createdAt?.toDate?.().toLocaleString?.() || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs ${r.result==='Pneumonia' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {r.result}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/80">{r.confidence}%</td>
                <td className="px-4 py-3">
                  <div className="h-10 w-10 rounded-md bg-white/10" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}


