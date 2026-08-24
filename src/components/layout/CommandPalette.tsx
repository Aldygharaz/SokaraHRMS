import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHRStore } from '@/store/useHRStore'
import { 
  Search, 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Users, 
  Target, 
  Heart, 
  Wand2, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Keyboard, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  X
} from 'lucide-react'
import { sound } from '@/lib/sound'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  category: 'Halaman' | 'Aksi Cepat' | 'Karyawan'
  icon: any
  shortcut?: string
  action: () => void
  meta?: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const setActiveRole = useHRStore(state => state.setActiveRole)
  const soundEnabled = useHRStore(state => state.soundEnabled)
  const toggleSound = useHRStore(state => state.toggleSound)
  const theme = useHRStore(state => state.theme)
  const setTheme = useHRStore(state => state.setTheme)
  const autoFillShifts = useHRStore(state => state.autoFillShifts)
  const addAuditLog = useHRStore(state => state.addAuditLog)

  // Listen for Ctrl+K, Cmd+K, and custom dispatch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(prev => {
          if (!prev) sound.playClick()
          return !prev
        })
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build commands list
  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Pages
      {
        id: 'nav-dashboard',
        title: 'Buka Dashboard',
        category: 'Halaman',
        icon: LayoutDashboard,
        action: () => { navigate('/'); setIsOpen(false) }
      },
      {
        id: 'nav-calendar',
        title: 'Buka Matriks Kalender Shift',
        category: 'Halaman',
        icon: Calendar,
        action: () => { navigate('/calendar'); setIsOpen(false) }
      },
      {
        id: 'nav-attendance',
        title: 'Buka Presensi GPS & Jam Kerja',
        category: 'Halaman',
        icon: Clock,
        action: () => { navigate('/attendance'); setIsOpen(false) }
      },
      {
        id: 'nav-payroll',
        title: 'Buka Penggajian & PPh 21 TER',
        category: 'Halaman',
        icon: DollarSign,
        action: () => { navigate('/payroll'); setIsOpen(false) }
      },
      {
        id: 'nav-approval',
        title: 'Buka Approval & Bursa Shift',
        category: 'Halaman',
        icon: CheckCircle2,
        action: () => { navigate('/approval'); setIsOpen(false) }
      },
      {
        id: 'nav-employees',
        title: 'Buka Manajemen Data Karyawan',
        category: 'Halaman',
        icon: Users,
        action: () => { navigate('/employees'); setIsOpen(false) }
      },
      {
        id: 'nav-goals',
        title: 'Buka Target & Pencapaian OKR',
        category: 'Halaman',
        icon: Target,
        action: () => { navigate('/goals'); setIsOpen(false) }
      },
      {
        id: 'nav-kudos',
        title: 'Buka Peer Recognition Wall (Kudos)',
        category: 'Halaman',
        icon: Heart,
        action: () => { navigate('/kudos'); setIsOpen(false) }
      },

      // Slide-over Triggers
      {
        id: 'act-kudos',
        title: 'Kirim Apresiasi Baru (Slide-over)',
        category: 'Aksi Cepat',
        icon: Heart,
        shortcut: 'K',
        action: () => {
          sound.playClick()
          setIsOpen(false)
          window.dispatchEvent(new CustomEvent('open-slideover', { detail: { type: 'kudos' } }))
        }
      },
      {
        id: 'act-export',
        title: 'Export Data Payroll Bank (Slide-over)',
        category: 'Aksi Cepat',
        icon: DollarSign,
        shortcut: 'E',
        action: () => {
          sound.playClick()
          setIsOpen(false)
          window.dispatchEvent(new CustomEvent('open-slideover', { detail: { type: 'export' } }))
        }
      },

      // Quick Actions
      {
        id: 'act-autofill',
        title: 'Auto-Fill Jadwal Shift dengan AI',
        category: 'Aksi Cepat',
        icon: Wand2,
        action: () => {
          sound.playSuccess()
          autoFillShifts()
          addAuditLog({ user: 'Manager', action: 'Auto-Fill Shift', detail: 'Mengisi roster dengan AI via Command Palette' })
          toast.success("Roster 5 hari ke depan berhasil diisi otomatis oleh AI")
          setIsOpen(false)
          navigate('/calendar')
        }
      },
      {
        id: 'act-role-toggle',
        title: `Ganti Mode ke: ${activeRole === 'manager' ? 'Karyawan (Staf Operasional)' : 'Manager (Admin Kedai)'}`,
        category: 'Aksi Cepat',
        icon: ShieldCheck,
        action: () => {
          const next = activeRole === 'manager' ? 'karyawan' : 'manager'
          setActiveRole(next)
          sound.playClick()
          toast.info(`Beralih ke mode ${next === 'manager' ? 'Manager' : 'Karyawan'}`)
          setIsOpen(false)
        }
      },
      {
        id: 'act-sound-toggle',
        title: soundEnabled ? 'Matikan Efek Suara (Mute Audio)' : 'Aktifkan Efek Suara Web Audio',
        category: 'Aksi Cepat',
        icon: soundEnabled ? VolumeX : Volume2,
        action: () => {
          toggleSound()
          sound.playClick()
          toast.info(soundEnabled ? 'Efek suara dinonaktifkan' : 'Efek suara diaktifkan')
          setIsOpen(false)
        }
      },
      {
        id: 'act-theme-toggle',
        title: `Ganti Tema ke: ${theme === 'dark' ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Discord Dark)'}`,
        category: 'Aksi Cepat',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => {
          const next = theme === 'dark' ? 'light' : 'dark'
          setTheme(next)
          sound.playClick()
          toast.info(`Tema diubah ke ${next === 'dark' ? 'Gelap' : 'Terang'}`)
          setIsOpen(false)
        }
      },
      {
        id: 'act-shortcut-modal',
        title: 'Buka Cheatsheet Pintasan Keyboard',
        category: 'Aksi Cepat',
        icon: Keyboard,
        shortcut: '?',
        action: () => {
          setIsOpen(false)
          window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
        }
      }
    ]

    // Employees entries for instant fuzzy profile lookup
    employees.forEach(emp => {
      list.push({
        id: `emp-${emp.id}`,
        title: `${emp.name} • ${emp.role}`,
        category: 'Karyawan',
        icon: User,
        meta: `Rp ${emp.baseSalary.toLocaleString('id-ID')} | PTKP: ${emp.ptkp}`,
        action: () => {
          sound.playClick()
          setIsOpen(false)
          navigate('/employees')
        }
      })
    })

    return list
  }, [employees, activeRole, soundEnabled, theme, navigate, autoFillShifts, addAuditLog, setActiveRole, toggleSound, setTheme])

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q) ||
      (c.meta && c.meta.toLowerCase().includes(q))
    )
  }, [commands, query])

  // Handle arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filteredCommands[selectedIndex]
      if (selected) {
        selected.action()
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)} 
      />

      {/* Palette Container */}
      <div 
        className="relative w-full max-w-xl bg-surface border border-outline rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-outline gap-3 bg-surface-container-lowest">
          <Search className="w-5 h-5 text-accent-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari navigasi, aksi AI, atau nama staf... (Gunakan ↑ ↓ Enter)"
            className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-surface-container border border-outline text-[10px] font-mono text-on-surface-variant font-bold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 flex-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-xs space-y-1">
              <p className="font-bold text-on-surface">Tidak ada hasil yang cocok</p>
              <p>Coba kata kunci lain seperti "Gaji", "Jadwal", "Dimas", atau "Auto-Fill".</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = idx === selectedIndex

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    sound.playClick()
                    cmd.action()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors",
                    isSelected 
                      ? "bg-accent-primary text-white" 
                      : "text-on-surface hover:bg-surface-container-low"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "p-2 rounded-xl shrink-0",
                      isSelected ? "bg-white/20 text-white" : "bg-surface-container text-accent-primary"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className={cn("font-bold truncate", isSelected ? "text-white" : "text-on-surface")}>
                        {cmd.title}
                      </p>
                      {cmd.meta && (
                        <p className={cn("text-[10px] truncate", isSelected ? "text-white/80" : "text-on-surface-variant")}>
                          {cmd.meta}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                    )}>
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold",
                        isSelected ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface-variant"
                      )}>
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-outline bg-surface-container-lowest flex items-center justify-between text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline text-[10px] font-bold">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline text-[10px] font-bold">↓</kbd> Navigasi
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline text-[10px] font-bold">↵</kbd> Eksekusi
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-accent-primary">
            Sokara Spotlight Search
          </span>
        </div>
      </div>
    </div>
  )
}
