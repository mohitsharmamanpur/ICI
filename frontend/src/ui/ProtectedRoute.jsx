import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function ProtectedRoute({ children }){
  const { user, loading } = useAuth()
  const location = useLocation()
  if(loading) return <div className="text-center py-10">Loading…</div>
  if(!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}


