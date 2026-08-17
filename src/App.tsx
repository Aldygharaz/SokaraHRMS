import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { useHRStore } from './store/useHRStore'

import { Toaster } from 'sonner'
import { PageLoader } from './components/layout/PageLoader'

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Calendar = lazy(() => import('./pages/Calendar').then(module => ({ default: module.Calendar })))
const Attendance = lazy(() => import('./pages/Attendance').then(module => ({ default: module.Attendance })))
const Approval = lazy(() => import('./pages/Approval').then(module => ({ default: module.Approval })))
const Payroll = lazy(() => import('./pages/Payroll').then(module => ({ default: module.Payroll })))
const Employees = lazy(() => import('./pages/Employees').then(module => ({ default: module.Employees })))
const Goals = lazy(() => import('./pages/Goals').then(module => ({ default: module.Goals })))
const Kudos = lazy(() => import('./pages/Kudos').then(module => ({ default: module.Kudos })))

function ThemeSync() {
  const theme = useHRStore(state => state.theme)
  
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])
  
  return null
}

export default function App() {
  const theme = useHRStore(state => state.theme)

  return (
    <BrowserRouter>
      <ThemeSync />
      <Toaster position="top-right" richColors theme={theme === 'dark' ? 'dark' : 'light'} />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><Calendar /></Suspense>} />
          <Route path="/attendance" element={<Suspense fallback={<PageLoader />}><Attendance /></Suspense>} />
          <Route path="/approval" element={<Suspense fallback={<PageLoader />}><Approval /></Suspense>} />
          <Route path="/payroll" element={<Suspense fallback={<PageLoader />}><Payroll /></Suspense>} />
          <Route path="/employees" element={<Suspense fallback={<PageLoader />}><Employees /></Suspense>} />
          <Route path="/goals" element={<Suspense fallback={<PageLoader />}><Goals /></Suspense>} />
          <Route path="/kudos" element={<Suspense fallback={<PageLoader />}><Kudos /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
