import { useHRStore } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { UserPlus, MoreVertical, Star, ShieldCheck, FilterX } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function Employees() {
  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const [activeFilter, setActiveFilter] = useState('Semua')

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">Data Karyawan</h2>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold uppercase tracking-wider border border-semantic-neutral/30">{employees.length} Aktif</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Manajemen database karyawan, kompetensi, dan histori performa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeRole === 'manager' && (
            <button 
              onClick={() => toast.info("Fitur penambahan karyawan akan hadir di update selanjutnya.")}
              className="bg-gradient-to-r from-accent-primary to-primary text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all hover:shadow-[0_0_18px_rgba(27,95,174,0.4)]"
            >
              <UserPlus className="w-4 h-4" /> Tambah Karyawan
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {['Semua', 'Barista', 'Kasir', 'High Risk'].map(f => (
          <button
            key={f}
            data-testid={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all border",
              activeFilter === f 
                ? "bg-accent-primary text-white border-accent-primary shadow-md" 
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline"
            )}
          >
            {f}
          </button>
        ))}
        {activeFilter !== 'Semua' && (
          <button 
            onClick={() => setActiveFilter('Semua')}
            className="ml-auto flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-on-surface px-3 py-2 transition-colors"
            title="Reset Filter (Ctrl+Shift+F)"
          >
            <FilterX className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => (
          <TiltCard key={emp.id} className="glass-panel rounded-2xl border border-outline p-5 group hover:border-accent-primary/40 transition-all cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="relative">
                <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-full object-cover border-2 border-surface-container-high group-hover:border-accent-primary transition-colors" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-psy-safe text-white rounded-full flex items-center justify-center border-2 border-surface" title="Aktif">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); toast.info("Opsi lanjutan karyawan (Edit/Hapus)"); }}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mb-4 flex-grow">
              <h3 className="font-bold text-base text-on-surface font-display">{emp.name}</h3>
              <p className="text-xs text-on-surface-variant font-medium">{emp.role} • {emp.dept}</p>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Performa</span>
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
                  <span key={idx} className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-md border border-outline">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
