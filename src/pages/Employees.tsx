import { useHRStore, type Employee } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { UserPlus, Star, ShieldCheck, FilterX, X, Trash2, MessageCircle, Calendar, Search } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { cn, formatThousandDots, parseThousandDots } from '@/lib/utils'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'
import { EmptyState } from '@/components/ui/EmptyState'
import { SlideOver } from '@/components/ui/SlideOver'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function Employees() {
  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const addEmployee = useHRStore(state => state.addEmployee)
  const deleteEmployee = useHRStore(state => state.deleteEmployee)
  
  const [activeMainTab, setActiveMainTab] = useState<'directory' | 'matrix'>('directory')
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Floating Bulk Action State
  const [selectedBulkIds, setSelectedBulkIds] = useState<number[]>([])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Barista',
    dept: 'Bar',
    baseSalary: 4500000,
    rate: 25000,
    ptkp: 'TK/0',
    kat: 'A',
    skills: 'Barista, Espresso',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        setActiveFilter('Semua')
        setSearchQuery('')
        toast.info('Filter & pencarian karyawan direset (Ctrl+Shift+F)')
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // 1. Category Filter
      let matchesFilter = true
      if (activeFilter === 'Barista') matchesFilter = emp.dept === 'Bar' || emp.role.includes('Barista')
      else if (activeFilter === 'Kasir') matchesFilter = emp.dept === 'Front' || emp.role.includes('Kasir')
      else if (activeFilter === 'High Risk') matchesFilter = (emp.attritionRisk || 0) > 40

      if (!matchesFilter) return false

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      const matchesName = emp.name.toLowerCase().includes(q)
      const matchesRole = emp.role.toLowerCase().includes(q)
      const matchesDept = emp.dept.toLowerCase().includes(q)
      const matchesSkills = emp.skills?.some(s => s.toLowerCase().includes(q))
      const matchesPtkp = emp.ptkp?.toLowerCase().includes(q)

      return matchesName || matchesRole || matchesDept || matchesSkills || matchesPtkp
    })
  }, [employees, activeFilter, searchQuery])

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      sound.playWarning()
      toast.error("Nama karyawan wajib diisi.")
      return
    }

    sound.playSuccess()
    const skillList = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    
    addEmployee({
      name: formData.name.trim(),
      role: formData.role,
      dept: formData.dept,
      baseSalary: Number(formData.baseSalary),
      rate: Number(formData.rate),
      ptkp: formData.ptkp,
      kat: formData.kat,
      skills: skillList.length > 0 ? skillList : ['Staff'],
      avatar: formData.avatar,
      rating: 5.0,
      punctuality: 100,
      nightShiftsMonth: 0,
      overtimeHours: 0
    })

    toast.success(`Karyawan ${formData.name} berhasil ditambahkan!`)
    setShowAddModal(false)
    setFormData({
      name: '',
      role: 'Barista',
      dept: 'Bar',
      baseSalary: 4500000,
      rate: 25000,
      ptkp: 'TK/0',
      kat: 'A',
      skills: 'Barista, Espresso',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    })
  }

  const restoreSnapshot = useHRStore(state => state.restoreSnapshot)
  const shifts = useHRStore(state => state.shifts)

  const handleDelete = (id: number, name: string) => {
    const prevEmployees = [...employees]
    const prevShifts = { ...shifts }

    sound.playWarning()
    deleteEmployee(id)
    setSelectedEmployee(null)

    toast.success(`Data ${name} dihapus dari daftar karyawan.`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          sound.playSuccess()
          restoreSnapshot({ employees: prevEmployees, shifts: prevShifts })
          toast.info(`Penghapusan data ${name} dibatalkan.`)
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">Data Karyawan</h2>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold uppercase tracking-wider border border-semantic-neutral/30 font-mono">
              {employees.length} Aktif
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Database manajemen talenta, matriks kompetensi, skor kepatuhan, dan profil risiko kelelahan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeRole === 'manager' && (
            <button 
              onClick={() => {
                sound.playClick()
                setShowAddModal(true)
              }}
              className="bg-gradient-to-r from-accent-primary to-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all hover:shadow-[0_0_18px_rgba(27,95,174,0.4)] cursor-pointer font-display"
            >
              <UserPlus className="w-4 h-4" /> Tambah Karyawan Baru
            </button>
          )}
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex items-center gap-2 border-b border-outline pb-2">
        <button
          onClick={() => { sound.playClick(); setActiveMainTab('directory') }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeMainTab === 'directory' ? "bg-accent-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          Direktori Karyawan ({employees.length})
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveMainTab('matrix') }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeMainTab === 'matrix' ? "bg-accent-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <ShieldCheck className="w-4 h-4" /> Station Skill Matrix & Readiness
        </button>
      </div>

      {activeMainTab === 'directory' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-2xl border border-outline">
            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md flex items-center">
              <Search className="w-4 h-4 text-accent-primary absolute left-3.5 pointer-events-none" />
              <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, divisi, role, skill barista... (Tekan '/' untuk fokus)"
                className="w-full bg-surface-container-lowest border border-outline rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-on-surface outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'Semua', label: 'Semua', count: employees.length },
                { id: 'Barista', label: 'Barista', count: employees.filter(e => e.dept === 'Bar' || e.role.includes('Barista')).length },
                { id: 'Kasir', label: 'Kasir', count: employees.filter(e => e.dept === 'Front' || e.role.includes('Kasir')).length },
                { id: 'High Risk', label: 'High Risk', count: employees.filter(e => (e.attritionRisk || 0) > 40).length }
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  data-testid={`filter-${id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    sound.playClick()
                    setActiveFilter(id)
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5",
                    activeFilter === id 
                      ? "bg-accent-primary text-white border-accent-primary shadow-sm" 
                      : "bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant border-outline"
                  )}
                >
                  <span>{label}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                    activeFilter === id ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                  )}>
                    {count}
                  </span>
                </button>
              ))}

              {(activeFilter !== 'Semua' || searchQuery) && (
                <button 
                  onClick={() => {
                    sound.playClick()
                    setActiveFilter('Semua')
                    setSearchQuery('')
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-accent-primary px-2.5 py-1.5 transition-colors cursor-pointer"
                  title="Reset Filter & Pencarian (Ctrl+Shift+F)"
                >
                  <FilterX className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={FilterX}
                title="Tidak Ada Karyawan Ditemukan"
                description={searchQuery 
                  ? `Pencarian "${searchQuery}" tidak cocok dengan nama atau kualifikasi staf manapun.`
                  : `Filter "${activeFilter}" tidak memiliki staf yang terdaftar.`}
                actionLabel="Reset Pencarian & Filter"
                onAction={() => { 
                  sound.playClick()
                  setActiveFilter('Semua')
                  setSearchQuery('')
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedBulkIds.includes(emp.id)
                
                return (
                <TiltCard 
                  key={emp.id} 
                  onClick={() => {
                    sound.playClick()
                    setSelectedEmployee(emp)
                  }}
                  className={cn(
                    "glass-panel rounded-2xl border p-5 group transition-all cursor-pointer flex flex-col h-full relative",
                    isSelected ? "border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary" : "border-outline hover:border-accent-primary/40"
                  )}
                >
                  {/* Bulk Select Checkbox */}
                  {activeRole === 'manager' && (
                    <div 
                      className="absolute top-4 right-4 z-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        sound.playClick()
                        setSelectedBulkIds(prev => 
                          prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]
                        )
                      }}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        isSelected ? "bg-accent-primary border-accent-primary text-white" : "border-outline bg-surface-container hover:border-accent-primary"
                      )}>
                        {isSelected && <ShieldCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4 pr-6">
                    <div className="relative">
                      <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-surface-container-high group-hover:border-accent-primary transition-colors" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-psy-safe text-white rounded-full flex items-center justify-center border-2 border-surface" title="Status: Aktif">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-bold rounded-lg border border-outline mb-1">
                        {emp.dept}
                      </span>
                      <p className="text-[10px] font-mono text-on-surface-variant font-medium">TER: {emp.kat}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-on-surface text-base group-hover:text-accent-primary transition-colors font-display">{emp.name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium">{emp.role}</p>
                  </div>

                  <div className="mt-auto space-y-3 pt-3 border-t border-outline">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-medium">Rating</span>
                      <span className="font-bold font-mono text-on-surface flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-semantic-warning text-semantic-warning" />
                        {emp.rating}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-medium">Punctuality</span>
                      <span className="font-bold font-mono text-psy-safe">{emp.punctuality}%</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {emp.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-md border border-outline">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              )})}
            </div>
          )}

          {/* Floating Bulk Action Bar (Asana/Linear UX) */}
          {selectedBulkIds.length > 0 && activeRole === 'manager' && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-surface/95 backdrop-blur-xl border border-accent-primary/50 shadow-2xl rounded-2xl p-2.5 flex flex-wrap items-center justify-center gap-2 animate-in slide-in-from-bottom-5">
              <div className="flex items-center gap-2 pl-2 pr-3 border-r border-outline">
                <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
                <span className="font-bold text-xs font-mono text-on-surface whitespace-nowrap">
                  {selectedBulkIds.length} Staf Terpilih
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button 
                  onClick={() => {
                    sound.playSuccess()
                    toast.success(`${selectedBulkIds.length} staf berhasil di-approve / diverifikasi.`)
                    setSelectedBulkIds([])
                    import('@/lib/confetti').then(({ fireConfetti }) => fireConfetti())
                  }}
                  className="px-3 py-1.5 rounded-xl bg-accent-primary text-white font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve Verifikasi
                </button>

                <button 
                  onClick={() => {
                    sound.playClick()
                    toast.info(`Opsi edit shift massal untuk ${selectedBulkIds.length} staf (WIP).`)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold border border-outline transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4" /> Assign Shift (Batch)
                </button>

                <button 
                  onClick={() => {
                    sound.playClick()
                    setSelectedBulkIds([])
                  }}
                  className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant cursor-pointer ml-1 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Station Skill Matrix & Readiness View (7shifts / Toast Standard) */
        <div className="glass-panel spotlight-card rounded-3xl overflow-hidden overflow-x-auto border border-outline">
          <div className="p-4 border-b border-outline bg-surface-container-lowest flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-on-surface font-display uppercase tracking-wider">
                Station Skill Matrix & Operational Readiness
              </h3>
              <p className="text-xs text-on-surface-variant">Pemetaan kompetensi stasiun kerja per staf untuk auto-scheduling bebas botleneck</p>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">{employees.length} Staf Terpetakan</span>
          </div>

          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-high text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                <th className="p-4">Karyawan</th>
                <th className="p-4">Espresso Bar</th>
                <th className="p-4">POS Frontline</th>
                <th className="p-4">Cold Kitchen</th>
                <th className="p-4">Closing Sanitasi</th>
                <th className="p-4">Ketersediaan</th>
                <th className="p-4">Tingkat Risiko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-xs">
              {employees.map(emp => {
                const isBarista = emp.dept === 'Bar' || emp.role.includes('Barista')
                const isKasir = emp.dept === 'Front' || emp.role.includes('Kasir')
                const hasUnavail = emp.unavailability && emp.unavailability.length > 0

                return (
                  <tr key={emp.id} className="hover:bg-surface-container/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-xl object-cover border border-outline" />
                        <div>
                          <p className="font-bold text-on-surface">{emp.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold",
                        isBarista ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30" : "bg-surface-container text-on-surface-variant"
                      )}>
                        {isBarista ? '★ Master Barista' : 'Basic Espresso'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold",
                        isKasir ? "bg-tertiary/20 text-tertiary border border-tertiary/30" : "bg-surface-container text-on-surface-variant"
                      )}>
                        {isKasir ? '★ Kasir Lead' : 'Basic POS'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant font-mono text-[10px] font-bold">
                        ✓ Food Safety
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30 font-mono text-[10px] font-bold">
                        ✓ Lead Closing
                      </span>
                    </td>
                    <td className="p-4">
                      {hasUnavail ? (
                        <span className="px-2 py-0.5 rounded-full bg-psy-warning-bg text-psy-warning-text font-bold text-[10px] font-mono">
                          Kuliah ({emp.unavailability?.length} Hari)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-psy-safe-bg text-psy-safe-text font-bold text-[10px] font-mono">
                          Full-Time
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-mono text-[10px] font-bold",
                        (emp.attritionRisk || 0) > 40 ? "bg-error/10 text-error" : "bg-psy-safe-bg text-psy-safe-text"
                      )}>
                        {(emp.attritionRisk || 0) > 40 ? `High Risk (${emp.attritionRisk}%)` : `Rendah (${emp.attritionRisk || 12}%)`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Karyawan */}
      <SlideOver
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title="Profil & Analisis Karyawan"
        width="max-w-lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-primary" />
                <div>
                  <h3 className="font-bold font-display text-xl text-on-surface">{selectedEmployee.name}</h3>
                  <p className="text-xs text-on-surface-variant">{selectedEmployee.role} • Departemen {selectedEmployee.dept}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-surface-container-high rounded-md text-[10px] font-mono font-bold">
                    PTKP: {selectedEmployee.ptkp} / TER KAT {selectedEmployee.kat}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline text-center shadow-sm">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Rating</p>
                <p className="text-lg font-bold text-on-surface font-mono mt-0.5">{selectedEmployee.rating} / 5.0</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline text-center shadow-sm">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Punctuality</p>
                <p className="text-lg font-bold text-psy-safe font-mono mt-0.5">{selectedEmployee.punctuality}%</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline text-center shadow-sm">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Attrition Risk</p>
                <p className={cn("text-lg font-bold font-mono mt-0.5", (selectedEmployee.attritionRisk || 0) > 40 ? "text-psy-danger" : "text-psy-safe")}>
                  {selectedEmployee.attritionRisk || 5}%
                </p>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline space-y-2 text-xs shadow-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Gaji Pokok:</span>
                <span className="font-bold font-mono text-on-surface">Rp {selectedEmployee.baseSalary.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Rate Lembur / Jam:</span>
                <span className="font-bold font-mono text-on-surface">Rp {selectedEmployee.rate.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Faktor Analisis:</span>
                <span className="font-medium text-on-surface-variant text-right">
                  {selectedEmployee.attritionFactors?.join(', ') || 'Normal'}
                </span>
              </div>
            </div>

            {/* Weekly Mini-Roster 7-Day Matrix */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent-primary" /> Roster 7 Hari Ini:
                </span>
                <span className="font-mono text-[10px]">Tgl 20 - 26 Agu</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => {
                  const shift = (shifts[selectedEmployee.id] || Array(7).fill('OFF'))[idx] || 'OFF'
                  return (
                    <div key={idx} className="p-2 rounded-xl bg-surface-container-lowest border border-outline space-y-1 shadow-sm">
                      <p className="text-[10px] text-on-surface-variant font-bold">{day}</p>
                      <span className={cn(
                        "text-[9px] font-bold px-1 py-0.5 rounded block",
                        shift === 'Pagi' ? "bg-accent-primary/20 text-accent-primary" :
                        shift === 'Sore' ? "bg-tertiary/20 text-tertiary" :
                        shift === 'Closing' ? "bg-semantic-warning/20 text-semantic-warning" :
                        "bg-surface-container text-on-surface-variant"
                      )}>
                        {shift}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SlideOver Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-outline">
              <a 
                href={`https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(selectedEmployee.name)},%20terkait%20jadwal%20operasional%20kedai%20Senopati...`}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="w-full py-3 rounded-xl bg-psy-safe text-white hover:bg-psy-safe/90 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" /> Hubungi WhatsApp
              </a>

              {activeRole === 'manager' && (
                <button
                  onClick={() => {
                    sound.playClick()
                    setDeleteTarget(selectedEmployee)
                  }}
                  className="w-full py-3 rounded-xl border border-psy-danger/30 text-psy-danger hover:bg-psy-danger/10 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Data Karyawan
                </button>
              )}
            </div>
          </div>
        )}
      </SlideOver>

      {/* SlideOver Tambah Karyawan */}
      <SlideOver
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Karyawan Baru"
        width="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant mb-2">Lengkapi data profil dan struktur penggajian untuk mendaftarkan staf baru ke dalam sistem.</p>
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-on-surface-variant block mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Reza Rahardian"
                className="w-full bg-surface-container-lowest border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-on-surface-variant block mb-1">Posisi / Role</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
                />
              </div>
              <div>
                <label className="font-bold text-on-surface-variant block mb-1">Departemen</label>
                <select 
                  value={formData.dept}
                  onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
                >
                  <option value="Bar">Bar (Barista)</option>
                  <option value="Front">Front (Kasir/Server)</option>
                  <option value="Kitchen">Kitchen</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-on-surface-variant block mb-1">Gaji Pokok (Rp)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono font-bold text-on-surface-variant pointer-events-none">Rp</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={formatThousandDots(formData.baseSalary)}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setFormData({ ...formData, baseSalary: parseThousandDots(e.target.value) })}
                    placeholder="Contoh: 4.500.000"
                    className="w-full pl-9 bg-surface-container-lowest border border-outline rounded-xl p-3 text-on-surface font-mono font-medium outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-on-surface-variant block mb-1">Upah Lembur / Jam (Rp)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono font-bold text-on-surface-variant pointer-events-none">Rp</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={formatThousandDots(formData.rate)}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setFormData({ ...formData, rate: parseThousandDots(e.target.value) })}
                    placeholder="Contoh: 25.000"
                    className="w-full pl-9 bg-surface-container-lowest border border-outline rounded-xl p-3 text-on-surface font-mono font-medium outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-on-surface-variant block mb-1">TER Kategori & PTKP</label>
              <select 
                value={`${formData.kat}-${formData.ptkp}`}
                onChange={(e) => {
                  const [kat, ptkp] = e.target.value.split('-')
                  setFormData({ ...formData, kat, ptkp })
                }}
                className="w-full bg-surface-container-lowest border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
              >
                <option value="A-TK/0">Kategori A (TK/0)</option>
                <option value="A-TK/1">Kategori A (TK/1)</option>
                <option value="B-K/1">Kategori B (K/1)</option>
                <option value="C-K/3">Kategori C (K/3)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-on-surface-variant block mb-1">Skill / Kompetensi (Pisahkan Koma)</label>
              <input 
                type="text" 
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Contoh: Barista Senior, POS Master, Latte Art"
                className="w-full bg-surface-container-lowest border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2 pt-6 mt-4 border-t border-outline">
              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-accent-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display shadow-md"
              >
                <UserPlus className="w-4 h-4" /> Simpan Data Karyawan
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="w-full py-3.5 rounded-xl border border-outline hover:bg-surface-container text-on-surface-variant font-bold cursor-pointer transition-colors"
              >
                Batal & Tutup
              </button>
            </div>
          </form>
        </div>
      </SlideOver>

      {/* Confirm Modal Hapus Karyawan */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id, deleteTarget.name)
            setDeleteTarget(null)
          }
        }}
        title={`Hapus Data ${deleteTarget?.name}?`}
        description={`Tindakan ini akan menghapus data profil, riwayat penugasan shift mingguan, dan konfigurasi penggajian ${deleteTarget?.name}. Anda masih dapat membatalkannya melalui tombol Undo.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  )
}
