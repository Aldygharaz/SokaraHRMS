import { NavLink } from 'react-router-dom'
import { useHRStore } from '@/store/useHRStore'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, ClipboardCheck, ScrollText, Wallet, Users, Settings2, Download, History, LogOut, ChevronLeft, Target, Heart, X } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export function Sidebar() {
  const isSidebarCollapsed = useHRStore(state => state.isSidebarCollapsed)
  const toggleSidebar = useHRStore(state => state.toggleSidebar)
  const activeRole = useHRStore(state => state.activeRole)
  const auditLogs = useHRStore(state => state.auditLogs)
  const [showAuditModal, setShowAuditModal] = useState(false)
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { to: '/calendar', icon: Calendar, label: 'Kalender Shift', show: true },
    { to: '/attendance', icon: ClipboardCheck, label: 'Presensi & Absensi', show: true },
    { to: '/approval', icon: ScrollText, label: 'Approval Swap', show: true },
    { to: '/goals', icon: Target, label: 'Target & OKR', show: true },
    { to: '/kudos', icon: Heart, label: 'Recognition', show: true },
    { to: '/payroll', icon: Wallet, label: activeRole === 'manager' ? 'Payroll & Tax TER' : 'Slip Gaji Saya', show: true },
    { to: '/employees', icon: Users, label: 'Data Karyawan', show: activeRole === 'manager' }
  ]

  return (
    <aside 
      className={cn(
        "fixed md:fixed inset-y-0 left-0 z-[60] bg-gradient-to-b from-secondary to-navy flex flex-col transition-all duration-300 shadow-[2px_0_12px_rgba(0,0,0,0.1)] dark:shadow-none border-r border-transparent dark:border-surface-highest",
        isSidebarCollapsed ? "w-0 md:w-20 overflow-hidden -translate-x-full md:translate-x-0" : "w-64 translate-x-0"
      )}
    >
      <div className="h-16 flex items-center px-4 relative mt-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
            S
          </div>
          <div className={cn("overflow-hidden transition-all duration-300 whitespace-nowrap", isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            <h1 className="text-xl font-bold text-white tracking-tight font-display">Sokara HRMS</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">RBAC Portal Engine</p>
          </div>
        </div>
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface border border-outline text-on-surface hover:text-accent-primary flex items-center justify-center shadow-lg transition-transform z-10 hidden md:flex"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", isSidebarCollapsed ? "rotate-180" : "")} />
        </button>
      </div>



      <nav className="flex flex-col gap-1.5 px-3 flex-1 mt-6 overflow-y-auto overflow-x-hidden">
        {navItems.filter(item => item.show).map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to}
            onClick={() => {
              if (window.innerWidth < 768 && !isSidebarCollapsed) {
                toggleSidebar()
              }
            }}
            className={({isActive}) => cn(
              "flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm font-semibold whitespace-nowrap overflow-hidden group",
              isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            title={item.label}
          >
            {({isActive}) => (
              <>
                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-accent-primary" : "")} />
                <span className={cn("transition-all duration-300", isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto space-y-2 pt-2 border-t border-white/10 overflow-hidden pb-4">
        <button onClick={() => toast.success('Smart Suggestion: Coba seimbangkan roster hari Jumat karena resiko lembur tinggi.', { icon: '💡' })} className="w-full bg-gradient-to-r from-accent-primary to-primary text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(27,95,174,0.4)] transition-all text-xs font-display">
          <Settings2 className="w-4 h-4 shrink-0" />
          <span className={cn("transition-all duration-300 whitespace-nowrap", isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>✨ Smart Suggestion</span>
        </button>

        <div className={cn("grid gap-2 transition-all duration-300", isSidebarCollapsed ? "grid-cols-1" : "grid-cols-2")}>
          <button onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(useHRStore.getState().employees))
            const downloadAnchorNode = document.createElement('a')
            downloadAnchorNode.setAttribute("href", dataStr)
            downloadAnchorNode.setAttribute("download", "employees_export.json")
            document.body.appendChild(downloadAnchorNode)
            downloadAnchorNode.click()
            downloadAnchorNode.remove()
            toast.success("Data berhasil diekspor!")
          }} className="w-full bg-surface-container-high border border-surface-container-highest text-on-surface-variant hover:text-accent-primary hover:bg-surface-container-highest font-semibold py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all" title="Export CSV">
            <Download className="w-4 h-4 shrink-0" />
            <span className={cn("transition-all duration-300 whitespace-nowrap", isSidebarCollapsed ? "hidden" : "inline")}>Export JSON</span>
          </button>
          <button onClick={() => setShowAuditModal(true)} className="w-full bg-surface-container-high border border-surface-container-highest text-on-surface-variant hover:text-accent-primary hover:bg-surface-container-highest font-semibold py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all" title="Audit Log">
            <History className="w-4 h-4 shrink-0" />
            <span className={cn("transition-all duration-300 whitespace-nowrap", isSidebarCollapsed ? "hidden" : "inline")}>Audit Log</span>
          </button>
        </div>

        <button 
          onClick={() => {
            useHRStore.getState().resetStore()
            window.location.reload()
          }}
          className="w-full mt-2 bg-transparent border border-error/50 text-error hover:bg-error/10 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs" 
          title="Logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={cn("transition-all duration-300 whitespace-nowrap", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>Keluar & Reset Data</span>
        </button>
      </div>

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-outline w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-outline flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-bold text-on-surface font-display text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-accent-primary" /> System Audit Logs
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface-container border border-outline hover:border-accent-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-on-surface">{log.action}</span>
                      <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      <strong className="text-on-surface">{log.user}</strong>: {log.detail}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center p-8 text-on-surface-variant text-sm italic">
                  Belum ada log aktivitas.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
