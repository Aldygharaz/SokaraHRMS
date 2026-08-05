
import { useHRStore } from '@/store/useHRStore'
import { cn } from '@/lib/utils'
import { Wifi, Keyboard, Volume2, VolumeX, Bell, Sun, Moon, ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const activeRole = useHRStore(state => state.activeRole)
  const setActiveRole = useHRStore(state => state.setActiveRole)
  const soundEnabled = useHRStore(state => state.soundEnabled)
  const toggleSound = useHRStore(state => state.toggleSound)
  const toggleSidebar = useHRStore(state => state.toggleSidebar)
  const theme = useHRStore(state => state.theme)
  const setTheme = useHRStore(state => state.setTheme)
  const activeBranch = useHRStore(state => state.activeBranch)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showBranchMenu, setShowBranchMenu] = useState(false)
  const branches = [
    { id: 'Senopati (HQ)', name: 'Kedai Senopati (HQ)', status: 'Operasional Normal', staff: '15/15' },
    { id: 'Kemang', name: 'Kedai Kemang', status: 'Sibuk', staff: '12/12' },
    { id: 'Sudirman', name: 'Kedai Sudirman', status: 'Kekurangan Staf', staff: '8/10' }
  ]
  const currentBranch = branches.find(b => b.id === activeBranch) || branches[0]

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="h-8 w-1 bg-surface-container-high rounded-full"></div>
          <div className="relative">
            <button 
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="text-xs font-bold text-psy-safe-text bg-psy-safe-bg hover:bg-psy-safe/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-psy-safe/30 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-psy-safe animate-pulse"></span>
              <span>{currentBranch.name} • {currentBranch.status} ({currentBranch.staff} Staff)</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
            </button>
            
            {showBranchMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBranchMenu(false)} />
                <div className="absolute left-0 top-full mt-2 w-64 bg-surface border border-outline rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-outline bg-surface-container-lowest">
                    <h3 className="font-bold text-sm">Pilih Cabang</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {branches.map(branch => (
                      <button 
                        key={branch.id}
                        onClick={() => {
                          useHRStore.setState({ activeBranch: branch.id })
                          setShowBranchMenu(false)
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors",
                          activeBranch === branch.id 
                            ? "bg-accent-primary/10 text-accent-primary" 
                            : "hover:bg-surface-container-low text-on-surface"
                        )}
                      >
                        <div>
                          <p className="font-bold text-sm">{branch.name}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{branch.status}</p>
                        </div>
                        {activeBranch === branch.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <span className="text-xs font-bold text-psy-safe-text bg-psy-safe-bg px-2.5 py-1 rounded-full flex items-center gap-1 border border-psy-safe/30">
            <Wifi className="w-3.5 h-3.5" /> Online
          </span>
          <button 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="text-xs text-on-surface-variant hover:text-accent-primary bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container-high flex items-center gap-1 font-mono"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Ctrl+K</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={toggleSound}
          className="bg-surface-container-low border border-surface-container-high text-on-surface-variant hover:text-accent-primary p-2 rounded-xl transition-all" 
          title="Toggle Sound FX"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-surface-container-high text-xs">
          <button 
            onClick={() => setActiveRole('manager')}
            className={cn("px-3 py-1.5 rounded-lg font-bold transition-all", activeRole === 'manager' ? "text-accent-primary bg-surface-container-high" : "text-on-surface-variant hover:text-on-surface")}
          >
            Manager
          </button>
          <button 
            onClick={() => setActiveRole('karyawan')}
            className={cn("px-3 py-1.5 rounded-lg font-bold transition-all", activeRole === 'karyawan' ? "text-accent-primary bg-surface-container-high" : "text-on-surface-variant hover:text-on-surface")}
          >
            Karyawan
          </button>
        </div>

        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="bg-surface-container-low border border-surface-container-high text-on-surface-variant hover:text-accent-primary p-2 rounded-xl transition-all" 
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-on-surface hover:text-accent-primary transition-colors p-2 rounded-xl hover:bg-surface-container-high relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface animate-pulse"></span>
          </button>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-outline rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-outline bg-surface-container-lowest">
                  <h3 className="font-bold text-sm">Notifikasi</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-outline hover:bg-surface-container-low transition-colors cursor-pointer">
                    <p className="text-xs font-semibold">Dimas Prasetyo mengajukan swap shift</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">2 menit yang lalu</p>
                  </div>
                  <div className="p-3 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <p className="text-xs font-semibold">Stok Biji Kopi (House Blend) menipis</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">1 jam yang lalu</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-surface-container-high hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqsh2fjO3Ftd_OTkZ6PG89xSAiXwKq-EkRzA2xiFlTuNFNmG_fza1UNG5Z0UR733ALmLmp7eT33UXa23vv5PkbVsr3vENVpvTKtUgGoX9djZggykVBTZbPVetA71QUORQ-SDMRAMrx-zz2YQgFnJ9pkHwUcCXHdZI-XYO9B-FarpFzc4wlHB9pUdTbTDrj0f-KnhcNBuxKR9eJG2bLfOZUnPwDytVbvKduQJegQDMKSm4bvONoqlc" alt="Owner" className="w-10 h-10 rounded-full object-cover border-2 border-accent-primary hover:scale-105 transition-transform"/>
        </div>
      </div>
    </header>
  )
}
