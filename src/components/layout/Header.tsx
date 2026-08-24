import { useHRStore } from '@/store/useHRStore'
import { cn } from '@/lib/utils'
import { Wifi, Keyboard, Volume2, VolumeX, Bell, Sun, Moon, ChevronDown, Check, Menu, MapPin, Clock, ArrowRight, AlertTriangle, ArrowLeftRight, Coffee } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { sound } from '@/lib/sound'
import { Tooltip } from '@/components/ui/Tooltip'
import { BRANCH_PROFILES } from '@/lib/branches'
import { toast } from 'sonner'

export function Header() {
  const navigate = useNavigate()
  const activeRole = useHRStore(state => state.activeRole)
  const setActiveRole = useHRStore(state => state.setActiveRole)
  const soundEnabled = useHRStore(state => state.soundEnabled)
  const toggleSound = useHRStore(state => state.toggleSound)
  const toggleSidebar = useHRStore(state => state.toggleSidebar)
  const theme = useHRStore(state => state.theme)
  const setTheme = useHRStore(state => state.setTheme)
  const activeBranch = useHRStore(state => state.activeBranch)
  
  // Real-time notifications data
  const swapRequests = useHRStore(state => state.swapRequests)
  const attendances = useHRStore(state => state.attendances)
  const handoverNotes = useHRStore(state => state.handoverNotes)
  const openShifts = useHRStore(state => state.openShifts)
  const rosterStatus = useHRStore(state => state.rosterStatus)

  const [showNotifications, setShowNotifications] = useState(false)
  const [showBranchMenu, setShowBranchMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [readNotifKeys, setReadNotifKeys] = useState<string[]>([])

  // Live 1-second clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const currentBranch = BRANCH_PROFILES[activeBranch] || BRANCH_PROFILES['Senopati (HQ)']
  const branches = Object.values(BRANCH_PROFILES)

  // Format date & time in Indonesian
  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }, [currentTime])

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }, [currentTime])

  // Build live notification items
  const notifications = useMemo(() => {
    const items: Array<{
      id: string
      title: string
      desc: string
      time: string
      icon: any
      type: 'warning' | 'info' | 'urgent'
      link: string
    }> = []

    // 1. Pending Swaps
    const pendingSwaps = swapRequests.filter(s => s.status === 'Diajukan')
    pendingSwaps.forEach(s => {
      items.push({
        id: `swap-${s.id}`,
        title: 'Pengajuan Tukar Shift',
        desc: `${s.requester} meminta tukar shift: ${s.reason}`,
        time: 'Perlu Review',
        icon: ArrowLeftRight,
        type: 'warning',
        link: '/approval'
      })
    })

    // 2. Late staff today
    const lateStaff = attendances.filter(a => a.status === 'Terlambat')
    lateStaff.forEach(a => {
      items.push({
        id: `late-${a.id}`,
        title: 'Staf Terlambat Hadir',
        desc: `${a.name} masuk ${a.timeIn} WIB (${a.geofence})`,
        time: 'Hari Ini',
        icon: AlertTriangle,
        type: 'warning',
        link: '/attendance'
      })
    })

    // 3. Urgent handover notes
    const urgentNotes = handoverNotes.filter(h => h.priority === 'urgent')
    urgentNotes.forEach(h => {
      items.push({
        id: `handover-${h.id}`,
        title: 'Catatan Handover Urgent',
        desc: `${h.author} (${h.shift}): ${h.note}`,
        time: h.time,
        icon: AlertTriangle,
        type: 'urgent',
        link: '/attendance'
      })
    })

    // 4. Open Shifts
    const activeOpenShifts = openShifts.filter(o => o.status === 'open')
    if (activeOpenShifts.length > 0) {
      items.push({
        id: 'open-shifts-summary',
        title: `${activeOpenShifts.length} Shift Terbuka di Bursa`,
        desc: 'Tersedia slot shift yang belum diklaim oleh staf pengganti.',
        time: 'Bursa Shift',
        icon: Coffee,
        type: 'info',
        link: '/approval'
      })
    }

    // 5. Roster Draft status for Manager
    if (rosterStatus === 'draft' && activeRole === 'manager') {
      items.push({
        id: 'roster-draft',
        title: 'Roster Masih Berupa Draft',
        desc: 'Roster minggu ini belum dipublikasikan ke staf.',
        time: 'Penting',
        icon: Clock,
        type: 'info',
        link: '/calendar'
      })
    }

    return items
  }, [swapRequests, attendances, handoverNotes, openShifts, rosterStatus, activeRole])

  const unreadCount = notifications.filter(n => !readNotifKeys.includes(n.id)).length

  const handleMarkAllAsRead = () => {
    sound.playSuccess()
    setReadNotifKeys(notifications.map(n => n.id))
    toast.success("Semua notifikasi ditandai sudah dibaca.")
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        <Tooltip content="Buka/Tutup Menu Navigasi" position="bottom">
          <button 
            onClick={() => {
              sound.playClick()
              toggleSidebar()
            }}
            className="md:hidden p-2 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="hidden md:flex items-center gap-3">
          <div className="h-8 w-1 bg-surface-container-high rounded-full"></div>
          
          {/* Branch Switcher Dropdown */}
          <div className="relative">
            <Tooltip content="Ganti cabang operasional kedai aktif" position="bottom">
              <button 
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="text-xs font-bold text-psy-safe-text bg-psy-safe-bg hover:bg-psy-safe/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-psy-safe/30 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-psy-safe animate-pulse"></span>
                <span>{currentBranch.name} • {currentBranch.status} ({currentBranch.staffTarget} Staff)</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
              </button>
            </Tooltip>
            
            {showBranchMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBranchMenu(false)} />
                <div className="absolute left-0 top-full mt-2 w-72 bg-surface border border-outline rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-outline bg-surface-container-lowest flex items-center justify-between">
                    <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-accent-primary" /> Pilih Cabang Aktif
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {branches.map(branch => (
                      <button 
                        key={branch.id}
                        onClick={() => {
                          sound.playSuccess()
                          useHRStore.setState({ activeBranch: branch.id })
                          toast.success(`Cabang operasional dialihkan ke ${branch.name}`, {
                            description: branch.address
                          })
                          setShowBranchMenu(false)
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                          activeBranch === branch.id 
                            ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/30" 
                            : "hover:bg-surface-container-low text-on-surface"
                        )}
                      >
                        <div>
                          <p className="font-bold text-sm">{branch.name}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{branch.status} ({branch.staffTarget} Staf)</p>
                          <p className="text-[9px] text-on-surface-variant font-mono opacity-70 truncate max-w-[200px]">{branch.address}</p>
                        </div>
                        {activeBranch === branch.id && <Check className="w-4 h-4 text-accent-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Real-time WIB Live Digital Clock */}
          <Tooltip content="Waktu operasional server sinkronisasi presensi (WIB)" position="bottom">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline text-xs font-mono font-bold text-on-surface shadow-inner">
              <Clock className="w-3.5 h-3.5 text-accent-primary animate-spin" style={{ animationDuration: '60s' }} />
              <span>{formattedDate}</span>
              <span className="text-on-surface-variant font-medium">•</span>
              <span className="text-accent-primary">{formattedTime} WIB</span>
            </div>
          </Tooltip>
          
          <Tooltip content="Status koneksi real-time sync GPS & database" position="bottom">
            <span className="text-xs font-bold text-psy-safe-text bg-psy-safe-bg px-2.5 py-1 rounded-full flex items-center gap-1 border border-psy-safe/30 cursor-default">
              <Wifi className="w-3.5 h-3.5" /> Online
            </span>
          </Tooltip>

          <Tooltip content="Buka Command Palette untuk pencarian rute & aksi cepat" position="bottom" shortcut="Ctrl+K">
            <button 
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="text-xs text-on-surface-variant hover:text-accent-primary bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container-high flex items-center gap-1 font-mono cursor-pointer transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Ctrl+K</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound Toggle Tooltip */}
        <Tooltip content={soundEnabled ? 'Matikan efek suara interaksi (Mute)' : 'Aktifkan efek suara interaksi'} position="bottom">
          <button 
            onClick={() => {
              toggleSound()
              sound.playClick()
            }}
            className="bg-surface-container-low border border-surface-container-high text-on-surface-variant hover:text-accent-primary p-2 rounded-xl transition-all cursor-pointer" 
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </Tooltip>

        {/* Role Switcher Tooltip */}
        <Tooltip content="Beralih peran antara Dashboard Manajer (KPI, Approval) dan Portal Karyawan (Shift, Presensi)" position="bottom">
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-surface-container-high text-xs">
            <button 
              onClick={() => {
                sound.playClick()
                setActiveRole('manager')
              }}
              className={cn("px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer", activeRole === 'manager' ? "text-accent-primary bg-surface-container-high shadow-sm" : "text-on-surface-variant hover:text-on-surface")}
            >
              Manager
            </button>
            <button 
              onClick={() => {
                sound.playClick()
                setActiveRole('karyawan')
              }}
              className={cn("px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer", activeRole === 'karyawan' ? "text-accent-primary bg-surface-container-high shadow-sm" : "text-on-surface-variant hover:text-on-surface")}
            >
              Karyawan
            </button>
          </div>
        </Tooltip>

        {/* Theme Toggle Tooltip */}
        <Tooltip content={theme === 'light' ? 'Ganti ke Mode Gelap (Dark Mode)' : 'Ganti ke Mode Terang (Light Mode)'} position="bottom">
          <button 
            onClick={() => {
              sound.playClick()
              setTheme(theme === 'light' ? 'dark' : 'light')
            }}
            className="bg-surface-container-low border border-surface-container-high text-on-surface-variant hover:text-accent-primary p-2 rounded-xl transition-all cursor-pointer" 
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </Tooltip>

        {/* Notifications Dropdown */}
        <div className="relative">
          <Tooltip content="Notifikasi operasional kedai & pengajuan swap shift" position="bottom">
            <button 
              onClick={() => {
                sound.playClick()
                setShowNotifications(!showNotifications)
              }}
              className="text-on-surface hover:text-accent-primary transition-colors p-2 rounded-xl hover:bg-surface-container-high relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-psy-danger text-white text-[9px] font-mono font-bold rounded-full border-2 border-surface animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-outline rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3.5 border-b border-outline bg-surface-container-lowest flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm font-display text-on-surface">Pusat Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary text-[10px] font-mono font-bold rounded-full">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-accent-primary hover:underline font-bold cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-on-surface-variant">
                      <p className="font-bold text-on-surface">Semua Operasional Lancar</p>
                      <p className="text-[11px] mt-0.5">Tidak ada anomali atau permintaan pending.</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const Icon = notif.icon
                      const isUnread = !readNotifKeys.includes(notif.id)

                      return (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            sound.playClick()
                            setReadNotifKeys(prev => [...prev, notif.id])
                            setShowNotifications(false)
                            navigate(notif.link)
                          }}
                          className={cn(
                            "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                            isUnread 
                              ? "bg-surface-container border-accent-primary/30 hover:border-accent-primary" 
                              : "bg-surface-container-lowest border-outline hover:bg-surface-container-low opacity-75"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-xl shrink-0 mt-0.5",
                            notif.type === 'urgent' ? "bg-psy-danger-bg text-psy-danger" :
                            notif.type === 'warning' ? "bg-psy-warning-bg text-psy-warning" :
                            "bg-accent-primary/10 text-accent-primary"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-on-surface truncate">{notif.title}</p>
                              <span className="text-[9px] font-mono text-on-surface-variant shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5 line-clamp-2">
                              {notif.desc}
                            </p>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant shrink-0 self-center opacity-40" />
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-surface-container-high hidden sm:block"></div>

        <Tooltip content="Profil Pengguna Aktif • Aldy (Owner & Head Manager)" position="bottom">
          <div className="flex items-center gap-3 cursor-pointer">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqsh2fjO3Ftd_OTkZ6PG89xSAiXwKq-EkRzA2xiFlTuNFNmG_fza1UNG5Z0UR733ALmLmp7eT33UXa23vv5PkbVsr3vENVpvTKtUgGoX9djZggykVBTZbPVetA71QUORQ-SDMRAMrx-zz2YQgFnJ9pkHwUcCXHdZI-XYO9B-FarpFzc4wlHB9pUdTbTDrj0f-KnhcNBuxKR9eJG2bLfOZUnPwDytVbvKduQJegQDMKSm4bvONoqlc" alt="Owner" className="w-10 h-10 rounded-full object-cover border-2 border-accent-primary hover:scale-105 transition-transform"/>
          </div>
        </Tooltip>
      </div>
    </header>
  )
}

