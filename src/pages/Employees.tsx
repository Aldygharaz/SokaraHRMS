import { useHRStore, type Employee } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { UserPlus, Star, ShieldCheck, FilterX, X, Trash2, MessageCircle, Calendar } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { cn, formatThousandDots, parseThousandDots } from '@/lib/utils'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'

export function Employees() {
  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const addEmployee = useHRStore(state => state.addEmployee)
  const deleteEmployee = useHRStore(state => state.deleteEmployee)
  
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

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
        toast.info('Filter karyawan direset (Ctrl+Shift+F)')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (activeFilter === 'Semua') return true
      if (activeFilter === 'Barista') return emp.dept === 'Bar' || emp.role.includes('Barista')
      if (activeFilter === 'Kasir') return emp.dept === 'Front' || emp.role.includes('Kasir')
      if (activeFilter === 'High Risk') return (emp.attritionRisk || 0) > 40
      return true
    })
  }, [employees, activeFilter])

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

      {/* Filter Tabs */}
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
              "px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5",
              activeFilter === id 
                ? "bg-accent-primary text-white border-accent-primary shadow-md" 
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline"
            )}
          >
            <span>{label}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
              activeFilter === id ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface-variant"
            )}>
              {count}
            </span>
          </button>
        ))}
        {activeFilter !== 'Semua' && (
          <button 
            onClick={() => {
              sound.playClick()
              setActiveFilter('Semua')
            }}
            className="ml-auto flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-on-surface px-3 py-2 transition-colors cursor-pointer"
            title="Reset Filter (Ctrl+Shift+F)"
          >
            <FilterX className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => (
          <TiltCard 
            key={emp.id} 
            onClick={() => {
              sound.playClick()
              setSelectedEmployee(emp)
            }}
            className="glass-panel rounded-2xl border border-outline p-5 group hover:border-accent-primary/40 transition-all cursor-pointer flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="relative">
                <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-surface-container-high group-hover:border-accent-primary transition-colors" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-psy-safe text-white rounded-full flex items-center justify-center border-2 border-surface" title="Status: Aktif">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                (emp.attritionRisk || 0) > 40 ? "bg-psy-danger-bg text-psy-danger-text border border-psy-danger/20" : "bg-psy-safe-bg text-psy-safe-text border border-psy-safe/20"
              )}>
                {(emp.attritionRisk || 0) > 40 ? 'Risk Tinggi' : 'Stabil'}
              </span>
            </div>
            
            <div className="mb-4 flex-grow">
              <h3 className="font-bold text-base text-on-surface font-display">{emp.name}</h3>
              <p className="text-xs text-on-surface-variant font-medium">{emp.role} • {emp.dept}</p>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Performa KPI</span>
                <span className="flex items-center gap-1 font-bold text-on-surface font-mono">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" /> {emp.rating}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Ketepatan Waktu</span>
                <span className="font-bold text-psy-safe font-mono">{emp.punctuality}%</span>
              </div>
              
              <div className="pt-3 border-t border-dashed border-outline flex flex-wrap gap-1.5">
                {emp.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-md border border-outline">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Modal Detail Karyawan */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedEmployee(null)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
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
              <button onClick={() => setSelectedEmployee(null)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline text-center">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Rating</p>
                <p className="text-lg font-bold text-on-surface font-mono mt-0.5">{selectedEmployee.rating} / 5.0</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline text-center">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Punctuality</p>
                <p className="text-lg font-bold text-psy-safe font-mono mt-0.5">{selectedEmployee.punctuality}%</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline text-center">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Attrition Risk</p>
                <p className={cn("text-lg font-bold font-mono mt-0.5", (selectedEmployee.attritionRisk || 0) > 40 ? "text-psy-danger" : "text-psy-safe")}>
                  {selectedEmployee.attritionRisk || 5}%
                </p>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline space-y-2 text-xs mb-5">
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
            <div className="space-y-2 mb-5">
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
                    <div key={idx} className="p-2 rounded-xl bg-surface-container-lowest border border-outline space-y-1">
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

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline">
              <div className="flex items-center gap-2">
                <a 
                  href={`https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(selectedEmployee.name)},%20terkait%20jadwal%20operasional%20kedai%20Senopati...`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="px-3.5 py-2 rounded-xl bg-psy-safe-bg text-psy-safe-text hover:bg-psy-safe hover:text-white border border-psy-safe/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Hubungi WhatsApp
                </a>

                {activeRole === 'manager' && (
                  <button
                    onClick={() => handleDelete(selectedEmployee.id, selectedEmployee.name)}
                    className="px-3.5 py-2 rounded-xl border border-psy-danger/30 text-psy-danger hover:bg-psy-danger/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer font-display"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Karyawan */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold font-display text-lg text-on-surface">Tambah Karyawan Baru</h3>
                <p className="text-xs text-on-surface-variant">Lengkapi data profil dan struktur penggajian</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-on-surface-variant block mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Reza Rahardian"
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-2.5 text-on-surface font-medium outline-none focus:border-accent-primary"
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
                    className="w-full bg-surface-container-low border border-outline rounded-xl p-2.5 text-on-surface font-medium outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">Departemen</label>
                  <select 
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline rounded-xl p-2.5 text-on-surface font-medium outline-none focus:border-accent-primary"
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
                    <span className="absolute left-2.5 text-xs font-mono font-bold text-on-surface-variant pointer-events-none">Rp</span>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={formatThousandDots(formData.baseSalary)}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setFormData({ ...formData, baseSalary: parseThousandDots(e.target.value) })}
                      placeholder="Contoh: 4.500.000"
                      className="w-full pl-8 bg-surface-container-low border border-outline rounded-xl p-2.5 text-on-surface font-mono font-medium outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">Upah Lembur / Jam (Rp)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs font-mono font-bold text-on-surface-variant pointer-events-none">Rp</span>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={formatThousandDots(formData.rate)}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setFormData({ ...formData, rate: parseThousandDots(e.target.value) })}
                      placeholder="Contoh: 25.000"
                      className="w-full pl-8 bg-surface-container-low border border-outline rounded-xl p-2.5 text-on-surface font-mono font-medium outline-none focus:border-accent-primary"
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
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-2.5 text-on-surface font-medium outline-none focus:border-accent-primary"
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
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-2.5 text-on-surface font-medium outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline hover:bg-surface-container text-on-surface-variant font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold flex items-center justify-center gap-1.5 hover:shadow-lg transition-all cursor-pointer font-display"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
