import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'manager' | 'karyawan'

export interface Unavailability {
  dayIdx: number // 0 = Senin, 1 = Selasa, ..., 6 = Minggu
  dayName: string
  reason: string
}

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
  unavailability?: Unavailability[]
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

export interface AttendanceRecord {
  id: number
  employeeId: number
  name: string
  role: string
  avatar: string
  timeIn: string
  timeOut: string
  status: 'Tepat Waktu' | 'Terlambat' | 'Izin' | 'Belum Hadir'
  geofence: string
  date: string
  coordinates?: string
}

export interface HandoverNote {
  id: number
  author: string
  shift: string
  note: string
  time: string
  priority: 'normal' | 'urgent'
}

export interface OpenShift {
  id: number
  originalOwner: string
  role: string
  slot: string
  dayIdx: number
  shiftType: string
  reason: string
  status: 'open' | 'claimed'
  claimedBy?: string
}

export interface MoodRecord {
  mood: 'ready' | 'good' | 'tired' | 'stressed'
  label: string
  timestamp: string
}

export interface SopTask {
  id: string
  shiftType: 'Pagi' | 'Closing'
  title: string
  completed: boolean
  completedBy?: string
  completedAt?: string
}

export interface AttestationRecord {
  id: number
  employeeId: number
  employeeName: string
  date: string
  hadBreak: boolean
  isFit: boolean
  shiftConfirmed: boolean
  notes: string
  timestamp: string
}

export interface RoamingShiftRequest {
  id: number
  targetBranch: string
  sourceBranch: string
  role: string
  dayIdx: number
  shiftType: string
  travelStipend: number
  reason: string
  status: 'open' | 'claimed'
  claimedBy?: string
}

export interface TimesheetApproval {
  id: number
  employeeId: number
  employeeName: string
  date: string
  scheduledShift: string
  actualClockIn: string
  actualClockOut: string
  varianceMinutes: number
  approved: boolean
  approvedBy?: string
  approvedAt?: string
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
  rosterStatus: 'draft' | 'published'
  
  terRates: Record<string, number>
  employees: Employee[]
  shifts: Record<number, string[]>
  shiftTemplates: Record<string, Record<number, string[]>>
  attestationRecords: AttestationRecord[]
  roamingRequests: RoamingShiftRequest[]
  timesheetApprovals: TimesheetApproval[]
  swapRequests: SwapRequest[]
  auditLogs: AuditLog[]
  okrGoals: OkrGoal[]
  kudosList: Kudos[]
  attendances: AttendanceRecord[]
  handoverNotes: HandoverNote[]
  openShifts: OpenShift[]
  employeeMoods: Record<number, MoodRecord>
  sopTasks: SopTask[]

  // Actions
  setActiveTab: (tab: string) => void
  setActiveRole: (role: Role) => void
  setActiveEmployeeId: (id: number) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  toggleSound: () => void
  publishRoster: () => void
  addAuditLog: (log: Omit<AuditLog, 'timestamp'>) => void
  resetStore: () => void
  addKudos: (kudos: Omit<Kudos, 'id' | 'date'>) => void
  addEmployee: (employee: Omit<Employee, 'id'>) => void
  deleteEmployee: (id: number) => void
  addSwapRequest: (request: Omit<SwapRequest, 'id'>) => void
  recordAttendance: (employeeId: number, type: 'in' | 'out', geofence?: string) => void
  addHandoverNote: (note: string, author: string, shift: string, priority?: 'normal' | 'urgent') => void
  postOpenShift: (slot: string, dayIdx: number, shiftType: string, reason: string) => void
  claimOpenShift: (shiftId: number, claimantId: number) => void
  postRoamingRequest: (req: Omit<RoamingShiftRequest, 'id'>) => void
  claimRoamingRequest: (id: number, claimantName: string) => void
  approveTimesheet: (id: number, managerName: string) => void
  approveAllTimesheets: (managerName: string) => void
  setEmployeeMood: (employeeId: number, mood: 'ready' | 'good' | 'tired' | 'stressed', label: string) => void
  updateSwapRequestStatus: (id: number, status: string) => void
  autoFillShifts: () => void
  autoBalanceShifts: () => void
  sabotageSchedule: () => void
  injectSwapRequest: () => void
  updateTerRates: (rates: Record<string, number>) => void
  updateEmployeePayroll: (id: number, data: Partial<Employee>) => void
  updateShift: (employeeId: number, dayIdx: number, shift: string) => void
  saveShiftTemplate: (name: string) => void
  applyShiftTemplate: (name: string) => void
  deleteShiftTemplate: (name: string) => void
  addAttestationRecord: (record: Omit<AttestationRecord, 'id' | 'timestamp'>) => void
  toggleSopTask: (id: string, staffName: string) => void
  restoreSnapshot: (snapshotState: Partial<HRState>) => void
  updateUnavailability: (employeeId: number, unavail: Unavailability[]) => void
}

