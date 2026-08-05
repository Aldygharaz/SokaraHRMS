
import { useState, useMemo } from 'react';
import { useHRStore } from '@/store/useHRStore'
import { Printer, Wand2, Filter, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function Calendar() {
  const { employees, shifts, activeRole, autoFillShifts, addAuditLog } = useHRStore()
  const [filter, setFilter] = useState('ALL')
  
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (filter === 'ALL') return true
      if (filter === 'Barista' && emp.role.includes('Barista')) return true
      if (filter === 'Pagi') return shifts[emp.id]?.includes('Pagi')
      if (filter === 'Sore') return shifts[emp.id]?.includes('Sore')
      return false
    })
  }, [employees, filter, shifts])

  const heatmapCounts = useMemo(() => {
    const counts = { pagi: [] as number[], sore: [] as number[] }
    for (let i = 0; i < 7; i++) {
      counts.pagi.push(employees.filter(e => shifts[e.id]?.[i] === 'Pagi').length)
      counts.sore.push(employees.filter(e => shifts[e.id]?.[i] === 'Sore').length)
    }
    return counts
  }, [employees, shifts])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">Shift Calendar</h2>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold uppercase tracking-wider border border-semantic-neutral/30">Hero Module</span>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/40 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">balance</span> Indeks Keadilan: 94/100
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Filter multi-dimensi berdasarkan peran, jenis shift, atau preset cepat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => toast.success("Roster berhasil dikirim ke printer")}
            className="bg-surface-container-high text-on-surface hover:text-accent-primary border border-surface-container-highest text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1"
          >
            <Printer className="w-4 h-4 text-accent-primary" /> Cetak Roster
          </button>
          
          {activeRole === 'manager' && (
            <button 
              onClick={() => {
                autoFillShifts()
                addAuditLog({ user: 'Manager', action: 'Auto-Fill Shift', detail: 'Mengisi roster kosong 5 hari ke depan dengan AI' })
                toast.success("Jadwal 5 hari ke depan berhasil diisi otomatis oleh AI")
              }}
              className="bg-gradient-to-r from-accent-primary to-primary text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 hover:shadow-[0_0_18px_rgba(27,95,174,0.4)] transition-all font-display"
            >
              <Wand2 className="w-4 h-4" /> Auto-Fill 5 Hari
            </button>
          )}
        </div>
      </div>

      {activeRole === 'manager' && (
        <div className="glass-panel p-5 rounded-2xl border border-outline">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-on-surface text-sm font-display uppercase tracking-wider">Shift Coverage Heatmap</h3>
            <Info className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="grid grid-cols-8 gap-2 text-xs">
            <div className="font-bold text-on-surface-variant flex items-center justify-end pr-2 border-r border-outline">Target</div>
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, idx) => (
              <div key={idx} className="font-bold text-center text-on-surface pb-2 border-b border-outline">{day}</div>
            ))}

            <div className="font-bold text-on-surface-variant flex items-center justify-end pr-2 border-r border-outline">Pagi (2)</div>
            {heatmapCounts.pagi.map((count, dayIdx) => (
              <div key={`pagi-${dayIdx}`} className={cn("p-2 rounded-lg text-center font-bold font-mono transition-colors", count >= 2 ? "bg-psy-safe/20 text-psy-safe-text" : count === 1 ? "bg-psy-warning/20 text-psy-warning-text" : "bg-error/20 text-error")} title={`${count} staf pagi`}>
                {count}
              </div>
            ))}

            <div className="font-bold text-on-surface-variant flex items-center justify-end pr-2 border-r border-outline">Sore (2)</div>
            {heatmapCounts.sore.map((count, dayIdx) => (
              <div key={`sore-${dayIdx}`} className={cn("p-2 rounded-lg text-center font-bold font-mono transition-colors", count >= 2 ? "bg-psy-safe/20 text-psy-safe-text" : count === 1 ? "bg-psy-warning/20 text-psy-warning-text" : "bg-error/20 text-error")} title={`${count} staf sore`}>
                {count}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-3 rounded-2xl border border-surface-container-high text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-on-surface-variant font-bold mr-1 flex items-center gap-1"><Filter className="w-3.5 h-3.5"/> Preset Filter:</span>
          {['ALL', 'Barista', 'Pagi', 'Sore'].map(p => (
            <button 
              key={p}
              onClick={() => setFilter(p)}
              className={cn("px-3 py-1 rounded-xl font-bold transition-all", filter === p ? "bg-accent-primary text-white" : "bg-surface-container-high text-on-surface hover:text-accent-primary")}
            >
              {p === 'ALL' ? 'Semua Staf' : p === 'Barista' ? 'Barista Only' : `Shift ${p} Only`}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel spotlight-card rounded-2xl overflow-hidden overflow-x-auto border border-outline p-0">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-surface-container-high text-xs text-on-surface-variant uppercase tracking-wider font-bold">
              <th className="p-4 w-48">Karyawan & Skill Tag</th>
              <th className="p-4 text-center">Sen (20)</th>
              <th className="p-4 text-center">Sel (21)</th>
              <th className="p-4 text-center">Rab (22)</th>
              <th className="p-4 text-center bg-accent-primary/15 text-accent-primary font-bold">Kam (23)</th>
              <th className="p-4 text-center">Jum (24)</th>
              <th className="p-4 text-center">Sab (25)</th>
              <th className="p-4 text-center">Min (26)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-xs">
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="hover:bg-surface-container transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-on-surface">{emp.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{emp.role}</p>
                    </div>
                  </div>
                </td>
                {(shifts[emp.id] || Array(7).fill('OFF')).map((shift, i) => (
                  <td key={i} className="p-4 text-center">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider",
                      shift === 'Pagi' ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30" :
                      shift === 'Sore' ? "bg-tertiary/20 text-tertiary border border-tertiary/30" :
                      shift === 'Closing' ? "bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30" :
                      "bg-surface-container-high text-on-surface-variant"
                    )}>
                      {shift}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
