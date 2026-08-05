import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'manager' | 'karyawan'

export interface Employee {
  id: number
  name: string
  role: string
  dept: string
  rating: number
  punctuality: number
  skills: string[]
  ptkp: string
  kat: string
  baseSalary: number
  rate: number
  nightShiftsMonth: number
  overtimeHours: number
  avatar: string
  attritionRisk?: number
  attritionFactors?: string[]
}

export interface SwapRequest {
  id: number
  requester: string
  targetSlot: string
  dayIdx: number
  reason: string
  status: string
  stepperStep: number
  isConflict: boolean
}

export interface AuditLog {
  timestamp: string
  user: string
  action: string
  detail: string
}

export interface OkrGoal {
  id: number
  employeeId: number
  title: string
  target: number
  current: number
  unit: string
  dueDate: string
}

export interface Kudos {
  id: number
  from: number
  to: number
  text: string
  type: string
  date: string
}

interface HRState {
  activeTab: string
  activeRole: Role
  activeEmployeeId: number
  activeBranch: string
  filterMyShiftsOnly: boolean
  theme: 'light' | 'dark'
  soundEnabled: boolean
  isSidebarCollapsed: boolean
  
  terRates: Record<string, number>
  employees: Employee[]
  shifts: Record<number, string[]>
  swapRequests: SwapRequest[]
  auditLogs: AuditLog[]
  okrGoals: OkrGoal[]
  kudosList: Kudos[]

  // Actions
  setActiveTab: (tab: string) => void
  setActiveRole: (role: Role) => void
  setActiveEmployeeId: (id: number) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  toggleSound: () => void
  addAuditLog: (log: Omit<AuditLog, 'timestamp'>) => void
  resetStore: () => void
  addKudos: (kudos: Omit<Kudos, 'id' | 'date'>) => void
  updateSwapRequestStatus: (id: number, status: string) => void
  autoFillShifts: () => void
  autoBalanceShifts: () => void
  sabotageSchedule: () => void
  injectSwapRequest: () => void
  updateTerRates: (rates: Record<string, number>) => void
  updateEmployeePayroll: (id: number, data: Partial<Employee>) => void
}

