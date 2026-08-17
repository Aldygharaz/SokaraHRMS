export interface BranchInfo {
  id: string
  name: string
  address: string
  coords: string
  status: string
  staffTarget: string
  trafficStatus: 'normal' | 'rush' | 'understaffed'
  laborCostMultiplier: number
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
    eventContext: {
      badge: 'Cabang Sudirman (SCBD)',
      title: 'Corporate Coffee Rush & Lunch Peak Hour',
      description: 'Senin - Jumat: Puncak Antrean Korporat 07:30 - 09:30 & 11:30 - 14:00 • Sabtu - Minggu: Low Traffic',
      recommendation: 'Saran AI: Buka 2 Slot Shift Darurat Barista Pagi (07:00)'
    }
  }
}
