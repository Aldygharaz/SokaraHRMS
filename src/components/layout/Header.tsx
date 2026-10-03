import { useHRStore } from '@/store/useHRStore'
import { cn } from '@/lib/utils'
import { Keyboard, Volume2, VolumeX, Bell, Sun, Moon, ChevronDown, Check, Menu, MapPin, Clock, AlertTriangle, ArrowLeftRight, Coffee } from 'lucide-react'
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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-outline px-4 md:px-8 py-2.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <Tooltip content="Buka/Tutup Menu Navigasi" position="bottom">
          <button 
            onClick={() => {
              sound.playClick()
              toggleSidebar()
            }}
            className="md:hidden p-2 rounded-lg text-on-surface hover:bg-surface-low transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="hidden md:flex items-center gap-3">
          {/* Branch Switcher Dropdown */}
          <div className="relative">
            <Tooltip content="Ganti cabang kedai aktif" position="bottom">
              <button 
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="text-xs font-semibold text-on-surface bg-surface-low hover:bg-surface-high px-3 py-1.5 rounded-lg flex items-center gap-2 border border-outline transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{currentBranch.name}</span>
                <span className="text-[11px] text-on-surface-variant font-normal">({currentBranch.staffTarget} Staf)</span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            </Tooltip>
            
            {showBranchMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBranchMenu(false)} />
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-surface border border-outline rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="p-3 border-b border-outline bg-surface-low flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-on-surface flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent-primary" /> Pilih Cabang Aktif
                    </h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                    {branches.map(branch => (
                      <button 
                        key={branch.id}
                        onClick={() => {
                          sound.playSuccess()
                          useHRStore.setState({ activeBranch: branch.id })
                          toast.success(`Cabang dialihkan ke ${branch.name}`)
                          setShowBranchMenu(false)
                        }}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs",
                          activeBranch === branch.id 
                            ? "bg-accent-primary/10 text-accent-primary font-semibold" 
                            : "hover:bg-surface-low text-on-surface"
                        )}
                      >
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{branch.status} • {branch.staffTarget} Staf</p>
                        </div>
                        {activeBranch === branch.id && <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Calm Monospace Live Time */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-low border border-outline text-xs font-mono text-on-surface-variant">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="font-semibold text-on-surface">{formattedTime} WIB</span>
          </div>

          {/* Search Shortcut */}
          <Tooltip 
            title="Pencarian Cepat" 
            shortcut="Ctrl + K" 
            description="Cari karyawan, buka halaman modul, jadwal shift, atau slip gaji secara instan."
          >
            <button 
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="text-xs text-on-surface-variant hover:text-on-surface bg-surface-low hover:bg-surface-high px-2.5 py-1.5 rounded-lg border border-outline flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
            >
              <Keyboard className="w-3 h-3" />
              <span className="text-[11px]">Ctrl+K</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Role Switcher (Apple Segmented Style) */}
        <div className="flex items-center bg-surface-low p-1 rounded-lg border border-outline text-xs">
          <Tooltip 
            title="Mode Manajer" 
            badge="Akses Penuh" 
            description="Akses approval shift, penyusunan jadwal AI, rekapitulasi presensi, dan analitik payroll."
          >
            <button 
              onClick={() => {
                sound.playClick()
                setActiveRole('manager')
              }}
              className={cn(
                "px-3 py-1 rounded-md font-semibold transition-all cursor-pointer",
                activeRole === 'manager' 
                  ? "bg-surface text-on-surface shadow-sm border border-outline font-bold" 
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Manager
            </button>
          </Tooltip>
          <Tooltip 
            title="Mode Karyawan" 
            badge="Self-Service" 
            description="Akses mandiri staf untuk clock-in GPS, melihat jadwal pribadi, slip gaji digital, dan bursa swap shift."
          >
            <button 
              onClick={() => {
                sound.playClick()
                setActiveRole('karyawan')
              }}
              className={cn(
                "px-3 py-1 rounded-md font-semibold transition-all cursor-pointer",
                activeRole === 'karyawan' 
                  ? "bg-surface text-on-surface shadow-sm border border-outline font-bold" 
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Karyawan
            </button>
          </Tooltip>
        </div>

        {/* Sound Toggle */}
        <Tooltip 
          title="Umpan Balik Suara" 
          badge={soundEnabled ? "Aktif" : "Hening"} 
          description="Efek audio mikro untuk konfirmasi interaksi seperti clock-in, approval, dan perubahan jadwal."
        >
          <button 
            onClick={() => {
              toggleSound()
              sound.playClick()
            }}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-low border border-outline transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-accent-primary" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip 
          title="Tema Tampilan" 
          badge={theme === 'dark' ? "Mode Obsidian" : "Mode Terang"} 
          description={theme === 'dark' ? "Beralih ke tampilan warna terang (Slate & Calm White)." : "Beralih ke tampilan mode gelap (Obsidian Enterprise)."}
        >
          <button 
            onClick={() => {
              sound.playClick()
              setTheme(theme === 'light' ? 'dark' : 'light')
            }}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-low border border-outline transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </Tooltip>

        {/* Notifications Popover */}
        <div className="relative">
          <button 
            onClick={() => {
              sound.playClick()
              setShowNotifications(!showNotifications)
            }}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-low border border-outline relative cursor-pointer transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-surface border border-outline rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3 border-b border-outline bg-surface-low flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-on-surface">Pusat Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-accent-primary/10 text-accent-primary text-[10px] font-mono font-bold rounded">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-accent-primary hover:underline font-semibold cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-on-surface-variant">
                      <p className="font-semibold text-on-surface">Tidak ada notifikasi baru</p>
                      <p className="text-[11px] mt-0.5">Semua operasional terkendali.</p>
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
                            "p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 text-xs",
                            isUnread 
                              ? "bg-surface-low border-outline hover:border-slate-400" 
                              : "bg-surface border-transparent hover:bg-surface-low opacity-75"
                          )}
                        >
                          <div className={cn(
                            "p-1.5 rounded-lg shrink-0 mt-0.5",
                            notif.type === 'urgent' ? "bg-rose-500/10 text-rose-500" :
                            notif.type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                            "bg-sky-500/10 text-sky-500"
                          )}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-semibold text-on-surface truncate">{notif.title}</p>
                              <span className="text-[9px] font-mono text-on-surface-variant shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5 line-clamp-2">
                              {notif.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-5 w-px bg-outline mx-1 hidden sm:block"></div>

        {/* User Avatar */}
        <div className="flex items-center cursor-pointer">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqsh2fjO3Ftd_OTkZ6PG89xSAiXwKq-EkRzA2xiFlTuNFNmG_fza1UNG5Z0UR733ALmLmp7eT33UXa23vv5PkbVsr3vENVpvTKtUgGoX9djZggykVBTZbPVetA71QUORQ-SDMRAMrx-zz2YQgFnJ9pkHwUcCXHdZI-XYO9B-FarpFzc4wlHB9pUdTbTDrj0f-KnhcNBuxKR9eJG2bLfOZUnPwDytVbvKduQJegQDMKSm4bvONoqlc" 
            alt="Owner" 
            className="w-8 h-8 rounded-full object-cover ring-1 ring-outline"
          />
        </div>
      </div>
    </header>
  )
}