const defaultEmployees: Employee[] = [
  { id: 1, name: 'Dimas Prasetyo', role: 'Head Barista', dept: 'Bar', rating: 4.9, punctuality: 98, skills: ['Senior Barista', 'Opening Lead'], ptkp: 'K/1', kat: 'B', baseSalary: 5500000, rate: 31250, nightShiftsMonth: 2, overtimeHours: 4, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwyBcUZScQ83Nq3o598I2kDq6PT3SKgnuQl_OXPt1KACSyg0g3z-4O6ErmJN2e4NjvQbkFCb7DSyL9l2UgNrmfVOWRj89xG5zTNaAuSqr6baaaFfV4u-e7GZ3JUJGXyHvxPSRr8Sekif9r_eNQDc2cZNj7nsu-9NokJUFkgidtKx8127yWVQrjhrm6Vblj8AH5AJ16Q4YVjxG7taGIXOtaR6D6RwDsGYRwsRoAIji3-CetINlkXk', attritionRisk: 15, attritionFactors: ['Performa stabil'] },
  { id: 2, name: 'Siti Rahma', role: 'Kasir Senior', dept: 'Front', rating: 4.8, punctuality: 96, skills: ['Kasir Senior', 'POS Master'], ptkp: 'TK/1', kat: 'A', baseSalary: 4800000, rate: 27270, nightShiftsMonth: 4, overtimeHours: 2, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBwt58-mWc71tS5riU9IdSU_g0_HzlOe6jrEvdgya-gjiX5jn9StUqY9REwAPuCQDQOtCF17JHpreyraLpc47I6NdrJ83B3-Mu4yd0RjV2IeOXVyMzYH8XR_YCoMV6tuq3VsqhC4q9RXn4uzFwYrsMWYFcN40-YaolEXny-sYUG7P5Z7mCKqogoFRGQmbW9h0gnWz5L7b7ZyXNh9BRrj399IhAuyracHv2BhOt1L3lTu2ZHgUEeew', attritionRisk: 20, attritionFactors: ['Beban shift malam cukup tinggi'] },
  { id: 3, name: 'Budi Santoso', role: 'Senior Barista', dept: 'Bar', rating: 4.7, punctuality: 99, skills: ['Senior Barista', 'Latte Art'], ptkp: 'TK/0', kat: 'A', baseSalary: 5000000, rate: 28400, nightShiftsMonth: 1, overtimeHours: 1, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp9qz8IPJe1fvn4KeLgS2G3Fuqah6CRd78t10rkIltGN3tNI-bDtB46Cx113yC8pl_9VEAte71XlRzTkqH99b35uHJ_5N0FVYLCg19VvReWVhVS42KoHD7a9rkWNteignZw_iHROaQJpMZmUDUFHRxitoRe74LfBvA4PAYx_n7xOWI3pp28R3dhOspmSli3OE7Ce36bmlIyYeH7KdPa-KvgS0YbLK4K8hFdk3SUqs9gS6tJxuKUUk', attritionRisk: 5, attritionFactors: ['Engagement tinggi', 'Work-life balance baik'] },
  { id: 4, name: 'Rian Kurniawan', role: 'Barista Junior', dept: 'Bar', rating: 4.5, punctuality: 94, skills: ['Barista'], ptkp: 'TK/0', kat: 'A', baseSalary: 4200000, rate: 23860, nightShiftsMonth: 6, overtimeHours: 8, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjvsUTtQdFtrKmreQNid6IEsVHUPgwy-_b266BKvXxebvRPdXsyj0R92v8HLiz_IG3FG4f0LLOZzOpoD9cMGdEGtpPFjTmVT6jX7041Sc8iay7ICq85PVZR-rVSvMDnKocBfdm0b5mn7IczUoVuTgJcGEGdkyWBYMxBM4d6wdBN9unk_Sa0t8E49DBphsKxz6lqGSbdmjZh7r40A44qkNaCicdrDGRyjzq1jTT6BBiWdFLEuzW4vA', attritionRisk: 85, attritionFactors: ['Lembur > 8 jam/minggu', 'Shift malam beruntun', 'Gaji belum disesuaikan'], unavailability: [{ dayIdx: 1, dayName: 'Selasa', reason: 'Jadwal Kuliah Praktikum' }, { dayIdx: 3, dayName: 'Kamis', reason: 'Kuliah Teori' }] },
  { id: 5, name: 'Dewi Lestari', role: 'Kasir', dept: 'Front', rating: 4.6, punctuality: 97, skills: ['Kasir'], ptkp: 'TK/0', kat: 'A', baseSalary: 4300000, rate: 24430, nightShiftsMonth: 3, overtimeHours: 3, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0sCl1THjXHQKlRiYh1DQvNRRzJk3XbWTKCscFZ7abQN2F0v6i7T2b-FaMDBocKlTTj8nEw3icPPXXMQ6Z5ifS3_VXszm2_QJvJEd9Re7VrH_al3fZ3IOCViGyCMMUnefPB73gps7cshYhf99PobRFe7DO-1OLmQZJWc5O_zKVlNqRsXX8VzCWxZB9dSy8QG1jPJyhvVN4N1W597IndxZjTinb6-DONi3Vy3cRLJ57358uny3BNro', attritionRisk: 45, attritionFactors: ['Jadwal akhir pekan sering terganggu'], unavailability: [{ dayIdx: 3, dayName: 'Kamis', reason: 'Kuliah Malam' }] }
]

const defaultAttendances: AttendanceRecord[] = [
  { id: 1, employeeId: 1, name: 'Dimas Prasetyo', role: 'Head Barista', avatar: defaultEmployees[0].avatar, timeIn: '07:42', timeOut: '--:--', status: 'Tepat Waktu', geofence: 'Inside Radius (HQ 45m)', date: 'Hari Ini', coordinates: '-6.2289, 106.8021' },
  { id: 2, employeeId: 2, name: 'Siti Rahma', role: 'Kasir Senior', avatar: defaultEmployees[1].avatar, timeIn: '07:55', timeOut: '--:--', status: 'Tepat Waktu', geofence: 'Inside Radius (HQ 20m)', date: 'Hari Ini', coordinates: '-6.2285, 106.8025' },
  { id: 3, employeeId: 3, name: 'Budi Santoso', role: 'Senior Barista', avatar: defaultEmployees[2].avatar, timeIn: '08:14', timeOut: '--:--', status: 'Terlambat', geofence: 'Inside Radius (HQ 12m)', date: 'Hari Ini', coordinates: '-6.2288, 106.8023' },
  { id: 4, employeeId: 4, name: 'Rian Kurniawan', role: 'Barista Junior', avatar: defaultEmployees[3].avatar, timeIn: '07:48', timeOut: '--:--', status: 'Tepat Waktu', geofence: 'Outside Radius (1.4 km)', date: 'Hari Ini', coordinates: '-6.2390, 106.8120' },
  { id: 5, employeeId: 5, name: 'Dewi Lestari', role: 'Kasir', avatar: defaultEmployees[4].avatar, timeIn: '07:58', timeOut: '--:--', status: 'Tepat Waktu', geofence: 'Inside Radius (HQ 50m)', date: 'Hari Ini', coordinates: '-6.2287, 106.8020' }
]

const defaultHandoverNotes: HandoverNote[] = [
  { id: 1, author: 'Dimas Prasetyo', shift: 'Shift Pagi', note: 'Biji espresso House Blend sisa 2 batch (4kg). Grinder 1 sudah kalibrasi 18.5g extraction 27s.', time: '14:30 WIB', priority: 'normal' },
  { id: 2, author: 'Siti Rahma', shift: 'Shift Pagi', note: 'Kertas struk kasir EDC 2 sisa 1 roll. Sudah order restock ke logistik.', time: '14:45 WIB', priority: 'urgent' }
]

const defaultOpenShifts: OpenShift[] = [
  { id: 1, originalOwner: 'Rian Kurniawan', role: 'Barista Junior', slot: 'Jumat (28 Agu) - Shift Sore', dayIdx: 4, shiftType: 'Sore', reason: 'Jadwal kuliah praktikum pengganti', status: 'open' },
  { id: 2, originalOwner: 'Dewi Lestari', role: 'Kasir', slot: 'Minggu (30 Agu) - Shift Pagi', dayIdx: 6, shiftType: 'Pagi', reason: 'Urusan keluarga di luar kota', status: 'open' }
]

const defaultSopTasks: SopTask[] = [
  { id: 'op-1', shiftType: 'Pagi', title: 'Kalibrasi Grinder & Espresso Extraction (Target 26-28 detik)', completed: true, completedBy: 'Dimas Prasetyo', completedAt: '07:45 WIB' },
  { id: 'op-2', shiftType: 'Pagi', title: 'Cek Suhu Chiller Susu & Ice Machine (< 4°C)', completed: true, completedBy: 'Dimas Prasetyo', completedAt: '07:50 WIB' },
  { id: 'op-3', shiftType: 'Pagi', title: 'Prep Fresh Milk, Syrup Bar, & Cup Packaging', completed: false },
  { id: 'op-4', shiftType: 'Pagi', title: 'Buka Kasir POS & Hitung Kas Modal Awal (Rp 500.000)', completed: true, completedBy: 'Siti Rahma', completedAt: '07:58 WIB' },
  { id: 'cl-1', shiftType: 'Closing', title: 'Backflush Mesin Espresso dengan Cafiza Chemical Detergent', completed: false },
  { id: 'cl-2', shiftType: 'Closing', title: 'Sanitasi Steam Wand, Knockbox, & Drip Tray', completed: false },
  { id: 'cl-3', shiftType: 'Closing', title: 'Tutup Batch Kasir POS & Rekonsiliasi EDC / QRIS', completed: false },
  { id: 'cl-4', shiftType: 'Closing', title: 'Kunci Pintu Kedai & Matikan AC / Audio Bar System', completed: false }
]

const defaultShiftTemplates: Record<string, Record<number, string[]>> = {
  'Standar Operasional Regular': {
    1: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'OFF'],
    2: ['Pagi', 'Pagi', 'OFF', 'Pagi', 'Pagi', 'Sore', 'Sore'],
    3: ['Sore', 'Sore', 'Sore', 'Sore', 'OFF', 'Pagi', 'Pagi'],
    4: ['Pagi', 'OFF', 'Closing', 'Sore', 'Pagi', 'Pagi', 'Sore'],
    5: ['Sore', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Sore', 'Pagi']
  },
  'Weekend Rush (Heavy Evening & Closing)': {
    1: ['Pagi', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Closing', 'Closing'],
    2: ['Pagi', 'OFF', 'Pagi', 'Pagi', 'Sore', 'Sore', 'Closing'],
    3: ['OFF', 'Sore', 'Sore', 'Sore', 'Closing', 'Closing', 'Sore'],
    4: ['Pagi', 'Pagi', 'OFF', 'Sore', 'Closing', 'Closing', 'OFF'],
    5: ['Sore', 'Sore', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Pagi']
  },
  'Event & Festival Support (Max Frontline)': {
    1: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Closing', 'Closing', 'Sore'],
    2: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Sore', 'Closing', 'Closing'],
    3: ['Sore', 'Sore', 'Sore', 'OFF', 'Closing', 'Closing', 'Closing'],
    4: ['Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'Closing', 'OFF'],
    5: ['Sore', 'Sore', 'Sore', 'Pagi', 'OFF', 'Sore', 'Closing']
  }
}

const defaultAttestationRecords: AttestationRecord[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'Dimas Prasetyo',
    date: 'Kemarin',
    hadBreak: true,
    isFit: true,
    shiftConfirmed: true,
    notes: 'Shift berjalan lancar, kalibrasi grinder stabil seharian.',
    timestamp: '17:05 WIB'
  }
]

const defaultRoamingRequests: RoamingShiftRequest[] = [
  {
    id: 201,
    targetBranch: 'Sudirman',
    sourceBranch: 'Senopati (HQ)',
    role: 'Barista',
    dayIdx: 4, // Jumat
    shiftType: 'Pagi',
    travelStipend: 50000,
    reason: 'Lonjakan antrean korporat SCBD (+2 Kru Pagi)',
    status: 'open'
  },
  {
    id: 202,
    targetBranch: 'Kemang',
    sourceBranch: 'Senopati (HQ)',
    role: 'Kasir',
    dayIdx: 5, // Sabtu
    shiftType: 'Closing',
    travelStipend: 50000,
    reason: 'Kemang Art Bazaar Festival (+1 Kasir Malam)',
    status: 'open'
  }
]

const defaultTimesheetApprovals: TimesheetApproval[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'Dimas Prasetyo',
    date: 'Hari Ini',
    scheduledShift: 'Pagi (08:00 - 17:00)',
    actualClockIn: '07:42 WIB',
    actualClockOut: '--:--',
    varianceMinutes: -18,
    approved: true,
    approvedBy: 'Aldy (Manager)',
    approvedAt: '08:00 WIB'
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: 'Siti Rahma',
    date: 'Hari Ini',
    scheduledShift: 'Pagi (08:00 - 17:00)',
    actualClockIn: '07:55 WIB',
    actualClockOut: '--:--',
    varianceMinutes: -5,
    approved: true,
    approvedBy: 'Aldy (Manager)',
    approvedAt: '08:00 WIB'
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: 'Budi Santoso',
    date: 'Hari Ini',
    scheduledShift: 'Pagi (08:00 - 17:00)',
    actualClockIn: '08:14 WIB',
    actualClockOut: '--:--',
    varianceMinutes: 14,
    approved: false
  },
  {
    id: 4,
    employeeId: 4,
    employeeName: 'Rian Kurniawan',
    date: 'Hari Ini',
    scheduledShift: 'Pagi (08:00 - 17:00)',
    actualClockIn: '07:48 WIB',
    actualClockOut: '--:--',
    varianceMinutes: -12,
    approved: true,
    approvedBy: 'Aldy (Manager)',
    approvedAt: '08:00 WIB'
  },
  {
    id: 5,
    employeeId: 5,
    employeeName: 'Dewi Lestari',
    date: 'Hari Ini',
    scheduledShift: 'Pagi (08:00 - 17:00)',
    actualClockIn: '07:58 WIB',
    actualClockOut: '--:--',
    varianceMinutes: -2,
    approved: true,
    approvedBy: 'Aldy (Manager)',
    approvedAt: '08:00 WIB'
  }
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
      rosterStatus: 'published',

      terRates: { A: 0.25, B: 1.50, C: 2.25 },
      employees: defaultEmployees,
      attendances: defaultAttendances,
      handoverNotes: defaultHandoverNotes,
      openShifts: defaultOpenShifts,
      sopTasks: defaultSopTasks,
      shiftTemplates: defaultShiftTemplates,
      attestationRecords: defaultAttestationRecords,
      roamingRequests: defaultRoamingRequests,
      timesheetApprovals: defaultTimesheetApprovals,
      employeeMoods: {
        1: { mood: 'ready', label: 'Siap Tempur', timestamp: '07:42 WIB' },
        2: { mood: 'good', label: 'Bugar & Fokus', timestamp: '07:55 WIB' },
        3: { mood: 'tired', label: 'Butuh Kopi', timestamp: '08:14 WIB' }
      },
      shifts: {
        1: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'OFF'],
        2: ['Pagi', 'Pagi', 'OFF', 'Pagi', 'Pagi', 'Sore', 'Sore'],
        3: ['Sore', 'Sore', 'Sore', 'Sore', 'OFF', 'Pagi', 'Pagi'],
        4: ['Pagi', 'OFF', 'Closing', 'Sore', 'Pagi', 'Pagi', 'Sore'],
        5: ['Sore', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Sore', 'Pagi']
      },
      swapRequests: [
        { id: 101, requester: 'Dimas Prasetyo', targetSlot: 'Sabtu (25 Jul) - Shift Pagi', dayIdx: 5, reason: 'Ada acara keluarga di sore hari', status: 'Menunggu Approval', stepperStep: 2, isConflict: true },
        { id: 102, requester: 'Siti Rahma', targetSlot: 'Senin (20 Jul) - Cuti Tahunan', dayIdx: 0, reason: 'Kontrol kehamilan', status: 'Disetujui', stepperStep: 3, isConflict: false },
        { id: 103, requester: 'Budi Santoso', targetSlot: 'Rabu (22 Jul) - Shift Sore', dayIdx: 2, reason: 'Tukar shift dengan Rian karena urusan mendadak', status: 'Ditolak', stepperStep: 3, isConflict: true }
      ],
      auditLogs: [
        { timestamp: '09:45 WIB', user: 'System AI', action: 'Shift Auto-Balance', detail: 'Seimbangkan shift malam Sabtu' }
      ],
      okrGoals: [
        { id: 1, employeeId: 1, title: 'Zero Keterlambatan', target: 0, current: 0, unit: 'kali', dueDate: 'Akhir Bulan' },
        { id: 2, employeeId: 1, title: 'Latte Art Positive Reviews', target: 20, current: 14, unit: 'reviews', dueDate: 'Akhir Bulan' },
        { id: 3, employeeId: 2, title: 'Akurasi Kasir 100%', target: 100, current: 99, unit: '%', dueDate: 'Akhir Bulan' },
        { id: 4, employeeId: 3, title: 'Mentoring Junior Barista', target: 4, current: 2, unit: 'sesi', dueDate: 'Minggu Depan' },
        { id: 5, employeeId: 4, title: 'Training Food Safety', target: 100, current: 45, unit: '%', dueDate: 'Akhir Bulan' },
        { id: 6, employeeId: 5, title: 'Pelayanan Cepat < 3 Menit', target: 95, current: 88, unit: '%', dueDate: 'Akhir Bulan' }
      ],
      kudosList: [
        { id: 1, from: 1, to: 2, text: "Makasih banget udah back-up shift saya pas mendadak sakit kemarin! Penyelamat bgt kak!", type: "teamwork", date: "Hari ini" },
        { id: 2, from: 3, to: 4, text: "Latte art makin rapi euy, customer meja 4 tadi sampai muji-muji. Pertahankan!", type: "skill", date: "Kemarin" },
        { id: 3, from: 1, to: 5, text: "Closing super cepat & rapi malam ini. Besok pagi yang buka jadi enak banget.", type: "operational", date: "2 Hari lalu" },
        { id: 4, from: 2, to: 1, text: "Komunikasi ke tim sangat jelas, handling komplain pelanggan tadi siang juga pro banget!", type: "leadership", date: "3 Hari lalu" },
        { id: 5, from: 4, to: 3, text: "Makasih udah ngajarin teknik kalibrasi grinder mesin espresso pagi tadi!", type: "mentorship", date: "4 Hari lalu" },
        { id: 6, from: 5, to: 2, text: "Balance kasir 100% akurat minggu ini, ga ada selisih sama sekali. Keren!", type: "accuracy", date: "Minggu lalu" }
      ],

      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveRole: (role) => set({ activeRole: role }),
      setActiveEmployeeId: (id) => set({ activeEmployeeId: id }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      publishRoster: () => set((state) => ({
        rosterStatus: 'published',
        auditLogs: [{ timestamp: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`, user: 'Manager', action: 'Publish Roster', detail: 'Mempublikasikan jadwal resmi 7 hari ke seluruh staf' }, ...state.auditLogs]
      })),
      addAuditLog: (log) => set((state) => {
        const now = new Date()
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        return { auditLogs: [{ ...log, timestamp }, ...state.auditLogs] }
      }),
      addKudos: (kudos) => set((state) => {
        const newKudos = { ...kudos, id: Date.now(), date: 'Baru Saja' }
        return { kudosList: [newKudos, ...state.kudosList] }
      }),
      addEmployee: (empData) => set((state) => {
        const newId = state.employees.length > 0 ? Math.max(...state.employees.map(e => e.id)) + 1 : 1
        const newEmp: Employee = {
          ...empData,
          id: newId,
          rating: 5.0,
          punctuality: 100,
          nightShiftsMonth: 0,
          overtimeHours: 0,
          attritionRisk: 5,
          attritionFactors: ['Karyawan Baru']
        }
        const newShifts = { ...state.shifts, [newId]: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Pagi', 'OFF', 'OFF'] }
        return {
          employees: [...state.employees, newEmp],
          shifts: newShifts,
          auditLogs: [{ timestamp: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`, user: 'Manager', action: 'Tambah Karyawan', detail: `Menambahkan ${newEmp.name} (${newEmp.role})` }, ...state.auditLogs]
        }
      }),
      deleteEmployee: (id) => set((state) => {
        const emp = state.employees.find(e => e.id === id)
        return {
          employees: state.employees.filter(e => e.id !== id),
          auditLogs: [{ timestamp: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`, user: 'Manager', action: 'Hapus Karyawan', detail: `Menghapus ${emp?.name || id}` }, ...state.auditLogs]
        }
      }),
      addSwapRequest: (reqData) => set((state) => {
        const newReq: SwapRequest = {
          ...reqData,
          id: Date.now()
        }
        return {
          swapRequests: [newReq, ...state.swapRequests],
          auditLogs: [{ timestamp: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`, user: reqData.requester, action: 'Pengajuan Swap', detail: `Tukar shift ke ${reqData.targetSlot}` }, ...state.auditLogs]
        }
      }),
      recordAttendance: (employeeId, type, geofence = 'Inside Radius (HQ 25m)') => set((state) => {
        const emp = state.employees.find(e => e.id === employeeId)
        if (!emp) return state

        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        const isLate = now.getHours() >= 8 && now.getMinutes() > 10
        const status = isLate ? 'Terlambat' : 'Tepat Waktu'

        const existingIdx = state.attendances.findIndex(a => a.employeeId === employeeId && a.date === 'Hari Ini')

        let updatedAttendances = [...state.attendances]
        if (existingIdx >= 0) {
          if (type === 'out') {
            updatedAttendances[existingIdx] = {
              ...updatedAttendances[existingIdx],
              timeOut: timeStr
            }
          }
        } else {
          updatedAttendances = [
            {
              id: Date.now(),
              employeeId,
              name: emp.name,
              role: emp.role,
              avatar: emp.avatar,
              timeIn: timeStr,
              timeOut: '--:--',
              status,
              geofence,
              date: 'Hari Ini',
              coordinates: '-6.2289, 106.8021'
            },
            ...updatedAttendances
          ]
        }

        return {
          attendances: updatedAttendances,
          auditLogs: [
            {
              timestamp: `${timeStr} WIB`,
              user: emp.name,
              action: type === 'in' ? 'Clock In' : 'Clock Out',
              detail: `Presensi ${type === 'in' ? 'Masuk' : 'Keluar'} (${geofence})`
            },
            ...state.auditLogs
          ]
        }
      }),
      addHandoverNote: (note, author, shift, priority = 'normal') => set((state) => {
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        const newNote: HandoverNote = {
          id: Date.now(),
          author,
          shift,
          note,
          time: timeStr,
          priority
        }
        return {
          handoverNotes: [newNote, ...state.handoverNotes],
          auditLogs: [{ timestamp: timeStr, user: author, action: 'Handover Log', detail: `Catatan operasional shift: "${note.slice(0, 30)}..."` }, ...state.auditLogs]
        }
      }),
      postOpenShift: (slot, dayIdx, shiftType, reason) => set((state) => {
        const emp = state.employees.find(e => e.id === state.activeEmployeeId)
        const newOpen: OpenShift = {
          id: Date.now(),
          originalOwner: emp?.name || 'Staff',
          role: emp?.role || 'Barista',
          slot,
          dayIdx,
          shiftType,
          reason,
          status: 'open'
        }
        return {
          openShifts: [newOpen, ...state.openShifts],
          auditLogs: [{ timestamp: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`, user: emp?.name || 'Staff', action: 'Bursa Shift', detail: `Melempar shift ${slot} ke marketplace` }, ...state.auditLogs]
        }
      }),
      claimOpenShift: (shiftId, claimantId) => set((state) => {
        const claimant = state.employees.find(e => e.id === claimantId)
        const targetOpen = state.openShifts.find(s => s.id === shiftId)
        if (!claimant || !targetOpen) return state

        const newShifts = { ...state.shifts }
        if (!newShifts[claimantId]) newShifts[claimantId] = Array(7).fill('OFF')
        newShifts[claimantId][targetOpen.dayIdx] = targetOpen.shiftType

        const origEmp = state.employees.find(e => e.name === targetOpen.originalOwner)
        if (origEmp && newShifts[origEmp.id]) {
          newShifts[origEmp.id][targetOpen.dayIdx] = 'OFF'
        }

        const updatedOpenShifts = state.openShifts.map(s => s.id === shiftId ? { ...s, status: 'claimed' as const, claimedBy: claimant.name } : s)

        return {
          shifts: newShifts,
          openShifts: updatedOpenShifts,
          auditLogs: [{ timestamp: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`, user: claimant.name, action: 'Klaim Shift', detail: `Mengambil alih shift ${targetOpen.slot} dari ${targetOpen.originalOwner}` }, ...state.auditLogs]
        }
      }),
      setEmployeeMood: (employeeId, mood, label) => set((state) => {
        const timeStr = `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
        return {
          employeeMoods: {
            ...state.employeeMoods,
            [employeeId]: { mood, label, timestamp: timeStr }
          }
        }
      }),
      updateSwapRequestStatus: (id, status) => set((state) => ({
        swapRequests: state.swapRequests.map(req => req.id === id ? { 
          ...req, 
          status,
          stepperStep: status === 'Disetujui' || status === 'Ditolak' ? 3 : req.stepperStep 
        } : req)
      })),
      autoFillShifts: () => set((state) => {
        const newShifts: Record<number, string[]> = {}
        state.employees.forEach(emp => {
          const currentArray = state.shifts[emp.id] ? [...state.shifts[emp.id]] : Array(7).fill('OFF')
          for (let i = 0; i < 7; i++) {
            // Check student/part-time unavailability matrix
            const isUnavailable = emp.unavailability?.some(u => u.dayIdx === i)
            if (isUnavailable) {
              currentArray[i] = 'OFF'
            } else if (!currentArray[i] || currentArray[i] === 'Kosong' || currentArray[i] === 'OFF') {
              currentArray[i] = Math.random() > 0.5 ? 'Pagi' : 'Sore'
            }
          }
          newShifts[emp.id] = currentArray
        })
        return { shifts: newShifts, rosterStatus: 'draft' }
      }),
      autoBalanceShifts: () => set((state) => {
        const newShifts: Record<number, string[]> = {}
        Object.entries(state.shifts).forEach(([k, v]) => {
          newShifts[Number(k)] = [...v]
        })
        const newEmployees = [...state.employees]

        state.employees.forEach((emp, index) => {
          if ((emp.attritionRisk || 0) > 40 && newShifts[emp.id]) {
            const nightShiftCount = newShifts[emp.id].filter(s => s === 'Sore' || s === 'Closing').length
            if (nightShiftCount > 3) {
              const lastNightIdx = newShifts[emp.id].lastIndexOf('Sore')
              const lastClosingIdx = newShifts[emp.id].lastIndexOf('Closing')
              
              if (lastNightIdx !== -1) newShifts[emp.id][lastNightIdx] = 'Pagi'
              if (lastClosingIdx !== -1) newShifts[emp.id][lastClosingIdx] = 'OFF'
            }
            
            newEmployees[index] = {
              ...emp,
              attritionRisk: 5,
              attritionFactors: ['Jadwal telah dioptimasi AI', 'Beban kerja seimbang']
            }
          }
        })
        return { shifts: newShifts, employees: newEmployees, rosterStatus: 'draft' }
      }),
      sabotageSchedule: () => set((state) => {
        const newShifts: Record<number, string[]> = {}
        Object.entries(state.shifts).forEach(([k, v]) => {
          newShifts[Number(k)] = [...v]
        })
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
        return { shifts: newShifts, employees: newEmployees, rosterStatus: 'draft' }
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
      updateShift: (employeeId, dayIdx, shift) => set((state) => {
        const current = state.shifts[employeeId] ? [...state.shifts[employeeId]] : Array(7).fill('OFF')
        current[dayIdx] = shift
        return {
          shifts: {
            ...state.shifts,
            [employeeId]: current
          },
          rosterStatus: 'draft'
        }
      }),
      saveShiftTemplate: (name) => set((state) => {
        const cloned: Record<number, string[]> = {}
        Object.entries(state.shifts).forEach(([k, v]) => {
          cloned[Number(k)] = [...v]
        })
        return {
          shiftTemplates: {
            ...state.shiftTemplates,
            [name]: cloned
          }
        }
      }),
      applyShiftTemplate: (name) => set((state) => {
        const target = state.shiftTemplates[name]
        if (!target) return {}
        const cloned: Record<number, string[]> = {}
        Object.entries(target).forEach(([k, v]) => {
          cloned[Number(k)] = [...v]
        })
        return {
          shifts: cloned,
          rosterStatus: 'draft'
        }
      }),
      deleteShiftTemplate: (name) => set((state) => {
        const next = { ...state.shiftTemplates }
        delete next[name]
        return { shiftTemplates: next }
      }),
      postRoamingRequest: (req) => set((state) => ({
        roamingRequests: [{ ...req, id: Date.now() }, ...state.roamingRequests]
      })),
      claimRoamingRequest: (id, claimantName) => set((state) => ({
        roamingRequests: state.roamingRequests.map(r => r.id === id ? { ...r, status: 'claimed', claimedBy: claimantName } : r)
      })),
      approveTimesheet: (id, managerName) => set((state) => {
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        return {
          timesheetApprovals: state.timesheetApprovals.map(t => t.id === id ? { ...t, approved: true, approvedBy: managerName, approvedAt: timeStr } : t)
        }
      }),
      approveAllTimesheets: (managerName) => set((state) => {
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        return {
          timesheetApprovals: state.timesheetApprovals.map(t => ({ ...t, approved: true, approvedBy: managerName, approvedAt: timeStr }))
        }
      }),
      addAttestationRecord: (record) => set((state) => {
        const now = new Date()
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        const newRecord: AttestationRecord = {
          ...record,
          id: Date.now(),
          timestamp
        }
        return {
          attestationRecords: [newRecord, ...state.attestationRecords]
        }
      }),
      toggleSopTask: (id, staffName) => set((state) => {
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        return {
          sopTasks: state.sopTasks.map(task => {
            if (task.id === id) {
              const nextState = !task.completed
              return {
                ...task,
                completed: nextState,
                completedBy: nextState ? staffName : undefined,
                completedAt: nextState ? timeStr : undefined
              }
            }
            return task
          })
        }
      }),
      restoreSnapshot: (snapshotState) => set(snapshotState),
      updateUnavailability: (employeeId, unavail) => set((state) => ({
        employees: state.employees.map(emp => emp.id === employeeId ? { ...emp, unavailability: unavail } : emp)
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
        rosterStatus: 'published',
        terRates: { A: 0.25, B: 1.50, C: 2.25 },
        employees: defaultEmployees,
        attendances: defaultAttendances,
        handoverNotes: defaultHandoverNotes,
        openShifts: defaultOpenShifts,
        sopTasks: defaultSopTasks,
        shiftTemplates: defaultShiftTemplates,
        attestationRecords: defaultAttestationRecords,
        roamingRequests: defaultRoamingRequests,
        timesheetApprovals: defaultTimesheetApprovals,
        employeeMoods: {
          1: { mood: 'ready', label: 'Siap Tempur', timestamp: '07:42 WIB' },
          2: { mood: 'good', label: 'Bugar & Fokus', timestamp: '07:55 WIB' },
          3: { mood: 'tired', label: 'Butuh Kopi', timestamp: '08:14 WIB' }
        },
        shifts: {
          1: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'OFF'],
          2: ['Pagi', 'Pagi', 'OFF', 'Pagi', 'Pagi', 'Sore', 'Sore'],
          3: ['Sore', 'Sore', 'Sore', 'Sore', 'OFF', 'Pagi', 'Pagi'],
          4: ['Pagi', 'OFF', 'Closing', 'Sore', 'Pagi', 'Pagi', 'Sore'],
          5: ['Sore', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Sore', 'Pagi']
        },
        swapRequests: [
          { id: 101, requester: 'Dimas Prasetyo', targetSlot: 'Sabtu (25 Jul) - Shift Pagi', dayIdx: 5, reason: 'Ada acara keluarga di sore hari', status: 'Menunggu Approval', stepperStep: 2, isConflict: true },
          { id: 102, requester: 'Siti Rahma', targetSlot: 'Senin (20 Jul) - Cuti Tahunan', dayIdx: 0, reason: 'Kontrol kehamilan', status: 'Disetujui', stepperStep: 3, isConflict: false },
          { id: 103, requester: 'Budi Santoso', targetSlot: 'Rabu (22 Jul) - Shift Sore', dayIdx: 2, reason: 'Tukar shift dengan Rian karena urusan mendadak', status: 'Ditolak', stepperStep: 3, isConflict: true }
        ],
        auditLogs: [
          { timestamp: '09:45 WIB', user: 'System AI', action: 'Shift Auto-Balance', detail: 'Seimbangkan shift malam Sabtu' }
        ],
        okrGoals: [
          { id: 1, employeeId: 1, title: 'Zero Keterlambatan', target: 0, current: 0, unit: 'kali', dueDate: 'Akhir Bulan' },
          { id: 2, employeeId: 1, title: 'Latte Art Positive Reviews', target: 20, current: 14, unit: 'reviews', dueDate: 'Akhir Bulan' },
          { id: 3, employeeId: 2, title: 'Akurasi Kasir 100%', target: 100, current: 99, unit: '%', dueDate: 'Akhir Bulan' },
          { id: 4, employeeId: 3, title: 'Mentoring Junior Barista', target: 4, current: 2, unit: 'sesi', dueDate: 'Minggu Depan' },
          { id: 5, employeeId: 4, title: 'Training Food Safety', target: 100, current: 45, unit: '%', dueDate: 'Akhir Bulan' },
          { id: 6, employeeId: 5, title: 'Pelayanan Cepat < 3 Menit', target: 95, current: 88, unit: '%', dueDate: 'Akhir Bulan' }
        ],
        kudosList: [
          { id: 1, from: 1, to: 2, text: "Makasih banget udah back-up shift saya pas mendadak sakit kemarin! Penyelamat bgt kak!", type: "teamwork", date: "Hari ini" },
          { id: 2, from: 3, to: 4, text: "Latte art makin rapi euy, customer meja 4 tadi sampai muji-muji. Pertahankan!", type: "skill", date: "Kemarin" },
          { id: 3, from: 1, to: 5, text: "Closing super cepat & rapi malam ini. Besok pagi yang buka jadi enak banget.", type: "operational", date: "2 Hari lalu" },
          { id: 4, from: 2, to: 1, text: "Komunikasi ke tim sangat jelas, handling komplain pelanggan tadi siang juga pro banget!", type: "leadership", date: "3 Hari lalu" },
          { id: 5, from: 4, to: 3, text: "Makasih udah ngajarin teknik kalibrasi grinder mesin espresso pagi tadi!", type: "mentorship", date: "4 Hari lalu" },
          { id: 6, from: 5, to: 2, text: "Balance kasir 100% akurat minggu ini, ga ada selisih sama sekali. Keren!", type: "accuracy", date: "Minggu lalu" }
        ]
      })
    }),
    {
      name: 'sokara_hr_store',
      version: 12,
      migrate: (persistedState: any, version: number) => {
        if (version < 12 && persistedState && Array.isArray(persistedState.okrGoals)) {
          persistedState.okrGoals = persistedState.okrGoals.map((g: any, idx: number) => ({
            ...g,
            id: idx + 1,
          }))
        }
        return persistedState
      },
    }
  )
)