const defaultEmployees: Employee[] = [
  { id: 1, name: 'Dimas Prasetyo', role: 'Head Barista', dept: 'Bar', rating: 4.9, punctuality: 98, skills: ['Senior Barista', 'Opening Lead'], ptkp: 'K/1', kat: 'B', baseSalary: 5500000, rate: 31250, nightShiftsMonth: 2, overtimeHours: 4, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwyBcUZScQ83Nq3o598I2kDq6PT3SKgnuQl_OXPt1KACSyg0g3z-4O6ErmJN2e4NjvQbkFCb7DSyL9l2UgNrmfVOWRj89xG5zTNaAuSqr6baaaFfV4u-e7GZ3JUJGXyHvxPSRr8Sekif9r_eNQDc2cZNj7nsu-9NokJUFkgidtKx8127yWVQrjhrm6Vblj8AH5AJ16Q4YVjxG7taGIXOtaR6D6RwDsGYRwsRoAIji3-CetINlkXk', attritionRisk: 15, attritionFactors: ['Performa stabil'] },
  { id: 2, name: 'Siti Rahma', role: 'Kasir Senior', dept: 'Front', rating: 4.8, punctuality: 96, skills: ['Kasir Senior', 'POS Master'], ptkp: 'TK/1', kat: 'A', baseSalary: 4800000, rate: 27270, nightShiftsMonth: 4, overtimeHours: 2, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBwt58-mWc71tS5riU9IdSU_g0_HzlOe6jrEvdgya-gjiX5jn9StUqY9REwAPuCQDQOtCF17JHpreyraLpc47I6NdrJ83B3-Mu4yd0RjV2IeOXVyMzYH8XR_YCoMV6tuq3VsqhC4q9RXn4uzFwYrsMWYFcN40-YaolEXny-sYUG7P5Z7mCKqogoFRGQmbW9h0gnWz5L7b7ZyXNh9BRrj399IhAuyracHv2BhOt1L3lTu2ZHgUEeew', attritionRisk: 20, attritionFactors: ['Beban shift malam cukup tinggi'] },
  { id: 3, name: 'Budi Santoso', role: 'Senior Barista', dept: 'Bar', rating: 4.7, punctuality: 99, skills: ['Senior Barista', 'Latte Art'], ptkp: 'TK/0', kat: 'A', baseSalary: 5000000, rate: 28400, nightShiftsMonth: 1, overtimeHours: 1, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp9qz8IPJe1fvn4KeLgS2G3Fuqah6CRd78t10rkIltGN3tNI-bDtB46Cx113yC8pl_9VEAte71XlRzTkqH99b35uHJ_5N0FVYLCg19VvReWVhVS42KoHD7a9rkWNteignZw_iHROaQJpMZmUDUFHRxitoRe74LfBvA4PAYx_n7xOWI3pp28R3dhOspmSli3OE7Ce36bmlIyYeH7KdPa-KvgS0YbLK4K8hFdk3SUqs9gS6tJxuKUUk', attritionRisk: 5, attritionFactors: ['Engagement tinggi', 'Work-life balance baik'] },
  { id: 4, name: 'Rian Kurniawan', role: 'Barista Junior', dept: 'Bar', rating: 4.5, punctuality: 94, skills: ['Barista'], ptkp: 'TK/0', kat: 'A', baseSalary: 4200000, rate: 23860, nightShiftsMonth: 6, overtimeHours: 8, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjvsUTtQdFtrKmreQNid6IEsVHUPgwy-_b266BKvXxebvRPdXsyj0R92v8HLiz_IG3FG4f0LLOZzOpoD9cMGdEGtpPFjTmVT6jX7041Sc8iay7ICq85PVZR-rVSvMDnKocBfdm0b5mn7IczUoVuTgJcGEGdkyWBYMxBM4d6wdBN9unk_Sa0t8E49DBphsKxz6lqGSbdmjZh7r40A44qkNaCicdrDGRyjzq1jTT6BBiWdFLEuzW4vA', attritionRisk: 85, attritionFactors: ['Lembur > 8 jam/minggu', 'Shift malam beruntun', 'Gaji belum disesuaikan'] },
  { id: 5, name: 'Dewi Lestari', role: 'Kasir', dept: 'Front', rating: 4.6, punctuality: 97, skills: ['Kasir'], ptkp: 'TK/0', kat: 'A', baseSalary: 4300000, rate: 24430, nightShiftsMonth: 3, overtimeHours: 3, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0sCl1THjXHQKlRiYh1DQvNRRzJk3XbWTKCscFZ7abQN2F0v6i7T2b-FaMDBocKlTTj8nEw3icPPXXMQ6Z5ifS3_VXszm2_QJvJEd9Re7VrH_al3fZ3IOCViGyCMMUnefPB73gps7cshYhf99PobRFe7DO-1OLmQZJWc5O_zKVlNqRsXX8VzCWxZB9dSy8QG1jPJyhvVN4N1W597IndxZjTinb6-DONi3Vy3cRLJ57358uny3BNro', attritionRisk: 45, attritionFactors: ['Jadwal akhir pekan sering terganggu'] }
]

export const useHRStore = create<HRState>()(
  persist(
    (set) => ({
      activeTab: 'dashboard',
      activeRole: 'manager',
      activeEmployeeId: 1,
      activeBranch: 'Senopati (HQ)',
      filterMyShiftsOnly: false,
      theme: 'light',
      soundEnabled: true,
      isSidebarCollapsed: false,

      terRates: { A: 0.25, B: 1.50, C: 2.25 },
      employees: defaultEmployees,
      shifts: {
        1: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'OFF'],
        2: ['Pagi', 'Pagi', 'OFF', 'Pagi', 'Pagi', 'Sore', 'Sore'],
        3: ['Sore', 'Sore', 'Sore', 'Sore', 'OFF', 'Pagi', 'Pagi'],
        4: ['Pagi', 'OFF', 'Closing', 'Sore', 'Pagi', 'Pagi', 'Sore'],
        5: ['Sore', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Sore', 'Pagi']
      },
      swapRequests: [
        { id: 101, requester: 'Dimas Prasetyo', targetSlot: 'Sabtu (25 Jul) - Shift Pagi', dayIdx: 5, reason: 'Ada acara keluarga di sore hari', status: 'Menunggu Approval', stepperStep: 2, isConflict: true }
      ],
      auditLogs: [
        { timestamp: '09:45 WIB', user: 'System AI', action: 'Shift Auto-Balance', detail: 'Seimbangkan shift malam Sabtu' }
      ],
      okrGoals: [
        { id: 1, employeeId: 1, title: 'Zero Keterlambatan', target: 0, current: 0, unit: 'kali', dueDate: 'Akhir Bulan' },
        { id: 2, employeeId: 1, title: 'Latte Art Positive Reviews', target: 20, current: 14, unit: 'reviews', dueDate: 'Akhir Bulan' },
        { id: 3, employeeId: 2, title: 'Akurasi Kasir 100%', target: 100, current: 99, unit: '%', dueDate: 'Akhir Bulan' },
        { id: 4, employeeId: 4, title: 'Training Food Safety', target: 100, current: 45, unit: '%', dueDate: 'Akhir Bulan' }
      ],
      kudosList: [
        { id: 1, from: 1, to: 2, text: "Makasih banget udah back-up shift saya pas mendadak sakit kemarin! Penyelamat bgt kak! 🙏", type: "teamwork", date: "Hari ini" },
        { id: 2, from: 3, to: 4, text: "Latte art makin rapi euy, customer meja 4 tadi sampai muji-muji. Pertahankan!", type: "skill", date: "Kemarin" },
        { id: 3, from: 1, to: 5, text: "Closing super cepat & rapi malam ini. Besok pagi yang buka jadi enak banget.", type: "operational", date: "2 Hari lalu" }
      ],

      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveRole: (role) => set({ activeRole: role }),
      setActiveEmployeeId: (id) => set({ activeEmployeeId: id }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      addAuditLog: (log) => set((state) => {
        const now = new Date()
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        return { auditLogs: [{ ...log, timestamp }, ...state.auditLogs] }
      }),
      addKudos: (kudos) => set((state) => {
        const newKudos = { ...kudos, id: Date.now(), date: 'Baru Saja' }
        return { kudosList: [newKudos, ...state.kudosList] }
      }),
      updateSwapRequestStatus: (id, status) => set((state) => ({
        swapRequests: state.swapRequests.map(req => req.id === id ? { 
          ...req, 
          status,
          stepperStep: status === 'Disetujui' || status === 'Ditolak' ? 3 : req.stepperStep 
        } : req)
      })),
      autoFillShifts: () => set((state) => {
        const newShifts = { ...state.shifts }
        state.employees.forEach(emp => {
          if (!newShifts[emp.id]) newShifts[emp.id] = []
          for (let i = 0; i < 7; i++) {
            if (!newShifts[emp.id][i] || newShifts[emp.id][i] === 'Kosong') {
              newShifts[emp.id][i] = Math.random() > 0.5 ? 'Pagi' : 'Sore'
            }
          }
        })
        return { shifts: newShifts }
      }),
      autoBalanceShifts: () => set((state) => {
        const newShifts = { ...state.shifts }
        const newEmployees = [...state.employees]

        state.employees.forEach((emp, index) => {
          if ((emp.attritionRisk || 0) > 40 && newShifts[emp.id]) {
            // Fix schedules
            const nightShiftCount = newShifts[emp.id].filter(s => s === 'Sore' || s === 'Closing').length
            if (nightShiftCount > 3) {
              const lastNightIdx = newShifts[emp.id].lastIndexOf('Sore')
              const lastClosingIdx = newShifts[emp.id].lastIndexOf('Closing')
              
              if (lastNightIdx !== -1) newShifts[emp.id][lastNightIdx] = 'Pagi'
              if (lastClosingIdx !== -1) newShifts[emp.id][lastClosingIdx] = 'Libur'
            }
            
            // Fix Attrition Risk state
            newEmployees[index] = {
              ...emp,
              attritionRisk: 5,
              attritionFactors: ['Jadwal telah dioptimasi AI', 'Beban kerja seimbang']
            }
          }
        })
        return { shifts: newShifts, employees: newEmployees }
      }),
      sabotageSchedule: () => set((state) => {
        const newShifts = { ...state.shifts }
        newShifts[1] = ['Closing', 'Closing', 'Sore', 'Closing', 'Sore', 'Closing', 'Closing']
        
        const newEmployees = state.employees.map(emp => {
          if (emp.id === 1) {
            return {
              ...emp,
              attritionRisk: 95,
              attritionFactors: ['Lembur ekstrem', 'Shift malam beruntun (7 hari)', 'Risiko Burnout Tinggi']
            }
          }
          return emp
        })
        return { shifts: newShifts, employees: newEmployees }
      }),
      injectSwapRequest: () => set((state) => {
        const newReq: SwapRequest = {
          id: Date.now(),
          requester: 'Siti Rahma',
          targetSlot: 'Rabu (29 Jul) - Shift Pagi',
          dayIdx: 2,
          reason: 'Mendadak ada urusan keluarga di kampung',
          status: 'Menunggu Approval',
          stepperStep: 2,
          isConflict: false
        }
        return { swapRequests: [newReq, ...state.swapRequests] }
      }),
      updateTerRates: (rates) => set({ terRates: rates }),
      updateEmployeePayroll: (id, data) => set((state) => ({
        employees: state.employees.map(emp => emp.id === id ? { ...emp, ...data } : emp)
      })),
      resetStore: () => set({
        activeTab: 'dashboard',
        activeRole: 'manager',
        activeEmployeeId: 1,
        activeBranch: 'Senopati (HQ)',
        filterMyShiftsOnly: false,
        theme: 'light',
        soundEnabled: true,
        isSidebarCollapsed: false,
        terRates: { A: 0.25, B: 1.50, C: 2.25 },
        employees: defaultEmployees,
        shifts: {
          1: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'OFF'],
          2: ['Pagi', 'Pagi', 'OFF', 'Pagi', 'Pagi', 'Sore', 'Sore'],
          3: ['Sore', 'Sore', 'Sore', 'Sore', 'OFF', 'Pagi', 'Pagi'],
          4: ['Pagi', 'OFF', 'Closing', 'Sore', 'Pagi', 'Pagi', 'Sore'],
          5: ['Sore', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Sore', 'Pagi']
        },
        swapRequests: [
          { id: 101, requester: 'Dimas Prasetyo', targetSlot: 'Sabtu (25 Jul) - Shift Pagi', dayIdx: 5, reason: 'Ada acara keluarga di sore hari', status: 'Menunggu Approval', stepperStep: 2, isConflict: true }
        ],
        auditLogs: [
          { timestamp: '09:45 WIB', user: 'System AI', action: 'Shift Auto-Balance', detail: 'Seimbangkan shift malam Sabtu' }
        ],
        okrGoals: [
          { id: 1, employeeId: 1, title: 'Zero Keterlambatan', target: 0, current: 0, unit: 'kali', dueDate: 'Akhir Bulan' },
          { id: 2, employeeId: 1, title: 'Latte Art Positive Reviews', target: 20, current: 14, unit: 'reviews', dueDate: 'Akhir Bulan' },
          { id: 3, employeeId: 2, title: 'Akurasi Kasir 100%', target: 100, current: 99, unit: '%', dueDate: 'Akhir Bulan' },
          { id: 4, employeeId: 4, title: 'Training Food Safety', target: 100, current: 45, unit: '%', dueDate: 'Akhir Bulan' }
        ],
        kudosList: [
          { id: 1, from: 1, to: 2, text: "Makasih banget udah back-up shift saya pas mendadak sakit kemarin! Penyelamat bgt kak! 🙏", type: "teamwork", date: "Hari ini" },
          { id: 2, from: 3, to: 4, text: "Latte art makin rapi euy, customer meja 4 tadi sampai muji-muji. Pertahankan!", type: "skill", date: "Kemarin" },
          { id: 3, from: 1, to: 5, text: "Closing super cepat & rapi malam ini. Besok pagi yang buka jadi enak banget.", type: "operational", date: "2 Hari lalu" }
        ]
      })
    }),
    {
      name: 'sokara_hr_store',
      version: 6,
    }
  )
)
