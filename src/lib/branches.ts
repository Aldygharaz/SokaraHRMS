export interface DailyTrafficForecast {
  level: 'Rendah' | 'Sedang' | 'Padat' | 'Sangat Padat'
  score: number // 0-100
  peakTime: string
}

export interface BranchInfo {
  id: string
  name: string
  address: string
  coords: string
  status: string
  staffTarget: string
  trafficStatus: 'normal' | 'rush' | 'understaffed'
  laborCostMultiplier: number
  targetDailyRevenue: number[] // 7 values for Senin..Minggu in IDR
  dailyTrafficForecast: DailyTrafficForecast[] // 7 values for Senin..Minggu
  eventContext: {
    badge: string
    title: string
    description: string
    recommendation: string
  }
}

export const BRANCH_PROFILES: Record<string, BranchInfo> = {
  'Senopati (HQ)': {
    id: 'Senopati (HQ)',
    name: 'Kedai Senopati (HQ)',
    address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    coords: '-6.2289, 106.8021',
    status: 'Operasional Normal',
    staffTarget: '15/15',
    trafficStatus: 'normal',
    laborCostMultiplier: 1.0,
    targetDailyRevenue: [12000000, 11500000, 12500000, 13000000, 18500000, 24000000, 22000000],
    dailyTrafficForecast: [
      { level: 'Sedang', score: 60, peakTime: '12:00 - 14:00' },
      { level: 'Sedang', score: 58, peakTime: '12:00 - 14:00' },
      { level: 'Sedang', score: 65, peakTime: '15:00 - 18:00' },
      { level: 'Padat', score: 75, peakTime: '16:00 - 20:00' },
      { level: 'Sangat Padat', score: 90, peakTime: '18:00 - 22:00 (Acoustic)' },
      { level: 'Sangat Padat', score: 98, peakTime: '16:00 - 23:00 (Konser GBK)' },
      { level: 'Padat', score: 85, peakTime: '07:00 - 12:00 (CFD Sudirman)' }
    ],
    eventContext: {
      badge: 'Senopati HQ',
      title: 'GBK Mega Concert & Weekend CFD Sudirman',
      description: 'Jumat: Cerah 31°C (Acoustic Night) • Sabtu: Hujan 27°C (Konser GBK +40% Trafik) • Minggu: CFD Sudirman (+50% Pagi)',
      recommendation: 'Saran AI: +1 Barista Sore & Siapkan Cold Brew Batch 40L'
    }
  },
  'Kemang': {
    id: 'Kemang',
    name: 'Kedai Kemang',
    address: 'Jl. Kemang Raya No. 18, Mampang Prapatan, Jakarta Selatan',
    coords: '-6.2735, 106.8167',
    status: 'Weekend Rush (Trafik Tinggi)',
    staffTarget: '12/12',
    trafficStatus: 'rush',
    laborCostMultiplier: 0.85,
    targetDailyRevenue: [9500000, 9000000, 10000000, 11000000, 16000000, 21000000, 19000000],
    dailyTrafficForecast: [
      { level: 'Rendah', score: 45, peakTime: '14:00 - 17:00' },
      { level: 'Sedang', score: 50, peakTime: '14:00 - 17:00' },
      { level: 'Sedang', score: 55, peakTime: '15:00 - 19:00' },
      { level: 'Padat', score: 70, peakTime: '16:00 - 21:00' },
      { level: 'Sangat Padat', score: 92, peakTime: '19:00 - 23:30 (Live DJ)' },
      { level: 'Sangat Padat', score: 96, peakTime: '16:00 - 00:00 (Art Bazaar)' },
      { level: 'Padat', score: 80, peakTime: '15:00 - 21:00 (Sunday Chill)' }
    ],
    eventContext: {
      badge: 'Cabang Kemang',
      title: 'Kemang Night Music & Art Bazaar Festival',
      description: 'Jumat: Live DJ Night (+45% Dine-In) • Sabtu: Bazaar Komunitas Kreatif (+60% Takeaway) • Minggu: Chill Sunday',
      recommendation: 'Saran AI: Tambah +1 Kasir & Aktifkan Open Shift Backup Malam'
    }
  },
  'Sudirman': {
    id: 'Sudirman',
    name: 'Kedai Sudirman (SCBD)',
    address: 'SCBD Lot 8, Senayan, Kebayoran Baru, Jakarta Selatan',
    coords: '-6.2250, 106.8080',
    status: 'Kekurangan Staf (-2 Kru)',
    staffTarget: '8/10',
    trafficStatus: 'understaffed',
    laborCostMultiplier: 0.7,
    targetDailyRevenue: [15000000, 15500000, 16000000, 16500000, 17000000, 6000000, 5000000],
    dailyTrafficForecast: [
      { level: 'Sangat Padat', score: 94, peakTime: '07:30 - 09:30 & 11:30 - 14:00' },
      { level: 'Sangat Padat', score: 95, peakTime: '07:30 - 09:30 & 11:30 - 14:00' },
      { level: 'Sangat Padat', score: 96, peakTime: '07:30 - 09:30 & 11:30 - 14:00' },
      { level: 'Sangat Padat', score: 95, peakTime: '07:30 - 09:30 & 11:30 - 14:00' },
      { level: 'Sangat Padat', score: 92, peakTime: '07:30 - 09:30 & 11:30 - 14:00' },
      { level: 'Rendah', score: 30, peakTime: '10:00 - 14:00 (Kantor Tutup)' },
      { level: 'Rendah', score: 25, peakTime: '10:00 - 14:00 (Kantor Tutup)' }
    ],
    eventContext: {
      badge: 'Cabang Sudirman (SCBD)',
      title: 'Corporate Coffee Rush & Lunch Peak Hour',
      description: 'Senin - Jumat: Puncak Antrean Korporat 07:30 - 09:30 & 11:30 - 14:00 • Sabtu - Minggu: Low Traffic',
      recommendation: 'Saran AI: Buka 2 Slot Shift Darurat Barista Pagi (07:00)'
    }
  }
}
