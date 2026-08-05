import { useState } from 'react'
import { useHRStore } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { Download, Landmark, Calculator, Settings, Edit2, X, Save } from 'lucide-react'
import { toast } from 'sonner'


export function Payroll() {
  const { employees, activeRole, activeEmployeeId, terRates, updateTerRates, updateEmployeePayroll } = useHRStore()
  
  const displayEmployees = activeRole === 'manager' ? employees : employees.filter(e => e.id === activeEmployeeId)
  
  const [showTerModal, setShowTerModal] = useState(false)
  const [terForm, setTerForm] = useState(terRates)

  const [editEmpId, setEditEmpId] = useState<number | null>(null)
  const [empForm, setEmpForm] = useState({
    baseSalary: 0,
    ptkp: '',
    kat: '',
    rate: 0
  })

  const openEditModal = (emp: any) => {
    setEmpForm({
      baseSalary: emp.baseSalary,
      ptkp: emp.ptkp,
      kat: emp.kat,
      rate: emp.rate
    })
    setEditEmpId(emp.id)
  }

  const handleSaveTer = () => {
    updateTerRates(terForm)
    toast.success("Konfigurasi Pajak TER berhasil diperbarui")
    setShowTerModal(false)
  }

  const handleSaveEmp = () => {
    if (editEmpId) {
      updateEmployeePayroll(editEmpId, empForm)
      toast.success("Data Gaji Karyawan berhasil diperbarui")
      setEditEmpId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">
              {activeRole === 'manager' ? 'Payroll & Tax TER' : 'My Payslip'}
            </h2>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold uppercase tracking-wider border border-semantic-neutral/30">PMK 168/2023</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            {activeRole === 'manager' ? 'Sistem penggajian otomatis terintegrasi dengan simulasi kalkulator PPh 21 TER (Tarif Efektif Rata-rata).' : 'Rincian gaji, lembur, tunjangan, dan pemotongan pajak Anda bulan ini.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeRole === 'manager' && (
            <>
              <button 
                onClick={() => { setTerForm(terRates); setShowTerModal(true); }}
                className="bg-surface-container-high text-on-surface text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 transition-all hover:bg-surface-container border border-outline"
              >
                <Settings className="w-4 h-4" /> Konfigurasi TER
              </button>
              <button className="bg-gradient-to-r from-accent-primary to-primary text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 transition-all hover:shadow-[0_0_18px_rgba(27,95,174,0.4)]">
                <Calculator className="w-4 h-4" /> Generate Semua Slip
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEmployees.map((emp) => {
          const grossSalary = emp.baseSalary + (emp.overtimeHours * emp.rate) + (emp.nightShiftsMonth * 50000)
          
          // REAL-TIME TER CALCULATION FROM ZUSTAND STORE
          const terPercentage = terRates[emp.kat] || 0
          const terRate = terPercentage / 100
          
          const taxDeduction = grossSalary * terRate
          const netSalary = grossSalary - taxDeduction

          return (
            <TiltCard key={emp.id} className="glass-panel rounded-2xl border border-outline p-5 flex flex-col justify-between h-full relative group">
              {activeRole === 'manager' && (
                <button 
                  onClick={() => openEditModal(emp)}
                  className="absolute top-4 right-4 p-2 bg-surface-container-high hover:bg-surface-container text-on-surface-variant rounded-full border border-outline opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">{emp.name}</h3>
                      <p className="text-[10px] text-on-surface-variant">{emp.role}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-surface-container-high text-xs font-mono font-bold rounded-lg border border-outline mt-1 md:mt-0">
                    {emp.ptkp} / KAT {emp.kat}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-on-surface-variant">Gaji Pokok</span>
                    <span className="text-on-surface font-mono">Rp {emp.baseSalary.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-on-surface-variant">Lembur ({emp.overtimeHours}j)</span>
                    <span className="text-on-surface font-mono">+ Rp {(emp.overtimeHours * emp.rate).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-on-surface-variant">Tunj. Shift Malam</span>
                    <span className="text-on-surface font-mono">+ Rp {(emp.nightShiftsMonth * 50000).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-outline pt-3 mb-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-on-surface">Penghasilan Bruto</span>
                    <span className="text-on-surface font-mono">Rp {grossSalary.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-psy-danger">
                    <span className="flex items-center gap-1"><Landmark className="w-3 h-3"/> PPh 21 TER ({terPercentage}%)</span>
                    <span className="font-mono">- Rp {Math.round(taxDeduction).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-surface-container-lowest border border-outline rounded-xl p-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Take Home Pay</span>
                    <span className="text-lg font-bold text-accent-primary font-mono">Rp {Math.round(netSalary).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <button className="w-full bg-surface-container-high hover:bg-surface-container text-on-surface border border-outline py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold">
                  <Download className="w-4 h-4 text-on-surface-variant" /> Export Payslip PDF
                </button>
              </div>
            </TiltCard>
          )
        })}
      </div>

      {/* MODAL KONFIGURASI TER */}
      {showTerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTerModal(false)}></div>
          <div className="relative bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold font-display text-lg">Konfigurasi Pajak TER</h3>
              <button onClick={() => setShowTerModal(false)} className="p-2 hover:bg-surface-container-high rounded-full"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="space-y-4">
              {['A', 'B', 'C'].map(kat => (
                <div key={kat} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Kategori {kat} (%)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={terForm[kat] || 0}
                    onChange={(e) => setTerForm({...terForm, [kat]: parseFloat(e.target.value) || 0})}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-accent-primary"
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleSaveTer}
              className="mt-6 w-full py-3 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" /> Simpan Konfigurasi
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDIT KARYAWAN */}
      {editEmpId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditEmpId(null)}></div>
          <div className="relative bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold font-display text-lg">Edit Data Payroll</h3>
              <button onClick={() => setEditEmpId(null)} className="p-2 hover:bg-surface-container-high rounded-full"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Gaji Pokok (Rp)</label>
                <input 
                  type="number" 
                  value={empForm.baseSalary}
                  onChange={(e) => setEmpForm({...empForm, baseSalary: parseInt(e.target.value) || 0})}
                  className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Rate Lembur / Jam (Rp)</label>
                <input 
                  type="number" 
                  value={empForm.rate}
                  onChange={(e) => setEmpForm({...empForm, rate: parseInt(e.target.value) || 0})}
                  className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Status PTKP</label>
                  <select 
                    value={empForm.ptkp}
                    onChange={(e) => setEmpForm({...empForm, ptkp: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-accent-primary"
                  >
                    <option value="TK/0">TK/0</option>
                    <option value="TK/1">TK/1</option>
                    <option value="K/0">K/0</option>
                    <option value="K/1">K/1</option>
                    <option value="K/2">K/2</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Kategori Pajak</label>
                  <select 
                    value={empForm.kat}
                    onChange={(e) => setEmpForm({...empForm, kat: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-accent-primary"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveEmp}
              className="mt-6 w-full py-3 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" /> Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
