import { useState } from 'react'
import { useHRStore } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { Landmark, Calculator, Settings, Edit2, X, Printer, FileText, Sliders, CheckCircle2, Sparkles, HelpCircle, User, ArrowRight, Copy, Download, ShieldCheck, Scale, Building2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'
import { cn, formatThousandDots, parseThousandDots, calculateTieredOvertimePay } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip } from '@/components/ui/Tooltip'
import { SlideOver } from '@/components/ui/SlideOver'
import { BRANCH_PROFILES } from '@/lib/branches'
import { exportBankPayrollBatch, type BankType } from '@/lib/bankExport'

export function Payroll() {
  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const activeBranch = useHRStore(state => state.activeBranch)
  const terRates = useHRStore(state => state.terRates)
  const updateTerRates = useHRStore(state => state.updateTerRates)
  const updateEmployeePayroll = useHRStore(state => state.updateEmployeePayroll)

  const currentBranch = BRANCH_PROFILES[activeBranch] || BRANCH_PROFILES['Senopati (HQ)']
  
  const displayEmployees = activeRole === 'manager' ? employees : employees.filter(e => e.id === activeEmployeeId)
  const activeEmployee = employees.find(e => e.id === activeEmployeeId)

  const [activeTab, setActiveTab] = useState<'roster' | 'simulator' | 'compliance'>('roster')
  const [showTerModal, setShowTerModal] = useState(false)
  const [showBankExportModal, setShowBankExportModal] = useState(false)
  const [selectedBankType, setSelectedBankType] = useState<BankType>('BCA')
  const [terForm, setTerForm] = useState(terRates)
  const [showWizardModal, setShowWizardModal] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  // Compliance (THR & BPJS) State
  const [complianceEmpId, setComplianceEmpId] = useState<number>(1)
  const [thrTenureMonths, setThrTenureMonths] = useState<number>(8)

  const [editEmpId, setEditEmpId] = useState<number | null>(null)
  const [empForm, setEmpForm] = useState({
    baseSalary: 0,
    ptkp: '',
    kat: '',
    rate: 0
  })

  // Payslip Preview State
  const [payslipPreviewEmp, setPayslipPreviewEmp] = useState<any | null>(null)

  // Interactive Simulator State (Gusto benchmark)
  const [simBase, setSimBase] = useState(activeEmployee ? activeEmployee.baseSalary : 5000000)
  const [simOvertimeHours, setSimOvertimeHours] = useState(activeEmployee ? activeEmployee.overtimeHours : 4)
  const [simNightShifts, setSimNightShifts] = useState(activeEmployee ? activeEmployee.nightShiftsMonth : 2)
  const [simBonus, setSimBonus] = useState(500000)
  const [simKat, setSimKat] = useState(activeEmployee ? activeEmployee.kat : 'B')

  const simTieredOT = calculateTieredOvertimePay(28400, simOvertimeHours)
  const simOvertimePay = simTieredOT.totalPay
  const simNightPay = simNightShifts * 50000
  const simGross = simBase + simOvertimePay + simNightPay + simBonus
  const simTerPercentage = terRates[simKat] || 1.5
  const simTax = simGross * (simTerPercentage / 100)
  const simNet = simGross - simTax

  const openEditModal = (emp: any) => {
    sound.playClick()
    setEmpForm({
      baseSalary: emp.baseSalary,
      ptkp: emp.ptkp,
      kat: emp.kat,
      rate: emp.rate
    })
    setEditEmpId(emp.id)
  }

  const handleSaveTer = () => {
    sound.playSuccess()
    updateTerRates(terForm)
    toast.success("Konfigurasi Pajak TER berhasil diperbarui")
    setShowTerModal(false)
  }

  const handleSaveEmp = () => {
    if (editEmpId) {
      sound.playSuccess()
      updateEmployeePayroll(editEmpId, empForm)
      toast.success("Data Gaji Karyawan berhasil diperbarui")
      setEditEmpId(null)
    }
  }

  const startPayrollWizard = () => {
    sound.playClick()
    setWizardStep(1)
    setShowWizardModal(true)
  }

  const loadMyProfileToSimulator = () => {
    if (!activeEmployee) return
    sound.playClick()
    setSimBase(activeEmployee.baseSalary)
    setSimOvertimeHours(activeEmployee.overtimeHours)
    setSimNightShifts(activeEmployee.nightShiftsMonth)
    setSimKat(activeEmployee.kat)
    toast.success(`Data gaji ${activeEmployee.name} dimuat ke simulator.`)
  }

  const handleExecuteBankExport = (type: BankType) => {
    sound.playSuccess()
    const netMap: Record<number, number> = {}
    employees.forEach(emp => {
      const tieredOT = calculateTieredOvertimePay(emp.rate, emp.overtimeHours)
      const overtimePay = tieredOT.totalPay * 4
      const nightPay = emp.nightShiftsMonth * 50000
      const gross = emp.baseSalary + overtimePay + nightPay
      const terPercentage = terRates[emp.kat] || 0.5
      const tax = gross * (terPercentage / 100)
      netMap[emp.id] = gross - tax
    })

    exportBankPayrollBatch(employees, netMap, type, activeBranch)
    toast.success(`Berkas batch transfer format ${type} berhasil diunduh!`)
    setShowBankExportModal(false)
  }

  return (
    <div className="space-y-6 relative">
      {/* Header Panel */}
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">
              {activeRole === 'manager' ? 'Payroll & Tax TER' : 'Slip Gaji Saya'}
            </h2>
            <Tooltip content="Kepatuhan pemotongan PPh 21 Tarif Efektif Rata-rata berdasarkan Peraturan Menteri Keuangan No. 168/2023.">
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold uppercase tracking-wider border border-semantic-neutral/30 font-mono cursor-help">
                PMK 168/2023
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            {activeRole === 'manager' 
              ? 'Sistem penggajian otomatis terintegrasi kalkulator PPh 21 TER (Tarif Efektif Rata-rata) sesuai regulasi perpajakan terbaru.' 
              : 'Rincian gaji pokok, lembur, insentif shift malam, dan pemotongan PPh 21 TER Anda bulan ini.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeRole === 'manager' && (
            <>
              <Tooltip content="Ekspor rekapitulasi penggajian ke format CSV standar perbankan resmi (BCA Corporate, Mandiri MCM, BRI)">
                <button 
                  onClick={() => {
                    sound.playClick()
                    setShowBankExportModal(true)
                  }}
                  className="bg-surface-container-high text-on-surface text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all hover:bg-surface-container border border-outline cursor-pointer"
                >
                  <Download className="w-4 h-4 text-accent-primary" /> Export CSV Bank
                </button>
              </Tooltip>

              <Tooltip content="Ubah persentase tarif pajak efektif untuk Kategori A, B, dan C">
                <button 
                  onClick={() => { 
                    sound.playClick()
                    setTerForm(terRates)
                    setShowTerModal(true)
                  }}
                  className="bg-surface-container-high text-on-surface text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all hover:bg-surface-container border border-outline cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-accent-primary" /> Konfigurasi TER
                </button>
              </Tooltip>

              <Tooltip content="Jalankan wizard 3 langkah untuk memvalidasi jam kerja, hitung pajak, dan transfer batch">
                <button 
                  onClick={startPayrollWizard}
                  className="bg-gradient-to-r from-accent-primary to-primary text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all hover:shadow-[0_0_18px_rgba(27,95,174,0.4)] cursor-pointer font-display"
                >
                  <Calculator className="w-4 h-4" /> Run Payroll Wizard
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline pb-2">
        <button
          onClick={() => {
            sound.playClick()
            setActiveTab('roster')
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === 'roster' 
              ? "bg-accent-primary text-white shadow-sm" 
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <FileText className="w-4 h-4" /> Slip Gaji Karyawan ({displayEmployees.length})
        </button>
        <button
          onClick={() => {
            sound.playClick()
            setActiveTab('simulator')
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === 'simulator' 
              ? "bg-accent-primary text-white shadow-sm" 
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Sliders className="w-4 h-4" /> Simulator Pajak TER
        </button>
        <button
          onClick={() => {
            sound.playClick()
            setActiveTab('compliance')
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === 'compliance' 
              ? "bg-accent-primary text-white shadow-sm" 
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <ShieldCheck className="w-4 h-4" /> Kalkulator THR & BPJS (Regulasi RI)
        </button>
      </div>

      {/* Tab: Roster Slip Cards */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEmployees.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={FileText}
                title="Data Gaji Belum Tersedia"
                description="Belum ada data slip gaji yang terdaftar untuk akun ini."
              />
            </div>
          )}

          {displayEmployees.map((emp) => {
            const grossSalary = emp.baseSalary + (emp.overtimeHours * emp.rate) + (emp.nightShiftsMonth * 50000)
            const terPercentage = terRates[emp.kat] || 0
            const terRate = terPercentage / 100
            const taxDeduction = grossSalary * terRate
            const netSalary = grossSalary - taxDeduction

            return (
              <TiltCard key={emp.id} className="glass-panel rounded-2xl border border-outline p-5 flex flex-col justify-between h-full relative group">
                {activeRole === 'manager' && (
                  <Tooltip content="Edit struktur gaji pokok, status PTKP, dan upah lembur staf ini" position="left">
                    <button 
                      onClick={() => openEditModal(emp)}
                      className="absolute top-4 right-4 p-2 bg-surface-container-high hover:bg-surface-container text-on-surface-variant rounded-full border border-outline opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-2xl object-cover border border-outline" />
                      <div>
                        <h3 className="font-bold text-sm text-on-surface font-display">{emp.name}</h3>
                        <p className="text-[10px] text-on-surface-variant">{emp.role}</p>
                      </div>
                    </div>
                    <Tooltip content={`Status PTKP: ${emp.ptkp} • Kategori TER: ${emp.kat} (${terPercentage}%)`}>
                      <span className="px-2.5 py-1 bg-surface-container-high text-xs font-mono font-bold rounded-lg border border-outline cursor-help">
                        {emp.ptkp} / KAT {emp.kat}
                      </span>
                    </Tooltip>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-on-surface-variant">Gaji Pokok</span>
                      <span className="text-on-surface font-mono">Rp {emp.baseSalary.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-on-surface-variant">Lembur ({emp.overtimeHours}j @ Rp {emp.rate.toLocaleString('id-ID')})</span>
                      <span className="text-on-surface font-mono">+ Rp {(emp.overtimeHours * emp.rate).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-on-surface-variant">Insentif Shift Malam ({emp.nightShiftsMonth}x)</span>
                      <span className="text-on-surface font-mono">+ Rp {(emp.nightShiftsMonth * 50000).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-outline pt-3 mb-4 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface">Penghasilan Bruto</span>
                      <span className="text-on-surface font-mono">Rp {grossSalary.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-psy-danger">
                      <Tooltip content={`Potongan pajak PPh 21 menggunakan tarif efektif rata-rata Kategori ${emp.kat} (${terPercentage}%)`}>
                        <span className="flex items-center gap-1 cursor-help">
                          <Landmark className="w-3.5 h-3.5"/> PPh 21 TER ({terPercentage}%)
                        </span>
                      </Tooltip>
                      <span className="font-mono">- Rp {Math.round(taxDeduction).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-surface-container-lowest border border-outline rounded-2xl p-3.5 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Take Home Pay</span>
                      <span className="text-lg font-bold text-accent-primary font-mono">Rp {Math.round(netSalary).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <Tooltip content="Buka pratinjau dokumen slip gaji format resmi standar Sokara & cetak PDF" className="w-full">
                    <button 
                      onClick={() => {
                        sound.playClick()
                        setPayslipPreviewEmp({
                          ...emp,
                          grossSalary,
                          terPercentage,
                          taxDeduction,
                          netSalary
                        })
                      }}
                      className="w-full bg-surface-container-high hover:bg-surface-container text-on-surface border border-outline py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-accent-primary" /> Lihat & Cetak Slip Resmi
                    </button>
                  </Tooltip>
                </div>
              </TiltCard>
            )
          })}
        </div>
      )}

      {/* Tab: Interactive Tax TER Simulator (Gusto Benchmark) */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-outline space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-on-surface font-display">Parameter Kompensasi Karyawan</h3>
                <p className="text-xs text-on-surface-variant">Geser slider untuk melihat perhitungan seketika dampak lembur dan insentif terhadap pajak PPh 21 TER.</p>
              </div>
              {activeEmployee && (
                <Tooltip content="Muat nilai gaji pokok, lembur, dan kategori TER profil Anda saat ini ke slider">
                  <button
                    onClick={loadMyProfileToSimulator}
                    className="py-2 px-3 rounded-xl bg-surface-container-high border border-outline hover:bg-surface-container text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <User className="w-3.5 h-3.5 text-accent-primary" /> Pakai Data Saya
                  </button>
                </Tooltip>
              )}
            </div>

            {/* Slider: Gaji Pokok */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Gaji Pokok Bulanan</span>
                <span className="font-mono text-accent-primary text-sm">Rp {simBase.toLocaleString('id-ID')}</span>
              </div>
              <input 
                type="range" 
                min={3500000} 
                max={12000000} 
                step={250000}
                value={simBase}
                onChange={(e) => setSimBase(Number(e.target.value))}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Slider: Jam Lembur */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Jam Lembur ({simOvertimeHours} Jam @ Rp 28.400)</span>
                <span className="font-mono text-on-surface">+ Rp {simOvertimePay.toLocaleString('id-ID')}</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={30} 
                step={1}
                value={simOvertimeHours}
                onChange={(e) => setSimOvertimeHours(Number(e.target.value))}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Slider: Shift Malam */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Insentif Shift Malam ({simNightShifts} Shift @ Rp 50.000)</span>
                <span className="font-mono text-on-surface">+ Rp {simNightPay.toLocaleString('id-ID')}</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={15} 
                step={1}
                value={simNightShifts}
                onChange={(e) => setSimNightShifts(Number(e.target.value))}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Slider: Bonus Performa */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Bonus Performa / Tip Sharing</span>
                <span className="font-mono text-on-surface">+ Rp {simBonus.toLocaleString('id-ID')}</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={3000000} 
                step={100000}
                value={simBonus}
                onChange={(e) => setSimBonus(Number(e.target.value))}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Kategori TER Selector */}
            <div className="space-y-2 pt-2 border-t border-outline">
              <label className="text-xs font-bold text-on-surface-variant block">Kategori Tarif Efektif Rata-rata (TER PMK 168/2023)</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: 'A', desc: 'TK/0, TK/1, K/0' },
                  { k: 'B', desc: 'TK/2, TK/3, K/1, K/2' },
                  { k: 'C', desc: 'K/3' }
                ].map(({ k, desc }) => (
                  <Tooltip key={k} content={`Kategori ${k}: Golongan PTKP ${desc} dengan tarif TER ${terRates[k]}%`}>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick()
                        setSimKat(k)
                      }}
                      className={cn(
                        "p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all w-full",
                        simKat === k 
                          ? "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-sm" 
                          : "bg-surface-container-low text-on-surface border-outline"
                      )}
                    >
                      <span>Kategori {k}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">Tarif: {terRates[k]}%</span>
                      <span className="text-[9px] text-on-surface-variant/80 font-normal">{desc}</span>
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Simulator Summary Output & TER Explainer */}
          <div className="space-y-6">
            <TiltCard className="glass-panel p-6 rounded-3xl border border-outline flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-wider mb-4">
                  <Sparkles className="w-4 h-4" /> Hasil Simulasi Gaji Bersih
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Penghasilan Bruto:</span>
                    <span className="font-bold font-mono text-on-surface">Rp {simGross.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-psy-danger">
                    <span className="font-medium">Potongan PPh 21 TER ({simTerPercentage}%):</span>
                    <span className="font-bold font-mono">- Rp {Math.round(simTax).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="pt-3 border-t border-outline">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                      Estimasi Take Home Pay
                    </span>
                    <p className="text-3xl font-bold text-accent-primary font-mono">
                      Rp {Math.round(simNet).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline text-[11px] text-on-surface-variant">
                <p className="font-medium">Dihitung otomatis berbasis regulasi PMK 168/2023 tanpa perhitungan manual yang rumit.</p>
              </div>
            </TiltCard>

            {/* TER Educational Context Card */}
            <div className="p-5 rounded-3xl bg-surface-container-low border border-outline space-y-3 text-xs">
              <div className="flex items-center gap-2 text-on-surface font-bold">
                <HelpCircle className="w-4 h-4 text-accent-primary" />
                <span>Panduan Kategori TER PMK 168/2023</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-on-surface-variant leading-relaxed">
                <li><strong className="text-on-surface">Kategori A:</strong> Tidak Kawin tanpa tanggungan (TK/0), 1 tanggungan (TK/1), atau Kawin tanpa tanggungan (K/0).</li>
                <li><strong className="text-on-surface">Kategori B:</strong> TK/2, TK/3, K/1, atau K/2.</li>
                <li><strong className="text-on-surface">Kategori C:</strong> Kawin dengan 3 tanggungan (K/3).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Indonesian Regulatory Compliance (THR & BPJS) */}
      {activeTab === 'compliance' && (() => {
        const complianceEmp = employees.find(e => e.id === complianceEmpId) || employees[0]
        const baseSal = complianceEmp ? complianceEmp.baseSalary : 5000000
        const thrMultiplier = thrTenureMonths >= 12 ? 1 : (thrTenureMonths / 12)
        const thrEstimatedAmount = Math.round(baseSal * thrMultiplier)

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-outline space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline">
                <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface font-display">Parameter Kepatuhan Staf</h3>
                  <p className="text-xs text-on-surface-variant">Pilih profil karyawan & masa kerja aktif</p>
                </div>
              </div>

              {/* Select Employee */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Pilih Karyawan:</label>
                <select
                  value={complianceEmpId}
                  onChange={(e) => {
                    sound.playClick()
                    setComplianceEmpId(Number(e.target.value))
                  }}
                  className="p-3 rounded-xl bg-surface-container border border-outline text-on-surface font-bold text-xs outline-none focus:border-accent-primary"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.role} (Gaji: Rp {emp.baseSalary.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Masa Kerja Slider */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-surface-container-low border border-outline">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-on-surface">Masa Kerja Aktif:</span>
                  <span className="font-bold font-mono text-accent-primary bg-accent-primary/10 px-2.5 py-1 rounded-lg">
                    {thrTenureMonths} Bulan {thrTenureMonths >= 12 ? '(Hak Penuh)' : '(Prorata)'}
                  </span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="24"
                  value={thrTenureMonths}
                  onChange={(e) => setThrTenureMonths(Number(e.target.value))}
                  className="w-full accent-accent-primary cursor-pointer my-1"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>1 Bln (Min Hak)</span>
                  <span>12 Bln (1x Gaji Penuh)</span>
                  <span>24 Bln</span>
                </div>
              </div>

              {/* Regulasi Card Info */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-on-surface">
                  <Scale className="w-4 h-4 text-accent-primary" />
                  <span>Dasar Hukum Regulasi Ketenagakerjaan:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-on-surface-variant list-disc pl-4 leading-relaxed">
                  <li><strong>Permenaker No. 6/2016:</strong> THR Keagamaan wajib dibayarkan minimal H-7 Hari Raya. Staf dengan masa kerja minimal 1 bulan berhak mendapatkan pembayaran THR secara prorata.</li>
                  <li><strong>PP No. 37/2021 & PP No. 84/2013:</strong> Penyelenggaraan jaminan sosial BPJS Kesehatan dan BPJS Ketenagakerjaan (JKK, JKM, JHT, JP).</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Results Breakdown */}
            <div className="lg:col-span-7 space-y-5">
              {/* THR Result Card */}
              <div className="glass-panel p-6 rounded-3xl border border-outline space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-psy-safe-bg text-psy-safe-text text-xs font-bold font-mono">
                      THR Keagamaan (Permenaker 6/2016)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant font-mono">
                    {thrTenureMonths >= 12 ? '1 × Gaji Pokok' : `(${thrTenureMonths}/12) × Gaji Pokok`}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Estimasi Pembayaran THR Bersih:</p>
                    <p className="text-2xl font-bold font-mono text-psy-safe-text mt-0.5">
                      Rp {thrEstimatedAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playSuccess()
                      navigator.clipboard.writeText(`Rincian THR ${complianceEmp?.name} (Masa Kerja ${thrTenureMonths} Bln): Rp ${thrEstimatedAmount.toLocaleString('id-ID')}`)
                      toast.success("Rincian estimasi THR berhasil disalin!")
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold text-xs border border-outline flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Salin Nominal THR
                  </button>
                </div>
              </div>

              {/* BPJS Breakdown Card */}
              <div className="glass-panel p-6 rounded-3xl border border-outline space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent-primary" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface">Simulasi Iuran BPJS Lengkap</h4>
                  </div>
                  <span className="text-[11px] font-mono text-on-surface-variant font-bold">
                    Dasar Upah: Rp {baseSal.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline text-on-surface-variant text-[11px]">
                        <th className="py-2">Program Jaminan</th>
                        <th className="py-2 text-right">Ditanggung Perusahaan</th>
                        <th className="py-2 text-right">Dipotong dari Karyawan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/50 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 font-sans font-medium text-on-surface">BPJS Kesehatan (5.0%)</td>
                        <td className="py-2.5 text-right font-bold text-on-surface">4.0% (Rp {Math.round(baseSal * 0.04).toLocaleString('id-ID')})</td>
                        <td className="py-2.5 text-right font-bold text-psy-danger">1.0% (Rp {Math.round(baseSal * 0.01).toLocaleString('id-ID')})</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-sans font-medium text-on-surface">JHT (Jaminan Hari Tua - 5.7%)</td>
                        <td className="py-2.5 text-right font-bold text-on-surface">3.7% (Rp {Math.round(baseSal * 0.037).toLocaleString('id-ID')})</td>
                        <td className="py-2.5 text-right font-bold text-psy-danger">2.0% (Rp {Math.round(baseSal * 0.02).toLocaleString('id-ID')})</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-sans font-medium text-on-surface">JKK (Jaminan Kecelakaan Kerja)</td>
                        <td className="py-2.5 text-right font-bold text-on-surface">0.24% (Rp {Math.round(baseSal * 0.0024).toLocaleString('id-ID')})</td>
                        <td className="py-2.5 text-right text-on-surface-variant">0.0% (Rp 0)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-sans font-medium text-on-surface">JKM (Jaminan Kematian)</td>
                        <td className="py-2.5 text-right font-bold text-on-surface">0.30% (Rp {Math.round(baseSal * 0.003).toLocaleString('id-ID')})</td>
                        <td className="py-2.5 text-right text-on-surface-variant">0.0% (Rp 0)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-sans font-medium text-on-surface">JP (Jaminan Pensiun - 3.0%)</td>
                        <td className="py-2.5 text-right font-bold text-on-surface">2.0% (Rp {Math.round(baseSal * 0.02).toLocaleString('id-ID')})</td>
                        <td className="py-2.5 text-right font-bold text-psy-danger">1.0% (Rp {Math.round(baseSal * 0.01).toLocaleString('id-ID')})</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-outline font-bold text-xs bg-surface-container-low/50">
                        <td className="py-3 font-sans uppercase">Total Iuran Bulanan:</td>
                        <td className="py-3 text-right font-mono text-accent-primary">
                          Rp {Math.round(baseSal * 0.1024).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 text-right font-mono text-psy-danger">
                          - Rp {Math.round(baseSal * 0.04).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Payroll Wizard Modal (Gusto Standard) */}
      {showWizardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowWizardModal(false)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-accent-primary" />
                <h3 className="font-bold font-display text-lg text-on-surface">Payroll Run Wizard</h3>
              </div>
              <button onClick={() => setShowWizardModal(false)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Stepper Wizard Bar */}
            <div className="flex items-center justify-between mb-6 text-xs font-bold">
              <span className={cn("flex items-center gap-1", wizardStep >= 1 ? "text-accent-primary" : "text-on-surface-variant")}>
                1. Review Jam Kerja
              </span>
              <span className={cn("flex items-center gap-1", wizardStep >= 2 ? "text-accent-primary" : "text-on-surface-variant")}>
                2. TER PPh 21
              </span>
              <span className={cn("flex items-center gap-1", wizardStep >= 3 ? "text-accent-primary" : "text-on-surface-variant")}>
                3. Distribusi Batch
              </span>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <p className="text-on-surface-variant">Memvalidasi total {employees.length} catatan jam kerja, lembur, dan shift malam seluruh kru Kedai Senopati.</p>
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Karyawan:</span>
                    <span>{employees.length} Orang</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Jam Lembur:</span>
                    <span>{employees.reduce((acc, e) => acc + e.overtimeHours, 0)} Jam</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    sound.playClick()
                    setWizardStep(2)
                  }}
                  className="w-full py-3 rounded-xl bg-accent-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display"
                >
                  Lanjut ke Kalkulasi Pajak TER <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <p className="text-on-surface-variant">Kalkulasi potongan PPh 21 TER sesuai PTKP masing-masing karyawan:</p>
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline space-y-2">
                  <div className="flex justify-between">
                    <span>Tarif TER Terkoreksi:</span>
                    <span className="font-bold text-psy-safe-text">PMK 168/2023 Valid</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Rekonsiliasi:</span>
                    <span className="font-bold text-accent-primary">100% Cocok</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    sound.playSuccess()
                    setWizardStep(3)
                    toast.success("Slip gaji elektronik berhasil dibuat untuk semua karyawan.")
                    import('@/lib/confetti').then(({ fireConfetti }) => fireConfetti())
                  }}
                  className="w-full py-3 rounded-xl bg-accent-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display"
                >
                  Proses Transfer Penggajian Batch <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 text-xs text-center py-4">
                <div className="w-14 h-14 rounded-full bg-psy-safe-bg text-psy-safe mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-on-surface font-display">Payroll Berhasil Dijalankan!</h4>
                <p className="text-on-surface-variant">Semua {employees.length} slip gaji telah dikirimkan ke portal masing-masing staf dan log audit tersimpan.</p>
                <button 
                  onClick={() => {
                    sound.playClick()
                    setShowWizardModal(false)
                  }}
                  className="w-full py-3 rounded-xl bg-surface-container-high border border-outline text-on-surface font-bold text-xs hover:bg-surface-container transition-all cursor-pointer"
                >
                  Tutup Wizard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Format Resmi Cetak Slip Gaji */}
      {payslipPreviewEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setPayslipPreviewEmp(null)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-outline pb-4 mb-5">
              <div>
                <img src="/sokara-horizontal-dark-bg.svg" alt="Sokara HRMS" className="h-8 w-auto mb-1" />
                <p className="text-xs text-on-surface-variant font-medium">Slip Gaji Elektronik Resmi • Periode Agustus 2026</p>
              </div>
              <button onClick={() => setPayslipPreviewEmp(null)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-container-lowest rounded-2xl border border-outline">
                <div>
                  <p className="text-on-surface-variant font-medium">Nama Karyawan:</p>
                  <p className="font-bold text-on-surface text-sm">{payslipPreviewEmp.name}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-medium">Posisi / Departemen:</p>
                  <p className="font-bold text-on-surface text-sm">{payslipPreviewEmp.role} ({payslipPreviewEmp.dept})</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-medium">Status Pajak PTKP:</p>
                  <p className="font-bold font-mono text-on-surface">{payslipPreviewEmp.ptkp} / TER Kategori {payslipPreviewEmp.kat}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-medium">Cabang:</p>
                  <p className="font-bold text-on-surface">{currentBranch.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-accent-primary">Komponen Penghasilan</h4>
                <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                  <span>Gaji Pokok</span>
                  <span className="font-mono font-bold">Rp {payslipPreviewEmp.baseSalary.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                  <span>Upah Lembur ({payslipPreviewEmp.overtimeHours} Jam)</span>
                  <span className="font-mono font-bold">Rp {(payslipPreviewEmp.overtimeHours * payslipPreviewEmp.rate).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                  <span>Insentif Shift Malam ({payslipPreviewEmp.nightShiftsMonth} Shift)</span>
                  <span className="font-mono font-bold">Rp {(payslipPreviewEmp.nightShiftsMonth * 50000).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-psy-danger">Potongan Wajib</h4>
                <div className="flex justify-between p-2 rounded-lg bg-psy-danger-bg/50 border border-psy-danger/20 text-psy-danger">
                  <span>PPh 21 TER ({payslipPreviewEmp.terPercentage}%)</span>
                  <span className="font-mono font-bold">- Rp {Math.round(payslipPreviewEmp.taxDeduction).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="p-4 bg-accent-primary/10 border border-accent-primary/30 rounded-2xl flex justify-between items-center">
                <span className="font-bold text-sm text-accent-primary uppercase tracking-wider">Total Gaji Bersih (Net)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-accent-primary">
                    Rp {Math.round(payslipPreviewEmp.netSalary).toLocaleString('id-ID')}
                  </span>
                  <Tooltip content="Salin nominal gaji bersih ke clipboard">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSuccess()
                        navigator.clipboard.writeText(String(Math.round(payslipPreviewEmp.netSalary)))
                        toast.success("Nominal gaji bersih berhasil disalin!")
                      }}
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline text-accent-primary cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => {
                  sound.playClick()
                  window.print()
                }}
                className="flex-1 py-3 rounded-xl bg-accent-primary text-white text-xs font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display"
              >
                <Printer className="w-4 h-4" /> Cetak Slip (PDF / Print)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfigurasi TER */}
      <SlideOver
        isOpen={showTerModal}
        onClose={() => setShowTerModal(false)}
        title="Konfigurasi Tarif Pajak TER (PPh 21)"
        width="max-w-md"
      >
        <div className="space-y-6">
          <p className="text-xs text-on-surface-variant">Konfigurasi persentase pemotongan pajak berdasarkan Kategori PTKP sesuai PMK 168/2023.</p>
          <div className="space-y-4">
            {['A', 'B', 'C'].map(kat => (
              <div key={kat} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Kategori {kat} (Tarif %)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={terForm[kat] || 0}
                  onChange={(e) => setTerForm({ ...terForm, [kat]: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-xl bg-surface-container-lowest border border-outline text-on-surface font-mono font-bold text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-6 mt-4 border-t border-outline">
            <button 
              onClick={handleSaveTer} 
              className="w-full py-3.5 rounded-xl bg-accent-primary text-white text-xs font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display shadow-md"
            >
              <Settings className="w-4 h-4" /> Simpan Tarif TER
            </button>
            <button 
              onClick={() => setShowTerModal(false)} 
              className="w-full py-3.5 rounded-xl border border-outline hover:bg-surface-container text-xs font-bold cursor-pointer transition-colors"
            >
              Batal & Tutup
            </button>
          </div>
        </div>
      </SlideOver>

      {/* SlideOver Edit Gaji Karyawan */}
      <SlideOver
        isOpen={!!editEmpId}
        onClose={() => setEditEmpId(null)}
        title="Edit Struktur Gaji"
        width="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Gaji Pokok (Rp)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-mono font-bold text-on-surface-variant pointer-events-none">Rp</span>
              <input 
                type="text" 
                inputMode="numeric"
                value={formatThousandDots(empForm.baseSalary)}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setEmpForm({ ...empForm, baseSalary: parseThousandDots(e.target.value) })}
                placeholder="Contoh: 5.000.000"
                className="w-full pl-9 p-3 rounded-xl bg-surface-container-lowest border border-outline text-on-surface font-mono font-bold text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Status PTKP</label>
              <input 
                type="text" 
                value={empForm.ptkp}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setEmpForm({ ...empForm, ptkp: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-lowest border border-outline text-on-surface font-mono font-bold text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Kategori TER (A/B/C)</label>
              <select 
                value={empForm.kat}
                onChange={(e) => setEmpForm({ ...empForm, kat: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-lowest border border-outline text-on-surface font-mono font-bold text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Upah Lembur / Jam (Rp)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-mono font-bold text-on-surface-variant pointer-events-none">Rp</span>
              <input 
                type="text" 
                inputMode="numeric"
                value={formatThousandDots(empForm.rate)}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setEmpForm({ ...empForm, rate: parseThousandDots(e.target.value) })}
                placeholder="Contoh: 28.400"
                className="w-full pl-9 p-3 rounded-xl bg-surface-container-lowest border border-outline text-on-surface font-mono font-bold text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary shadow-sm"
              />
            </div>
          </div>

          {/* Live Preview Simulator Gaji Bersih */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline space-y-2 text-xs shadow-sm">
            <div className="flex justify-between items-center text-on-surface-variant font-medium">
              <span>Gaji Pokok:</span>
              <span className="font-bold font-mono text-on-surface">Rp {empForm.baseSalary.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-psy-danger font-medium">
              <span>Estimasi PPh 21 TER ({terRates[empForm.kat] || 0.5}%):</span>
              <span className="font-bold font-mono">- Rp {Math.round(empForm.baseSalary * ((terRates[empForm.kat] || 0.5) / 100)).toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-outline flex justify-between items-center">
              <span className="font-bold text-accent-primary uppercase tracking-wider text-[11px]">Take Home Pay (Net):</span>
              <span className="text-base font-bold font-mono text-accent-primary">
                Rp {Math.round(empForm.baseSalary - (empForm.baseSalary * ((terRates[empForm.kat] || 0.5) / 100))).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-6 mt-4 border-t border-outline">
            <button 
              onClick={handleSaveEmp} 
              className="w-full py-3.5 rounded-xl bg-accent-primary text-white text-xs font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display shadow-md"
            >
              <Settings className="w-4 h-4" /> Simpan Perubahan
            </button>
            <button 
              onClick={() => setEditEmpId(null)} 
              className="w-full py-3.5 rounded-xl border border-outline hover:bg-surface-container text-xs font-bold cursor-pointer transition-colors"
            >
              Batal & Tutup
            </button>
          </div>
        </div>
      </SlideOver>

      {/* Bank Direct Transfer Batch Exporter Slide-Over */}
      <SlideOver 
        isOpen={showBankExportModal} 
        onClose={() => setShowBankExportModal(false)}
        title="Export Batch Transfer Bank"
        width="max-w-md"
      >
        <div className="space-y-6">
          <p className="text-xs text-on-surface-variant font-medium">Pilih format spesifik perbankan untuk transfer gaji massal.</p>
          <div className="space-y-3">
            {[
              { type: 'BCA' as BankType, title: 'BCA Corporate Payroll', desc: 'Format standar BCA KlikBisnis / Corporate Payroll CSV (No, Rekening, Nama, Nominal, Berita, Kode Cabang).' },
              { type: 'MANDIRI' as BankType, title: 'Mandiri Cash Management (MCM)', desc: 'Format batch upload Mandiri MCM CSV (Beneficiary Acc, Amount, Remark).' },
              { type: 'BRI' as BankType, title: 'BRI Mass Disbursement', desc: 'Format batch payroll BRI Cash Management CSV.' },
              { type: 'GENERIC_CSV' as BankType, title: 'Rekapitulasi Lengkap Sokara (Ledger CSV)', desc: 'Format rekap HR komprehensif termasuk PTKP, TER, dan jam lembur.' }
            ].map(bank => {
              const isSelected = selectedBankType === bank.type
              return (
                <div
                  key={bank.type}
                  onClick={() => {
                    sound.playClick()
                    setSelectedBankType(bank.type)
                  }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 shadow-sm",
                    isSelected 
                      ? "bg-accent-primary/5 border-accent-primary ring-1 ring-accent-primary" 
                      : "bg-surface border-outline hover:border-accent-primary/40"
                  )}
                >
                  <div>
                    <p className="font-bold text-xs text-on-surface">{bank.title}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{bank.desc}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />}
                </div>
              )
            })}
          </div>

          <div className="p-4 rounded-2xl bg-surface-container border border-outline text-xs text-on-surface-variant space-y-2">
            <div className="flex items-center justify-between">
                <span>Total Penerima Karyawan:</span>
                <span className="font-bold">{employees.length} Orang</span>
            </div>
            <div className="flex items-center justify-between text-on-surface">
                <span className="font-bold">Estimasi Total Transfer:</span>
                <span className="font-bold font-mono text-accent-primary text-sm">
                Rp {employees.reduce((acc, emp) => {
                    const ot = calculateTieredOvertimePay(emp.rate, emp.overtimeHours).totalPay * 4
                    const gross = emp.baseSalary + ot + (emp.nightShiftsMonth * 50000)
                    const tax = gross * ((terRates[emp.kat] || 0.5) / 100)
                    return acc + (gross - tax)
                }, 0).toLocaleString('id-ID')}
                </span>
            </div>
          </div>

          <button 
            onClick={() => handleExecuteBankExport(selectedBankType)}
            className="w-full py-3.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:shadow-lg transition-all cursor-pointer font-display flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(9,132,227,0.39)]"
          >
            <Download className="w-4 h-4" />
            Unduh Berkas Batch {selectedBankType}
          </button>
        </div>
      </SlideOver>
    </div>
  )
}
