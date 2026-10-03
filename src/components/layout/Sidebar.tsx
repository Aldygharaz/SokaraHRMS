import { NavLink } from 'react-router-dom'
import { useHRStore } from '@/store/useHRStore'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, ClipboardCheck, ScrollText, Wallet, Users, Download, History, LogOut, ChevronLeft, Target, Heart, X } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Tooltip } from '@/components/ui/Tooltip'

export function Sidebar() {
  const isSidebarCollapsed = useHRStore(state => state.isSidebarCollapsed)
  const toggleSidebar = useHRStore(state => state.toggleSidebar)
  const activeRole = useHRStore(state => state.activeRole)
  const auditLogs = useHRStore(state => state.auditLogs)
  const employees = useHRStore(state => state.employees)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const [showAuditModal, setShowAuditModal] = useState(false)
  
  const activeEmployee = employees.find(e => e.id === activeEmployeeId)
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Ringkasan KPI operasional, status shift berjalan, dan metrik kehadiran harian.', show: true },
    { to: '/calendar', icon: Calendar, label: 'Kalender Shift', desc: 'Matriks roster jadwal 7 hari, optimasi AI anti-fatigue, dan penugasan kru.', show: true },
    { to: '/attendance', icon: ClipboardCheck, label: 'Presensi & Absensi', desc: 'Validasi presensi GPS Geofencing radius 100m dan checklist SOP harian.', show: true },
    { to: '/approval', icon: ScrollText, label: 'Approval Swap', desc: 'Persetujuan pertukaran shift, bursa shift terbuka, dan roaming antar cabang.', show: true },
    { to: '/goals', icon: Target, label: 'Target & OKR', desc: 'Pelacakan Objective & Key Results individu dan tim operasional.', show: true },
    { to: '/kudos', icon: Heart, label: 'Recognition', desc: 'Dinding apresiasi rekan kerja lintas divisi untuk penguatan budaya tim.', show: true },
    { to: '/payroll', icon: Wallet, label: activeRole === 'manager' ? 'Payroll & Tax TER' : 'Slip Gaji Saya', desc: 'Rekapitulasi penggajian bruto/netto dengan potongan PPh 21 TER (PMK 168/2023).', show: true },
    { to: '/employees', icon: Users, label: 'Data Karyawan', desc: 'Direktori profil staf, matriks keterampilan multi-skilling, dan prediksi attrition.', show: activeRole === 'manager' }
  ]

  return (
    <aside 
      className={cn(
        "fixed md:fixed inset-y-0 left-0 z-[60] bg-slate-900 text-slate-200 flex flex-col transition-all duration-300 border-r border-slate-800 shadow-sm select-none",
        isSidebarCollapsed ? "w-0 md:w-[72px] overflow-hidden -translate-x-full md:translate-x-0" : "w-64 translate-x-0"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center overflow-hidden">
          <img 
            src={isSidebarCollapsed ? "/sokara-logomark-transparent-light.svg" : "/sokara-horizontal-dark-bg.svg"} 
            alt="Sokara Logo" 
            className={cn("transition-all duration-200 object-contain", isSidebarCollapsed ? "h-7 w-7 mx-auto" : "h-7 w-auto")} 
          />
        </div>
        <Tooltip
          position="right"
          content={isSidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          delay={100}
        >
          <button 
            onClick={toggleSidebar}
            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors hidden md:flex cursor-pointer"
          >
            <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-200", isSidebarCollapsed ? "rotate-180" : "")} />
          </button>
        </Tooltip>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto overflow-x-hidden">
        <div className={cn("px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono transition-opacity", isSidebarCollapsed ? "opacity-0 h-0 p-0" : "opacity-100")}>
          Menu Utama
        </div>
        {navItems.filter(item => item.show).map((item) => (
          <Tooltip 
            key={item.to}
            position="right"
            title={item.label}
            description={item.desc}
            delay={50}
            disabled={!isSidebarCollapsed}
          >
            <NavLink 
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 768 && !isSidebarCollapsed) {
                  toggleSidebar()
                }
              }}
              className={({isActive}) => cn(
                "flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-semibold whitespace-nowrap overflow-hidden group select-none cursor-pointer",
                isActive 
                  ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              )}
            >
              {({isActive}) => (
                <>
                  <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200")} />
                  <span className={cn("transition-all duration-200 truncate", isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* Footer Utility & Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 shrink-0">
        <div className={cn("flex items-center gap-1.5", isSidebarCollapsed ? "flex-col" : "flex-row")}>
          <Tooltip
            position="right"
            title="Log Aktivitas Audit"
            description="Catatan jejak rekam riwayat perubahan roster jadwal dan tindakan manajerial."
            disabled={!isSidebarCollapsed}
            delay={50}
          >
            <button 
              onClick={() => setShowAuditModal(true)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Audit Log</span>}
            </button>
          </Tooltip>
          <Tooltip
            position="right"
            title="Ekspor Data JSON"
            description="Unduh berkas cadangan data seluruh karyawan cabang."
            disabled={!isSidebarCollapsed}
            delay={50}
          >
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(useHRStore.getState().employees))
                const downloadAnchorNode = document.createElement('a')
                downloadAnchorNode.setAttribute("href", dataStr)
                downloadAnchorNode.setAttribute("download", "employees_export.json")
                downloadAnchorNode.appendChild(downloadAnchorNode)
                downloadAnchorNode.click()
                downloadAnchorNode.remove()
                toast.success("Data berhasil diekspor!")
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Ekspor</span>}
            </button>
          </Tooltip>
        </div>

        {/* User Profile Card */}
        <div className={cn(
          "flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800 transition-all",
          isSidebarCollapsed ? "justify-center p-1.5" : ""
        )}>
          <img 
            src={activeEmployee?.avatar || `https://i.pravatar.cc/150?u=${activeEmployeeId}`}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
            alt="Profile"
          />
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{activeEmployee?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-mono">{activeRole}</p>
            </div>
          )}
          {!isSidebarCollapsed && (
            <button 
              onClick={() => {
                useHRStore.getState().resetStore()
                window.location.reload()
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Keluar / Reset Sesi"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-outline w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-outline flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-accent-primary" /> System Audit Logs
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface-container-low border border-outline text-xs">
                  <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-on-surface truncate">{log.action}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      <strong className="text-on-surface">{log.user}</strong>: {log.detail}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center p-6 text-on-surface-variant text-xs">
                  Belum ada catatan log aktivitas.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
