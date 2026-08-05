import { useEffect, useState } from 'react'
import { Search, Command, ArrowRight, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useHRStore } from '@/store/useHRStore'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { employees } = useHRStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  if (!isOpen) return null

  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
  
  const handleSelect = (path: string) => {
    navigate(path)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
      <div 
        className="bg-surface dark:bg-surface-container w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-outline animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-outline gap-3">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input 
            autoFocus
            type="text" 
            placeholder="Cari karyawan atau menu..." 
            className="flex-1 bg-transparent border-none outline-none text-on-surface text-base placeholder:text-on-surface-variant"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-mono bg-surface-container-low px-2 py-1 rounded-md border border-surface-container-highest">
            <Command className="w-3 h-3" /> ESC
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query === '' ? (
            <div className="p-4 text-center text-sm text-on-surface-variant font-medium">
              Ketik nama karyawan atau nama menu...
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-accent-primary uppercase tracking-wider">Navigasi</div>
              {['Dashboard', 'Calendar', 'Attendance', 'Approval', 'Payroll'].filter(m => m.toLowerCase().includes(query.toLowerCase())).map(menu => (
                <button
                  key={menu}
                  onClick={() => handleSelect(menu === 'Dashboard' ? '/' : `/${menu.toLowerCase()}`)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container-high text-on-surface transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-on-surface-variant" />
                    <span className="font-semibold">{menu}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-on-surface-variant opacity-50" />
                </button>
              ))}

              {filteredEmployees.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-bold text-accent-primary uppercase tracking-wider mt-2">Karyawan</div>
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleSelect('/employees')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container-high text-on-surface transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold">{emp.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{emp.role}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-on-surface-variant opacity-50" />
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
