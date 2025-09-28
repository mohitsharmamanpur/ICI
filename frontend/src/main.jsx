import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import AppLayout from './ui/AppLayout.jsx'
import Landing from './views/Landing.jsx'
import Upload from './views/Upload.jsx'
import Loading from './views/Loading.jsx'
import Results from './views/Results.jsx'
import Dashboard from './views/Dashboard.jsx'
import Login from './views/auth/Login.jsx'
import Signup from './views/auth/Signup.jsx'
import Profile from './views/auth/Profile.jsx'
import ScanDetail from './views/ScanDetail.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import ProtectedRoute from './ui/ProtectedRoute.jsx'
import { Toaster } from 'react-hot-toast'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'upload', element: <ProtectedRoute><Upload /></ProtectedRoute> },
      { path: 'loading', element: <ProtectedRoute><Loading /></ProtectedRoute> },
      { path: 'results', element: <ProtectedRoute><Results /></ProtectedRoute> },
      { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: 'scan/:id', element: <ProtectedRoute><ScanDetail /></ProtectedRoute> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  </React.StrictMode>,
)


