import { useState } from 'react'
import { Settings2, X, RefreshCw, AlertTriangle, User, ChevronRight } from 'lucide-react'
import { useHRStore } from '@/store/useHRStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function PlaygroundPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { activeRole, setActiveRole, activeEmployeeId, setActiveEmployeeId, employees, resetStore, sabotageSchedule, injectSwapRequest } = useHRStore()

  const handleReset = () => {
    resetStore()
    toast.success("Database di-reset ke kondisi awal")
    setIsOpen(false)
  }

  const handleSabotage = () => {
    sabotageSchedule()
    toast.error("Jadwal Disabotase!", { description: "Karyawan 1 (Dimas) sekarang memiliki risiko burnout ekstrem. Cek kalender/dashboard!" })
  }

  const handleInjectRequest = () => {
    injectSwapRequest()
    toast.success("Data Disuntikkan!", { description: "Siti Rahma baru saja mengajukan tukar shift." })
  }

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 group",
          "bg-on-surface text-surface hover:scale-105 hover:shadow-2xl flex items-center gap-2",
          isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100"
        )}
      >
        <Settings2 className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
        <span className="absolute -top-2 -right-2 bg-psy-danger text-psy-danger-text text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-surface animate-pulse">
          DEMO
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel */}
      <div 
        className={cn(
          "fixed top-4 bottom-4 right-4 w-[360px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-outline rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : "translate-x-[120%]"
        )}
      >
        <div className="p-5 border-b border-outline flex items-center justify-between bg-gradient-to-r from-gradient-start to-surface">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
              <Settings2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-on-surface font-display leading-tight">Demo Playground</h3>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Dev Controls</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Role Switcher */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> Role Switcher
            </h4>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-xl border border-outline">
              <button 
                onClick={() => setActiveRole('manager')}
                className={cn(
                  "py-2 text-xs font-bold rounded-lg transition-all",
                  activeRole === 'manager' ? "bg-surface shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Manager
              </button>
              <button 
                onClick={() => setActiveRole('karyawan')}
                className={cn(
                  "py-2 text-xs font-bold rounded-lg transition-all",
                  activeRole === 'karyawan' ? "bg-surface shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Karyawan
              </button>
            </div>
            
            {activeRole === 'karyawan' && (
              <div className="mt-4 p-3 bg-surface-container-low border border-outline rounded-xl animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Login Sebagai:</label>
                <select 
                  className="w-full bg-surface border border-outline rounded-lg p-2 text-sm font-medium focus:outline-none focus:border-accent-primary"
                  value={activeEmployeeId}
                  onChange={(e) => setActiveEmployeeId(Number(e.target.value))}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
                <p className="text-[10px] text-on-surface-variant mt-2 leading-relaxed">
                  Pilih karyawan untuk mendemokan RBAC (privasi data). Setiap karyawan hanya akan melihat data miliknya sendiri.
                </p>
              </div>
            )}
          </div>

          {/* Chaos Monkey */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-psy-danger uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Chaos Monkey
            </h4>
            <p className="text-xs text-on-surface-variant mb-2">
              Suntikkan data ekstrem untuk mengetes kapabilitas AI Dashboard.
            </p>
            
            <button 
              onClick={handleSabotage}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-psy-danger/20 hover:bg-psy-danger/10 transition-colors group text-left"
            >
              <div>
                <p className="text-sm font-bold text-psy-danger">Sabotase Jadwal (Burnout)</p>
                <p className="text-[10px] text-psy-danger/70 mt-0.5">Beri Dimas 7x shift malam beruntun</p>
              </div>
              <ChevronRight className="w-4 h-4 text-psy-danger opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={handleInjectRequest}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-psy-info/20 hover:bg-psy-info/10 transition-colors group text-left"
            >
              <div>
                <p className="text-sm font-bold text-psy-info">Suntik Request Palsu</p>
                <p className="text-[10px] text-psy-info/70 mt-0.5">Buat pending request di menu Approval</p>
              </div>
              <ChevronRight className="w-4 h-4 text-psy-info opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        <div className="p-5 border-t border-outline bg-surface-container-low">
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-on-surface hover:bg-on-surface/90 text-surface font-bold text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset Database & State
          </button>
          <p className="text-center text-[10px] text-on-surface-variant mt-3">
            PWA Offline-First Data Synchronization
          </p>
        </div>
      </div>
    </>
  )
}
