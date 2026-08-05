// Sokara HR Management - Multi-Role RBAC Portal (20-Pass Master Kaizen Engine)

const STORAGE_KEY = 'sokara_app_state_v2';

const DEFAULT_INITIAL_STATE = {
  activeTab: 'dashboard',
  activeRole: 'manager', // 'manager' | 'karyawan'
  activeEmployeeId: 1,   // Logged-in employee in Karyawan mode: Dimas Prasetyo
  activeBranch: 'Senopati (HQ)',
  filterMyShiftsOnly: false,
  theme: localStorage.getItem('sokara_theme') || 'light',
  soundEnabled: localStorage.getItem('sokara_sound') !== 'false',

  terRates: {
    A: 0.25,
    B: 1.50,
    C: 2.25
  },

  employees: [
    { id: 1, name: 'Dimas Prasetyo', role: 'Head Barista', dept: 'Bar', rating: 4.9, punctuality: 98, skills: ['Senior Barista', 'Opening Lead'], ptkp: 'K/1', kat: 'B', baseSalary: 5500000, rate: 31250, nightShiftsMonth: 2, overtimeHours: 4, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwyBcUZScQ83Nq3o598I2kDq6PT3SKgnuQl_OXPt1KACSyg0g3z-4O6ErmJN2e4NjvQbkFCb7DSyL9l2UgNrmfVOWRj89xG5zTNaAuSqr6baaaFfV4u-e7GZ3JUJGXyHvxPSRr8Sekif9r_eNQDc2cZNj7nsu-9NokJUFkgidtKx8127yWVQrjhrm6Vblj8AH5AJ16Q4YVjxG7taGIXOtaR6D6RwDsGYRwsRoAIji3-CetINlkXk' },
    { id: 2, name: 'Siti Rahma', role: 'Kasir Senior', dept: 'Front', rating: 4.8, punctuality: 96, skills: ['Kasir Senior', 'POS Master'], ptkp: 'TK/1', kat: 'A', baseSalary: 4800000, rate: 27270, nightShiftsMonth: 4, overtimeHours: 2, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBwt58-mWc71tS5riU9IdSU_g0_HzlOe6jrEvdgya-gjiX5jn9StUqY9REwAPuCQDQOtCF17JHpreyraLpc47I6NdrJ83B3-Mu4yd0RjV2IeOXVyMzYH8XR_YCoMV6tuq3VsqhC4q9RXn4uzFwYrsMWYFcN40-YaolEXny-sYUG7P5Z7mCKqogoFRGQmbW9h0gnWz5L7b7ZyXNh9BRrj399IhAuyracHv2BhOt1L3lTu2ZHgUEeew' },
    { id: 3, name: 'Budi Santoso', role: 'Senior Barista', dept: 'Bar', rating: 4.7, punctuality: 99, skills: ['Senior Barista', 'Latte Art'], ptkp: 'TK/0', kat: 'A', baseSalary: 5000000, rate: 28400, nightShiftsMonth: 1, overtimeHours: 1, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp9qz8IPJe1fvn4KeLgS2G3Fuqah6CRd78t10rkIltGN3tNI-bDtB46Cx113yC8pl_9VEAte71XlRzTkqH99b35uHJ_5N0FVYLCg19VvReWVhVS42KoHD7a9rkWNteignZw_iHROaQJpMZmUDUFHRxitoRe74LfBvA4PAYx_n7xOWI3pp28R3dhOspmSli3OE7Ce36bmlIyYeH7KdPa-KvgS0YbLK4K8hFdk3SUqs9gS6tJxuKUUk' },
    { id: 4, name: 'Rian Kurniawan', role: 'Barista Junior', dept: 'Bar', rating: 4.5, punctuality: 94, skills: ['Barista'], ptkp: 'TK/0', kat: 'A', baseSalary: 4200000, rate: 23860, nightShiftsMonth: 6, overtimeHours: 8, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjvsUTtQdFtrKmreQNid6IEsVHUPgwy-_b266BKvXxebvRPdXsyj0R92v8HLiz_IG3FG4f0LLOZzOpoD9cMGdEGtpPFjTmVT6jX7041Sc8iay7ICq85PVZR-rVSvMDnKocBfdm0b5mn7IczUoVuTgJcGEGdkyWBYMxBM4d6wdBN9unk_Sa0t8E49DBphsKxz6lqGSbdmjZh7r40A44qkNaCicdrDGRyjzq1jTT6BBiWdFLEuzW4vA' },
    { id: 5, name: 'Dewi Lestari', role: 'Kasir', dept: 'Front', rating: 4.6, punctuality: 97, skills: ['Kasir'], ptkp: 'TK/0', kat: 'A', baseSalary: 4300000, rate: 24430, nightShiftsMonth: 3, overtimeHours: 3, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0sCl1THjXHQKlRiYh1DQvNRRzJk3XbWTKCscFZ7abQN2F0v6i7T2b-FaMDBocKlTTj8nEw3icPPXXMQ6Z5ifS3_VXszm2_QJvJEd9Re7VrH_al3fZ3IOCViGyCMMUnefPB73gps7cshYhf99PobRFe7DO-1OLmQZJWc5O_zKVlNqRsXX8VzCWxZB9dSy8QG1jPJyhvVN4N1W597IndxZjTinb6-DONi3Vy3cRLJ57358uny3BNro' },
    { id: 6, name: 'Andi Wijaya', role: 'Kitchen Staff', dept: 'Kitchen', rating: 4.8, punctuality: 95, skills: ['Kitchen Lead', 'Hot Food'], ptkp: 'K/0', kat: 'A', baseSalary: 4500000, rate: 25560, nightShiftsMonth: 5, overtimeHours: 5, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhcrWB3dlfcGRPJ3Odj1DEwFago2S4ohA1OAtCJH8_q9hwyoslKGbc2aqVl-yXszyTFDBIG07zOukwA4SGXm39yA3o5WrANCO9qyvSceRkcv2AlChS5rF-Udz0iMcOT4sg7HgqcnbcIbwyVg-wtMcRIPgRhRqbJ5Teo-ZrgAzIVOFO4AdAdnDk6DBb7qsaOOzITXv64npifmzggpMETmtehfrJlopDjargKxQgr511N87N2f4uago' },
    { id: 7, name: 'Sarah Amalia', role: 'Kitchen Staff', dept: 'Kitchen', rating: 4.9, punctuality: 98, skills: ['Pastry Specialist'], ptkp: 'TK/1', kat: 'A', baseSalary: 4400000, rate: 25000, nightShiftsMonth: 2, overtimeHours: 2, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqsh2fjO3Ftd_OTkZ6PG89xSAiXwKq-EkRzA2xiFlTuNFNmG_fza1UNG5Z0UR733ALmLmp7eT33UXa23vv5PkbVsr3vENVpvTKtUgGoX9djZggykVBTZbPVetA71QUORQ-SDMRAMrx-zz2YQgFnJ9pkHwUcCXHdZI-XYO9B-FarpFzc4wlHB9pUdTbTDrj0f-KnhcNBuxKR9eJG2bLfOZUnPwDytVbvKduQJegQDMKSm4bvONoqlc' },
    { id: 8, name: 'Eko Yulianto', role: 'Sanitation', dept: 'Facility', rating: 4.6, punctuality: 92, skills: ['Sanitation Lead'], ptkp: 'K/2', kat: 'B', baseSalary: 3900000, rate: 22150, nightShiftsMonth: 7, overtimeHours: 9, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwyBcUZScQ83Nq3o598I2kDq6PT3SKgnuQl_OXPt1KACSyg0g3z-4O6ErmJN2e4NjvQbkFCb7DSyL9l2UgNrmfVOWRj89xG5zTNaAuSqr6baaaFfV4u-e7GZ3JUJGXyHvxPSRr8Sekif9r_eNQDc2cZNj7nsu-9NokJUFkgidtKx8127yWVQrjhrm6Vblj8AH5AJ16Q4YVjxG7taGIXOtaR6D6RwDsGYRwsRoAIji3-CetINlkXk' },
    { id: 9, name: 'Fajar Nugroho', role: 'Sanitation', dept: 'Facility', rating: 4.5, punctuality: 96, skills: ['Sanitation'], ptkp: 'TK/0', kat: 'A', baseSalary: 3900000, rate: 22150, nightShiftsMonth: 4, overtimeHours: 3, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBwt58-mWc71tS5riU9IdSU_g0_HzlOe6jrEvdgya-gjiX5jn9StUqY9REwAPuCQDQOtCF17JHpreyraLpc47I6NdrJ83B3-Mu4yd0RjV2IeOXVyMzYH8XR_YCoMV6tuq3VsqhC4q9RXn4uzFwYrsMWYFcN40-YaolEXny-sYUG7P5Z7mCKqogoFRGQmbW9h0gnWz5L7b7ZyXNh9BRrj399IhAuyracHv2BhOt1L3lTu2ZHgUEeew' },
    { id: 10, name: 'Maya Putri', role: 'Barista Junior', dept: 'Bar', rating: 4.7, punctuality: 97, skills: ['Barista'], ptkp: 'TK/0', kat: 'A', baseSalary: 4100000, rate: 23290, nightShiftsMonth: 3, overtimeHours: 2, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0sCl1THjXHQKlRiYh1DQvNRRzJk3XbWTKCscFZ7abQN2F0v6i7T2b-FaMDBocKlTTj8nEw3icPPXXMQ6Z5ifS3_VXszm2_QJvJEd9Re7VrH_al3fZ3IOCViGyCMMUnefPB73gps7cshYhf99PobRFe7DO-1OLmQZJWc5O_zKVlNqRsXX8VzCWxZB9dSy8QG1jPJyhvVN4N1W597IndxZjTinb6-DONi3Vy3cRLJ57358uny3BNro' },
    { id: 11, name: 'Reza Pratama', role: 'Inventory Officer', dept: 'Stock', rating: 4.8, punctuality: 99, skills: ['Stock Control'], ptkp: 'TK/2', kat: 'B', baseSalary: 4700000, rate: 26700, nightShiftsMonth: 1, overtimeHours: 1, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjvsUTtQdFtrKmreQNid6IEsVHUPgwy-_b266BKvXxebvRPdXsyj0R92v8HLiz_IG3FG4f0LLOZzOpoD9cMGdEGtpPFjTmVT6jX7041Sc8iay7ICq85PVZR-rVSvMDnKocBfdm0b5mn7IczUoVuTgJcGEGdkyWBYMxBM4d6wdBN9unk_Sa0t8E49DBphsKxz6lqGSbdmjZh7r40A44qkNaCicdrDGRyjzq1jTT6BBiWdFLEuzW4vA' },
    { id: 12, name: 'Indah Kusuma', role: 'Social Media & Host', dept: 'Marketing', rating: 4.9, punctuality: 98, skills: ['Customer Host'], ptkp: 'TK/0', kat: 'A', baseSalary: 4600000, rate: 26130, nightShiftsMonth: 2, overtimeHours: 2, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0sCl1THjXHQKlRiYh1DQvNRRzJk3XbWTKCscFZ7abQN2F0v6i7T2b-FaMDBocKlTTj8nEw3icPPXXMQ6Z5ifS3_VXszm2_QJvJEd9Re7VrH_al3fZ3IOCViGyCMMUnefPB73gps7cshYhf99PobRFe7DO-1OLmQZJWc5O_zKVlNqRsXX8VzCWxZB9dSy8QG1jPJyhvVN4N1W597IndxZjTinb6-DONi3Vy3cRLJ57358uny3BNro' },
    { id: 13, name: 'Hendra Gunawan', role: 'Head Chef', dept: 'Kitchen', rating: 5.0, punctuality: 100, skills: ['Kitchen Lead', 'Menu Dev'], ptkp: 'K/3', kat: 'C', baseSalary: 6200000, rate: 35220, nightShiftsMonth: 3, overtimeHours: 4, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhcrWB3dlfcGRPJ3Odj1DEwFago2S4ohA1OAtCJH8_q9hwyoslKGbc2aqVl-yXszyTFDBIG07zOukwA4SGXm39yA3o5WrANCO9qyvSceRkcv2AlChS5rF-Udz0iMcOT4sg7HgqcnbcIbwyVg-wtMcRIPgRhRqbJ5Teo-ZrgAzIVOFO4AdAdnDk6DBb7qsaOOzITXv64npifmzggpMETmtehfrJlopDjargKxQgr511N87N2f4uago' },
    { id: 14, name: 'Nadia Safitri', role: 'Supervisor Store', dept: 'Operations', rating: 4.9, punctuality: 99, skills: ['Opening Lead', 'Store Manager'], ptkp: 'K/1', kat: 'B', baseSalary: 6500000, rate: 36930, nightShiftsMonth: 2, overtimeHours: 3, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqsh2fjO3Ftd_OTkZ6PG89xSAiXwKq-EkRzA2xiFlTuNFNmG_fza1UNG5Z0UR733ALmLmp7eT33UXa23vv5PkbVsr3vENVpvTKtUgGoX9djZggykVBTZbPVetA71QUORQ-SDMRAMrx-zz2YQgFnJ9pkHwUcCXHdZI-XYO9B-FarpFzc4wlHB9pUdTbTDrj0f-KnhcNBuxKR9eJG2bLfOZUnPwDytVbvKduQJegQDMKSm4bvONoqlc' },
    { id: 15, name: 'Toni Hidayat', role: 'Security Guard', dept: 'Facility', rating: 4.6, punctuality: 93, skills: ['Security'], ptkp: 'TK/1', kat: 'A', baseSalary: 3800000, rate: 21590, nightShiftsMonth: 8, overtimeHours: 10, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwyBcUZScQ83Nq3o598I2kDq6PT3SKgnuQl_OXPt1KACSyg0g3z-4O6ErmJN2e4NjvQbkFCb7DSyL9l2UgNrmfVOWRj89xG5zTNaAuSqr6baaaFfV4u-e7GZ3JUJGXyHvxPSRr8Sekif9r_eNQDc2cZNj7nsu-9NokJUFkgidtKx8127yWVQrjhrm6Vblj8AH5AJ16Q4YVjxG7taGIXOtaR6D6RwDsGYRwsRoAIji3-CetINlkXk' }
  ],

  shifts: {
    1: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'OFF'],
    2: ['Pagi', 'Pagi', 'OFF', 'Pagi', 'Pagi', 'Sore', 'Sore'],
    3: ['Sore', 'Sore', 'Sore', 'Sore', 'OFF', 'Pagi', 'Pagi'],
    4: ['Pagi', 'OFF', 'Closing', 'Sore', 'Pagi', 'Pagi', 'Sore'],
    5: ['Sore', 'Pagi', 'Pagi', 'OFF', 'Sore', 'Sore', 'Pagi'],
    6: ['Pagi', 'Sore', 'Sore', 'Pagi', 'Pagi', 'OFF', 'Sore'],
    7: ['OFF', 'Pagi', 'Pagi', 'Sore', 'Sore', 'Pagi', 'Pagi'],
    8: ['Closing', 'Closing', 'OFF', 'Closing', 'Closing', 'OFF', 'Closing'],
    9: ['OFF', 'Closing', 'Closing', 'OFF', 'Closing', 'Closing', 'OFF'],
    10: ['Pagi', 'Sore', 'Pagi', 'Sore', 'OFF', 'Pagi', 'EMPTY'],
    11: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Pagi', 'OFF', 'OFF'],
    12: ['Sore', 'Sore', 'Sore', 'OFF', 'Pagi', 'Pagi', 'OFF'],
    13: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'OFF', 'Pagi', 'Pagi'],
    14: ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Pagi', 'Pagi', 'OFF'],
    15: ['Closing', 'Closing', 'Closing', 'Closing', 'Closing', 'Closing', 'OFF']
  },

  swapRequests: [
    {
      id: 101,
      requester: 'Dimas Prasetyo',
      targetSlot: 'Sabtu (25 Jul) - Shift Pagi',
      dayIdx: 5,
      reason: 'Ada acara keluarga di sore hari',
      status: 'Menunggu Approval',
      stepperStep: 2,
      isConflict: true
    },
    {
      id: 102,
      requester: 'Budi Santoso',
      targetSlot: 'Sabtu (25 Jul) - Shift Pagi',
      dayIdx: 5,
      reason: 'Menggantikan jadwal maya',
      status: 'Menunggu Approval',
      stepperStep: 2,
      isConflict: true
    },
    {
      id: 103,
      requester: 'Dewi Lestari',
      targetSlot: 'Minggu (26 Jul) - Shift Sore',
      dayIdx: 6,
      reason: 'Tukar dengan Siti Rahma',
      status: 'Disetujui',
      stepperStep: 3,
      isConflict: false
    }
  ],

  auditLogs: [
    { timestamp: '09:45 WIB', user: 'System AI', action: 'Shift Auto-Balance', detail: 'Seimbangkan shift malam Sabtu untuk mengurangi biaya lembur' },
    { timestamp: '09:30 WIB', user: 'Dimas Prasetyo', action: 'Create Swap Request', detail: 'Mengajukan swap shift Sabtu (25 Jul)' },
    { timestamp: '09:00 WIB', user: 'Manager Store', action: 'System Login', detail: 'Session aktif di Kedai Senopati (HQ)' }
  ]
};

// Load state from localStorage or initialize
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

let state = loadState();
let activeFatigueEmpId = null;
let activeFatigueDayIdx = null;

document.addEventListener('DOMContentLoaded', () => {
  setupThemeEngine();
  setupAudioEngine();
  setupSidebarToggle();
  setupMicroInteractions();
  setupKeyboardShortcuts();
  setupBranchSelector();
  setupAuditLogModal();
  setupCSVExporter();
  setupAnomalyResolver();
  setupAutoFillShifts();
  setupNavigation();
  setupRoleSwitcher();
  setupKaryawanActionHub();
  setupFabWidget();
  setupFilterListeners();
  setupPresetFilterChips();
  setupBatchApproval();
  setupShiftCostPreview();
  setupModals();
  setupEmployeeCRUD();
  setupShiftCRUD();
  setupSwapCRUD();
  setupLogoutReset();
  
  // Offline-First Logic
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus(); // init

  renderAllViews();
  animateEntrance('.tab-view.active');
});

// Sound Chime Synthesizer
function playUiSound(type = 'click') {
  if (!state.soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {}
}

function setupAudioEngine() {
  const btnSound = document.getElementById('btn-sound-toggle');
  const iconSound = document.getElementById('sound-toggle-icon');

  btnSound?.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('sokara_sound', state.soundEnabled);
    saveState();
    if (iconSound) iconSound.textContent = state.soundEnabled ? 'volume_up' : 'volume_off';
    showToast(state.soundEnabled ? '🔔 Efek Suara UI: AKTIF' : '🔕 Efek Suara UI: DIBISUKAN');
    if (state.soundEnabled) playUiSound('success');
  });
}

function addAuditLog(action, detail) {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  const logItem = {
    timestamp: timeStr,
    user: state.activeRole === 'manager' ? 'Manager Store' : 'Karyawan (Dimas)',
    action,
    detail
  };
  state.auditLogs.unshift(logItem);
  saveState();
  renderAuditLogs();
}

function renderAuditLogs() {
  const container = document.getElementById('audit-log-list');
  if (!container) return;

  container.innerHTML = state.auditLogs.map(log => `
    <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-on-surface text-xs font-heading">${log.action}</span>
          <span class="px-2 py-0.5 rounded bg-surface-container-high text-semantic-neutral font-bold text-[10px]">${log.user}</span>
        </div>
        <p class="text-xs text-on-surface-variant font-medium mt-0.5">${log.detail}</p>
      </div>
      <span class="text-[10px] font-mono text-on-surface-variant whitespace-nowrap">${log.timestamp}</span>
    </div>
  `).join('');
}

function setupAuditLogModal() {
  const btn = document.getElementById('btn-open-audit-log');
  const modal = document.getElementById('modal-audit-log');
  btn?.addEventListener('click', () => {
    renderAuditLogs();
    modal?.classList.add('show');
    playUiSound('click');
  });
}

function setupCSVExporter() {
  const btn = document.getElementById('btn-export-csv');
  btn?.addEventListener('click', () => {
    playUiSound('success');
    let csvContent = 'data:text/csv;charset=utf-8,ID,Nama Karyawan,Peran,Departemen,Gaji Pokok,Rate Jam,PTKP,TER Kat\n';
    state.employees.forEach(e => {
      csvContent += `${e.id},"${e.name}","${e.role}","${e.dept}",${e.baseSalary},${e.rate},"${e.ptkp}","${e.kat}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sokara_employees_${state.activeBranch.toLowerCase().replace(/[^a-z]/g, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addAuditLog('Export Data CSV', `Ekspor data karyawan cabang ${state.activeBranch}`);
    showToast(`📄 Data CSV berhasil di-download!`);
  });
}

function setupKeyboardShortcuts() {
  const btnOpenShortcuts = document.getElementById('btn-open-shortcuts');
  const modalShortcuts = document.getElementById('modal-shortcuts');

  btnOpenShortcuts?.addEventListener('click', () => {
    modalShortcuts?.classList.add('show');
    playUiSound('click');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const empBtn = document.querySelector('.nav-btn[data-tab="employees"]');
      empBtn?.click();
      setTimeout(() => document.getElementById('search-employee-input')?.focus(), 150);
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      document.getElementById('btn-hero-suggest-trigger')?.click();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      document.getElementById('btn-theme-toggle')?.click();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      document.getElementById('btn-reset-calendar-filters')?.click();
    }
  });
}

function setupBranchSelector() {
  const select = document.getElementById('branch-select');
  const badge = document.getElementById('header-branch-badge');

  select?.addEventListener('change', (e) => {
    state.activeBranch = e.target.value;
    saveState();
    playUiSound('click');

    const branchStats = {
      'Senopati (HQ)': 'Kedai Senopati (HQ) • Operasional Normal (15/15 Staff)',
      'Bandung - Dago': 'Kedai Bandung (Dago) • Operasional Normal (12/12 Staff)',
      'Surabaya - Gubeng': 'Kedai Surabaya (Gubeng) • Operasional Normal (8/8 Staff)'
    };

    if (badge) {
      badge.innerHTML = `<span class="pulse-dot"></span><span>${branchStats[state.activeBranch] || state.activeBranch}</span>`;
    }

    addAuditLog('Ganti Cabang', `Beralih ke cabang ${state.activeBranch}`);
    showToast(`📍 Switched to ${state.activeBranch}`);
    renderAllViews();
  });
}

function setupAnomalyResolver() {
  const btn = document.getElementById('btn-resolve-anomaly');
  const drawer = document.getElementById('anomaly-detail-drawer');

  btn?.addEventListener('click', () => {
    playUiSound('success');
    drawer?.classList.toggle('hidden');

    [1, 2, 3, 4, 5].forEach(id => {
      if (state.shifts[id]) {
        state.shifts[id][5] = 'Pagi';
        state.shifts[id][6] = 'OFF';
      }
    });

    saveState();
    renderAllViews();
    addAuditLog('AI Anomaly Resolved', 'Re-distribusi shift malam Sabtu untuk efisiensi lembur 23%');
    showToast('✨ Anomaly Resolved: Biaya lembur berhasil di-seimbangkan!');
  });
}

function setupAutoFillShifts() {
  const btn = document.getElementById('btn-auto-fill-shifts');
  btn?.addEventListener('click', () => {
    playUiSound('success');
    state.employees.forEach(emp => {
      const empShifts = state.shifts[emp.id] || [];
      for (let i = 0; i < 7; i++) {
        if (empShifts[i] === 'EMPTY') {
          empShifts[i] = (i % 2 === 0) ? 'Pagi' : 'Sore';
        }
      }
    });

    saveState();
    renderAllViews();
    addAuditLog('Auto-Fill Shifts', 'Jadwal 5 hari kerja terisi otomatis secara adil');
    showToast('✨ Seluruh slot kosong berhasil di-fill secara adil!');
  });
}

// Multi-Dimensional Filter Event Listeners
function setupFilterListeners() {
  document.getElementById('filter-calendar-role')?.addEventListener('change', renderCalendarGrid);
  document.getElementById('filter-calendar-shifttype')?.addEventListener('change', renderCalendarGrid);
  document.getElementById('filter-calendar-search')?.addEventListener('input', renderCalendarGrid);
  document.getElementById('chk-my-shifts-only')?.addEventListener('change', (e) => {
    state.filterMyShiftsOnly = e.target.checked;
    saveState();
    renderCalendarGrid();
  });

  document.getElementById('btn-reset-calendar-filters')?.addEventListener('click', () => {
    playUiSound('click');
    const roleSel = document.getElementById('filter-calendar-role');
    const typeSel = document.getElementById('filter-calendar-shifttype');
    const searchInp = document.getElementById('filter-calendar-search');

    if (roleSel) roleSel.value = 'ALL';
    if (typeSel) typeSel.value = 'ALL';
    if (searchInp) searchInp.value = '';

    const container = document.getElementById('preset-filter-chips');
    container?.querySelectorAll('.preset-chip').forEach(c => {
      c.classList.remove('active', 'bg-accent-primary', 'text-white');
      c.classList.add('bg-surface-container-high', 'text-on-surface');
      if (c.getAttribute('data-preset') === 'ALL') {
        c.classList.add('active', 'bg-accent-primary', 'text-white');
        c.classList.remove('bg-surface-container-high', 'text-on-surface');
      }
    });

    renderCalendarGrid();
    showToast('🔄 Filter Kalender berhasil di-reset!');
  });

  document.getElementById('btn-print-calendar')?.addEventListener('click', () => {
    playUiSound('success');
    addAuditLog('Print Shift Roster', `Mencetak roster shift mingguan cabang ${state.activeBranch}`);
    window.print();
  });

  document.getElementById('filter-attendance-status')?.addEventListener('change', renderAttendanceTable);
  document.getElementById('filter-swap-status')?.addEventListener('change', renderApprovalFlow);
  document.getElementById('filter-payroll-terkat')?.addEventListener('change', renderPayrollTable);
  document.getElementById('filter-emp-dept')?.addEventListener('change', renderEmployeeTable);
  document.getElementById('filter-emp-rating')?.addEventListener('change', renderEmployeeTable);
  document.getElementById('search-employee-input')?.addEventListener('input', renderEmployeeTable);
}

// 1-Click Preset Filter Chips
function setupPresetFilterChips() {
  const container = document.getElementById('preset-filter-chips');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.preset-chip');
    if (!chip) return;

    playUiSound('click');
    container.querySelectorAll('.preset-chip').forEach(c => {
      c.classList.remove('active', 'bg-accent-primary', 'text-white');
      c.classList.add('bg-surface-container-high', 'text-on-surface');
    });

    chip.classList.add('active', 'bg-accent-primary', 'text-white');
    chip.classList.remove('bg-surface-container-high', 'text-on-surface');

    const preset = chip.getAttribute('data-preset');
    const roleSelect = document.getElementById('filter-calendar-role');
    const typeSelect = document.getElementById('filter-calendar-shifttype');

    if (preset === 'ALL') {
      if (roleSelect) roleSelect.value = 'ALL';
      if (typeSelect) typeSelect.value = 'ALL';
    } else if (preset === 'Barista') {
      if (roleSelect) roleSelect.value = 'Barista';
      if (typeSelect) typeSelect.value = 'ALL';
    } else if (preset === 'Pagi') {
      if (roleSelect) roleSelect.value = 'ALL';
      if (typeSelect) typeSelect.value = 'Pagi';
    } else if (preset === 'Sore') {
      if (roleSelect) roleSelect.value = 'ALL';
      if (typeSelect) typeSelect.value = 'Sore';
    } else if (preset === 'EMPTY') {
      if (roleSelect) roleSelect.value = 'ALL';
      if (typeSelect) typeSelect.value = 'EMPTY';
    }

    renderCalendarGrid();
  });
}

function setupBatchApproval() {
  const btnBatch = document.getElementById('btn-batch-approve-swaps');
  btnBatch?.addEventListener('click', () => {
    if (state.activeRole === 'karyawan') {
      showToast('⚠️ Hanya Manager yang dapat menyetujui request swap.');
      return;
    }

    playUiSound('success');
    let approvedCount = 0;
    state.swapRequests.forEach(req => {
      if (req.status === 'Menunggu Approval' && !req.isConflict) {
        req.status = 'Disetujui';
        req.stepperStep = 3;
        approvedCount++;
      }
    });

    saveState();
    renderAllViews();
    addAuditLog('Batch Approve Swaps', `Manager menyetujui ${approvedCount} pengajuan swap valid sekaligus`);
    showToast(`✅ Batch Approve: ${approvedCount} request swap valid berhasil disetujui!`);
  });
}

function setupShiftCostPreview() {
  const select = document.getElementById('edit-shift-type-select');
  const impactText = document.getElementById('shift-impact-text');

  select?.addEventListener('change', () => {
    const val = select.value;
    if (!impactText) return;

    if (val === 'Closing') {
      impactText.textContent = '+Rp 62.500 Overtime Rate (Night Shift Allowance)';
    } else if (val === 'Sore') {
      impactText.textContent = '+Rp 25.000 Peak Evening Rate';
    } else if (val === 'Pagi') {
      impactText.textContent = 'Standard Shift Rate (Rp 0 OT)';
    } else {
      impactText.textContent = 'OFF / Libur (Tanpa Beban Biaya Shift)';
    }
  });
}

// Floating Action Button (FAB) Widget Engine
function setupFabWidget() {
  const widget = document.getElementById('fab-widget');
  const mainBtn = document.getElementById('fab-main-btn');
  const btnSwap = document.getElementById('fab-action-swap');
  const btnSuggest = document.getElementById('fab-action-suggest');
  const btnPresensi = document.getElementById('fab-action-presensi');

  mainBtn?.addEventListener('click', () => {
    playUiSound('click');
    widget?.classList.toggle('open');
  });

  btnSwap?.addEventListener('click', () => {
    widget?.classList.remove('open');
    populateSwapRequesterOptions();
    document.getElementById('modal-add-swap')?.classList.add('show');
  });

  btnSuggest?.addEventListener('click', () => {
    widget?.classList.remove('open');
    openSmartSuggestionModal('Sabtu (25 Jul)', 'Shift Sore (15:00-23:00)', 10);
  });

  btnPresensi?.addEventListener('click', () => {
    widget?.classList.remove('open');
    playUiSound('success');
    addAuditLog('Presensi Tap Masuk', 'Presensi cepat via Floating Action Button');
    showToast('📍 Presensi Berhasil! Tap Masuk dicatat pukul 06:52 WIB (On-Time)');
  });
}

// Interactive Karyawan Action Hub
function setupKaryawanActionHub() {
  const btnTap = document.getElementById('btn-karyawan-tap-presensi');
  const btnSwap = document.getElementById('btn-karyawan-request-swap');
  const btnSlip = document.getElementById('btn-karyawan-view-payslip');

  btnTap?.addEventListener('click', () => {
    playUiSound('success');
    addAuditLog('Presensi Tap Masuk', 'Dimas Prasetyo tap presensi masuk (GPS In-Range)');
    showToast('📍 Presensi Berhasil! Tap Masuk dicatat pukul 06:52 WIB (On-Time)');
  });

  btnSwap?.addEventListener('click', () => {
    playUiSound('click');
    populateSwapRequesterOptions();
    document.getElementById('modal-add-swap')?.classList.add('show');
  });

  btnSlip?.addEventListener('click', () => {
    playUiSound('click');
    const emp = state.employees.find(e => e.id === state.activeEmployeeId) || state.employees[0];
    const bruto = emp.baseSalary + 187500;
    const terRate = state.terRates[emp.kat] || 1.5;
    const bpjs = Math.round(bruto * 0.03);
    const pph21 = Math.round(bruto * (terRate / 100));
    const thp = bruto - bpjs - pph21;

    window.openPaySlip(emp.id, bruto, 187500, bpjs, pph21, thp, 4);
  });
}

function setupThemeEngine() {
  const html = document.documentElement;
  const btnToggle = document.getElementById('btn-theme-toggle');
  const iconToggle = document.getElementById('theme-toggle-icon');
  const labelToggle = document.getElementById('theme-toggle-label');

  function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('sokara_theme', theme);
    saveState();

    if (theme === 'light') {
      html.classList.add('light');
      html.classList.remove('dark');
      if (iconToggle) iconToggle.textContent = 'dark_mode';
      if (labelToggle) labelToggle.textContent = 'Mode Gelap';
    } else {
      html.classList.add('dark');
      html.classList.remove('light');
      if (iconToggle) iconToggle.textContent = 'light_mode';
      if (labelToggle) labelToggle.textContent = 'Mode Terang';
    }
  }

  applyTheme(state.theme);

  btnToggle?.addEventListener('click', () => {
    playUiSound('click');
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    addAuditLog('Ganti Tema', `Beralih ke ${newTheme === 'light' ? 'Mode Terang' : 'Mode Gelap'}`);
    showToast(`✨ Switched to ${newTheme === 'light' ? 'Mode Terang' : 'Mode Gelap'}`);
  });
}

function setupSidebarToggle() {
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const isCollapsed = localStorage.getItem('sokara_sidebar_collapsed') === 'true';

  if (isCollapsed) {
    document.body.classList.add('sidebar-collapsed');
  }

  btnToggleSidebar?.addEventListener('click', () => {
    playUiSound('click');
    const isNowCollapsed = document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sokara_sidebar_collapsed', isNowCollapsed);
  });
}

function setupMicroInteractions() {
  document.addEventListener('mousemove', (e) => {
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    spotlightCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && 
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.zIndex = "10";
      } else {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.zIndex = "1";
      }
    });
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .shift-card');
    if (!btn) return;

    playUiSound('click');

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

function animateEntrance(containerSelector) {
  if (typeof anime === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  anime({
    targets: `${containerSelector} .glass-panel`,
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(50),
    duration: 450,
    easing: 'easeOutQuad'
  });
}

function renderAllViews() {
  renderMetrics();
  renderCalendarGrid();
  renderAttendanceTable();
  renderApprovalFlow();
  renderPayrollTable();
  renderEmployeeTable();
  populateSwapRequesterOptions();
}

function renderMetrics() {
  const headcountEl = document.getElementById('counter-headcount');
  const capLabel = document.getElementById('label-capacity-percent');
  const capBar = document.getElementById('bar-capacity');
  const shiftsCountEl = document.getElementById('counter-shifts');
  const labelTargetShifts = document.getElementById('label-target-shifts');
  const labelShiftStatus = document.getElementById('label-shift-status');
  const barShiftsFilled = document.getElementById('bar-shifts-filled');
  const barShiftsEmpty = document.getElementById('bar-shifts-empty');

  const count = state.employees.length;
  const capacity = Math.min(100, Math.round((count / 20) * 100));

  if (headcountEl) headcountEl.textContent = count;
  if (capLabel) capLabel.textContent = `${capacity}%`;
  if (capBar) capBar.style.width = `${capacity}%`;

  let filledShifts = 0;
  Object.values(state.shifts).forEach(empShifts => {
    empShifts.forEach(shift => {
      if (shift !== 'OFF' && shift !== 'EMPTY') filledShifts++;
    });
  });

  const targetShifts = count * 5;
  const shiftFulfillmentPercent = targetShifts > 0 ? Math.min(100, Math.round((filledShifts / targetShifts) * 100)) : 0;

  if (shiftsCountEl) shiftsCountEl.textContent = filledShifts;
  if (labelTargetShifts) labelTargetShifts.textContent = `/ ${targetShifts} Slot`;
  if (labelShiftStatus) labelShiftStatus.textContent = `${shiftFulfillmentPercent >= 90 ? 'Optimum' : 'Butuh Tambahan'} (${shiftFulfillmentPercent}%)`;
  if (barShiftsFilled) barShiftsFilled.style.width = `${shiftFulfillmentPercent}%`;
  if (barShiftsEmpty) barShiftsEmpty.style.width = `${100 - shiftFulfillmentPercent}%`;

  if (typeof anime !== 'undefined' && headcountEl) {
    anime({
      targets: headcountEl,
      innerHTML: [0, count],
      round: 1,
      easing: 'easeInOutExpo',
      duration: 800
    });
  }
}

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-tab');
      if (!targetTab) return;

      state.activeTab = targetTab;
      saveState();

      navButtons.forEach(b => {
        if (b.getAttribute('data-tab') === targetTab) {
          b.classList.add('active', 'text-accent-primary');
          b.classList.remove('text-on-surface-variant');
        } else {
          b.classList.remove('active', 'text-accent-primary');
          b.classList.add('text-on-surface-variant');
        }
      });

      document.querySelectorAll('.tab-view').forEach(view => {
        if (view.id === `view-${targetTab}`) {
          view.classList.add('active');
          animateEntrance(`#view-${targetTab}`);
        } else {
          view.classList.remove('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function setupRoleSwitcher() {
  const btnManager = document.getElementById('role-btn-manager');
  const btnEmployee = document.getElementById('role-btn-employee');
  const greetingTitle = document.getElementById('dash-greeting-title');
  const greetingSubtitle = document.getElementById('dash-greeting-subtitle');

  btnManager?.addEventListener('click', () => {
    state.activeRole = 'manager';
    saveState();

    btnManager.classList.add('active', 'text-accent-primary', 'bg-surface-container-high');
    btnManager.classList.remove('text-on-surface-variant');
    btnEmployee.classList.remove('active', 'text-accent-primary', 'bg-surface-container-high');
    btnEmployee.classList.add('text-on-surface-variant');

    document.querySelectorAll('.manager-only').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.karyawan-only').forEach(el => el.classList.add('hidden'));

    if (greetingTitle) greetingTitle.textContent = '"Bayangkan kamu owner kedai kopi dengan 15 karyawan, dan setiap minggu pusing atur siapa shift kapan..."';
    if (greetingSubtitle) greetingSubtitle.innerHTML = 'Sistem ini bantu kamu mengatur jadwal dan memantau operasional dalam hitungan detik — dan dibangun dengan metodologi <strong class="text-accent-primary font-bold">AI Orchestration</strong> dalam hitungan jam.';

    addAuditLog('Switch Mode Role', 'Mode MANAGER diaktifkan');
    showToast('🔑 Tampilan beralih ke Mode: MANAGER (Akses Penuh Admin)');
    renderAllViews();
  });

  btnEmployee?.addEventListener('click', () => {
    state.activeRole = 'karyawan';
    saveState();

    btnEmployee.classList.add('active', 'text-accent-primary', 'bg-surface-container-high');
    btnEmployee.classList.remove('text-on-surface-variant');
    btnManager.classList.remove('active', 'text-accent-primary', 'bg-surface-container-high');
    btnManager.classList.add('text-on-surface-variant');

    document.querySelectorAll('.manager-only').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.karyawan-only').forEach(el => el.classList.remove('hidden'));

    const loggedInEmp = state.employees.find(e => e.id === state.activeEmployeeId) || state.employees[0];

    if (greetingTitle) greetingTitle.textContent = `"Selamat datang kembali, ${loggedInEmp.name}! 👋"`;
    if (greetingSubtitle) greetingSubtitle.innerHTML = `Shift Kamu Selanjutnya: <strong class="text-accent-primary font-bold">Kamis (23 Jul) — Shift Pagi (07:00 - 15:00)</strong>. Selamat bertugas di ${state.activeBranch}!`;

    addAuditLog('Switch Mode Role', `Mode KARYAWAN diaktifkan (${loggedInEmp.name})`);
    showToast(`👤 Mode KARYAWAN Aktif (${loggedInEmp.name} - Portal Staf)`);
    renderAllViews();
  });

  const btnBell = document.getElementById('btn-notification-bell');
  const notifDropdown = document.getElementById('notif-dropdown');
  btnBell?.addEventListener('click', () => {
    notifDropdown?.classList.toggle('hidden');
  });
}

function setupLogoutReset() {
  const btnLogout = document.getElementById('btn-sidebar-logout');
  btnLogout?.addEventListener('click', () => {
    playUiSound('success');
    localStorage.removeItem(STORAGE_KEY);
    state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
    
    renderAllViews();
    addAuditLog('Reset Data Session', 'Seluruh data di-reset ke versi awal');
    showToast('🔒 Logout berhasil! Seluruh data demo telah di-reset ke versi awal.');
    
    const dashBtn = document.querySelector('.nav-btn[data-tab="dashboard"]');
    dashBtn?.click();
  });
}

function setupModals() {
  const modalSuggest = document.getElementById('modal-smart-suggestion');
  const modalTerAdmin = document.getElementById('modal-ter-admin');
  const modalPaySlip = document.getElementById('modal-pay-slip');
  const modalEmpForm = document.getElementById('modal-employee-form');
  const modalShiftForm = document.getElementById('modal-edit-shift');
  const modalSwapForm = document.getElementById('modal-add-swap');
  const modalShortcuts = document.getElementById('modal-shortcuts');
  const modalAudit = document.getElementById('modal-audit-log');
  const modalScorecard = document.getElementById('modal-emp-scorecard');
  const modalFatigue = document.getElementById('modal-fatigue-alert');
  const modalGeofence = document.getElementById('modal-geofence-inspector');
  const btnCloseModals = document.querySelectorAll('.btn-close-modal');

  btnCloseModals.forEach(btn => {
    btn.addEventListener('click', () => {
      [modalSuggest, modalTerAdmin, modalPaySlip, modalEmpForm, modalShiftForm, modalSwapForm, modalShortcuts, modalAudit, modalScorecard, modalFatigue, modalGeofence].forEach(m => m?.classList.remove('show'));
    });
  });

  document.getElementById('btn-autofix-fatigue')?.addEventListener('click', () => {
    if (activeFatigueEmpId && activeFatigueDayIdx !== null && state.shifts[activeFatigueEmpId]) {
      playUiSound('success');
      state.shifts[activeFatigueEmpId][activeFatigueDayIdx] = 'Sore';
      saveState();
      renderAllViews();
      modalFatigue?.classList.remove('show');
      addAuditLog('Poka-Yoke Fatigue Fixed', `Mengubah shift staf ID ${activeFatigueEmpId} menjadi Sore untuk menjamin istirahat >8 jam`);
      showToast('✨ Poka-Yoke Auto-Fix: Shift berhasil diubah ke Shift Sore (Istirahat Cukup)!');
    }
  });

  document.getElementById('btn-hero-suggest-trigger')?.addEventListener('click', () => {
    openSmartSuggestionModal('Sabtu (25 Jul)', 'Shift Sore (15:00-23:00)', 10);
  });
  document.getElementById('btn-trigger-smart-ai')?.addEventListener('click', () => {
    openSmartSuggestionModal('Sabtu (25 Jul)', 'Shift Sore (15:00-23:00)', 10);
  });

  document.getElementById('btn-open-ter-admin')?.addEventListener('click', () => {
    if (state.activeRole === 'karyawan') {
      showToast('⚠️ Fitur ini hanya dapat diakses oleh Manager.');
      return;
    }
    modalTerAdmin?.classList.add('show');
  });

  document.getElementById('form-ter-admin')?.addEventListener('submit', (e) => {
    e.preventDefault();
    playUiSound('success');
    state.terRates.A = parseFloat(document.getElementById('ter-rate-kat-a').value) || 0.25;
    state.terRates.B = parseFloat(document.getElementById('ter-rate-kat-b').value) || 1.5;
    state.terRates.C = parseFloat(document.getElementById('ter-rate-kat-c').value) || 2.25;

    saveState();
    renderPayrollTable();
    modalTerAdmin?.classList.remove('show');
    addAuditLog('Update Rate TER', `Rate TER Kat A: ${state.terRates.A}%, Kat B: ${state.terRates.B}%`);
    showToast('✅ Tabel Rate TER PMK 168/2023 berhasil diperbarui!');
  });

  document.getElementById('btn-run-payroll-process')?.addEventListener('click', () => {
    if (state.activeRole === 'karyawan') {
      showToast('⚠️ Fitur ini hanya dapat diakses oleh Manager.');
      return;
    }
    playUiSound('success');
    addAuditLog('Payroll Processed', 'Payroll Juli 2026 diproses & dikunci');
    showToast('✨ Payroll Juli 2026 berhasil diproses & dikunci!');
  });

  document.getElementById('btn-print-slip')?.addEventListener('click', () => window.print());
}

function setupEmployeeCRUD() {
  const btnAddNew = document.getElementById('btn-add-new-employee');
  const modalForm = document.getElementById('modal-employee-form');
  const formEmp = document.getElementById('form-employee');
  const modalTitle = document.getElementById('modal-employee-title');
  const inputSalary = document.getElementById('emp-form-salary');
  const inputRate = document.getElementById('emp-form-rate');

  inputSalary?.addEventListener('input', () => {
    const sal = parseInt(inputSalary.value) || 0;
    if (sal > 0) {
      inputRate.value = Math.round(sal / 176);
    }
  });

  btnAddNew?.addEventListener('click', () => {
    if (state.activeRole === 'karyawan') {
      showToast('⚠️ Fitur tambah staf hanya tersedia di Mode Manager.');
      return;
    }
    if (modalTitle) modalTitle.textContent = 'Tambah Staf Baru';
    formEmp.reset();
    document.getElementById('emp-form-id').value = '';
    modalForm?.classList.add('show');
  });

  formEmp?.addEventListener('submit', (e) => {
    e.preventDefault();
    playUiSound('success');
    const idVal = document.getElementById('emp-form-id').value;
    const name = document.getElementById('emp-form-name').value.trim();
    const role = document.getElementById('emp-form-role').value.trim();
    const dept = document.getElementById('emp-form-dept').value;
    const salary = parseInt(document.getElementById('emp-form-salary').value) || 4000000;
    const rate = parseInt(document.getElementById('emp-form-rate').value) || Math.round(salary / 176);
    const ptkp = document.getElementById('emp-form-ptkp').value;
    const skillsRaw = document.getElementById('emp-form-skills').value;

    const skills = skillsRaw ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean) : [role];
    const kat = (ptkp === 'K/3') ? 'C' : (['K/1', 'K/2', 'TK/2', 'TK/3'].includes(ptkp) ? 'B' : 'A');

    if (idVal) {
      const emp = state.employees.find(e => e.id === parseInt(idVal));
      if (emp) {
        emp.name = name;
        emp.role = role;
        emp.dept = dept;
        emp.baseSalary = salary;
        emp.rate = rate;
        emp.ptkp = ptkp;
        emp.kat = kat;
        emp.skills = skills;
        addAuditLog('Update Employee', `Memperbarui data staf ${name}`);
        showToast(`✅ Data staf ${name} berhasil diperbarui!`);
      }
    } else {
      const newId = state.employees.length > 0 ? Math.max(...state.employees.map(e => e.id)) + 1 : 1;
      const newEmp = {
        id: newId,
        name,
        role,
        dept,
        rating: 4.8,
        punctuality: 98,
        skills,
        ptkp,
        kat,
        baseSalary: salary,
        rate,
        nightShiftsMonth: 0,
        overtimeHours: 0,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwyBcUZScQ83Nq3o598I2kDq6PT3SKgnuQl_OXPt1KACSyg0g3z-4O6ErmJN2e4NjvQbkFCb7DSyL9l2UgNrmfVOWRj89xG5zTNaAuSqr6baaaFfV4u-e7GZ3JUJGXyHvxPSRr8Sekif9r_eNQDc2cZNj7nsu-9NokJUFkgidtKx8127yWVQrjhrm6Vblj8AH5AJ16Q4YVjxG7taGIXOtaR6D6RwDsGYRwsRoAIji3-CetINlkXk'
      };

      state.employees.push(newEmp);
      state.shifts[newId] = ['Pagi', 'Pagi', 'Pagi', 'Sore', 'Sore', 'OFF', 'OFF'];
      addAuditLog('Add Employee', `Menambah staf baru ${name} (${role})`);
      showToast(`✨ Staf baru ${name} berhasil ditambahkan!`);
    }

    saveState();
    modalForm?.classList.remove('show');
    renderAllViews();
  });
}

window.openEmployeeScorecard = function(id) {
  const emp = state.employees.find(e => e.id === id);
  const modal = document.getElementById('modal-emp-scorecard');
  if (!emp || !modal) return;

  playUiSound('click');
  document.getElementById('scorecard-avatar').src = emp.avatar;
  document.getElementById('scorecard-name').textContent = emp.name;
  document.getElementById('scorecard-role').textContent = `${emp.role} • Dept ${emp.dept}`;
  document.getElementById('scorecard-rating').textContent = `★ ${emp.rating || 4.8} / 5.0`;
  document.getElementById('scorecard-punctuality').textContent = `${emp.punctuality || 98}% On-Time`;

  modal.classList.add('show');
};

window.openGeofenceInspector = function(id) {
  const emp = state.employees.find(e => e.id === id);
  const modal = document.getElementById('modal-geofence-inspector');
  const nameEl = document.getElementById('geo-staff-name');

  if (!modal) return;
  playUiSound('click');
  if (nameEl) nameEl.textContent = emp ? `${emp.name} (${emp.role})` : 'Staf Kedai';

  modal.classList.add('show');
};

window.editEmployee = function(id) {
  if (state.activeRole === 'karyawan') {
    showToast('⚠️ Fitur edit data staf hanya tersedia di Mode Manager.');
    return;
  }

  const emp = state.employees.find(e => e.id === id);
  if (!emp) return;

  document.getElementById('modal-employee-title').textContent = `Edit Staf: ${emp.name}`;
  document.getElementById('emp-form-id').value = emp.id;
  document.getElementById('emp-form-name').value = emp.name;
  document.getElementById('emp-form-role').value = emp.role;
  document.getElementById('emp-form-dept').value = emp.dept;
  document.getElementById('emp-form-salary').value = emp.baseSalary;
  document.getElementById('emp-form-rate').value = emp.rate;
  document.getElementById('emp-form-ptkp').value = emp.ptkp;
  document.getElementById('emp-form-skills').value = emp.skills.join(', ');

  document.getElementById('modal-employee-form')?.classList.add('show');
};

window.deleteEmployee = function(id) {
  if (state.activeRole === 'karyawan') {
    showToast('⚠️ Fitur hapus staf hanya tersedia di Mode Manager.');
    return;
  }

  const emp = state.employees.find(e => e.id === id);
  if (!emp) return;

  if (confirm(`Apakah Anda yakin ingin menghapus staf ${emp.name}?`)) {
    playUiSound('success');
    state.employees = state.employees.filter(e => e.id !== id);
    delete state.shifts[id];
    saveState();
    renderAllViews();
    addAuditLog('Delete Employee', `Menghapus staf ${emp.name}`);
    showToast(`🗑️ Staf ${emp.name} berhasil dihapus.`);
  }
};

function setupShiftCRUD() {
  const formShift = document.getElementById('form-edit-shift');
  const btnDeleteShift = document.getElementById('btn-delete-shift');
  const modalShift = document.getElementById('modal-edit-shift');

  formShift?.addEventListener('submit', (e) => {
    e.preventDefault();
    playUiSound('success');
    const empId = parseInt(document.getElementById('edit-shift-emp-id').value);
    const dayIdx = parseInt(document.getElementById('edit-shift-day-idx').value);
    const newType = document.getElementById('edit-shift-type-select').value;

    if (state.shifts[empId] && dayIdx !== undefined) {
      state.shifts[empId][dayIdx] = newType;
      saveState();
      renderAllViews();
      modalShift?.classList.remove('show');
      addAuditLog('Update Shift', `Mengubah shift staf ID ${empId} hari idx ${dayIdx} menjadi ${newType}`);
      showToast(`✅ Shift berhasil diperbarui menjadi ${newType}!`);
    }
  });

  btnDeleteShift?.addEventListener('click', () => {
    playUiSound('success');
    const empId = parseInt(document.getElementById('edit-shift-emp-id').value);
    const dayIdx = parseInt(document.getElementById('edit-shift-day-idx').value);

    if (state.shifts[empId] && dayIdx !== undefined) {
      state.shifts[empId][dayIdx] = 'EMPTY';
      saveState();
      renderAllViews();
      modalShift?.classList.remove('show');
      addAuditLog('Clear Shift Slot', `Mengosongkan shift staf ID ${empId} hari idx ${dayIdx}`);
      showToast('🗑️ Shift berhasil dikosongkan.');
    }
  });
}

window.openEditShiftModal = function(empId, dayIdx, isWarning) {
  if (isWarning) {
    activeFatigueEmpId = empId;
    activeFatigueDayIdx = dayIdx;
    document.getElementById('modal-fatigue-alert')?.classList.add('show');
    return;
  }

  if (state.activeRole === 'karyawan' && empId !== state.activeEmployeeId) {
    showToast('⚠️ Di Mode Karyawan, Anda hanya bisa mengajukan swap pada shift sendiri.');
    return;
  }

  const emp = state.employees.find(e => e.id === empId);
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  if (!emp) return;

  document.getElementById('edit-shift-emp-id').value = empId;
  document.getElementById('edit-shift-day-idx').value = dayIdx;
  document.getElementById('edit-shift-info').textContent = `Staf: ${emp.name} (${emp.role}) • Hari: ${days[dayIdx]}`;
  document.getElementById('edit-shift-type-select').value = state.shifts[empId]?.[dayIdx] || 'Pagi';

  document.getElementById('modal-edit-shift')?.classList.add('show');
};

function setupSwapCRUD() {
  const btnSubmitSwap = document.getElementById('btn-submit-swap-request');
  const modalSwap = document.getElementById('modal-add-swap');
  const formSwap = document.getElementById('form-add-swap');

  btnSubmitSwap?.addEventListener('click', () => {
    populateSwapRequesterOptions();
    modalSwap?.classList.add('show');
  });

  formSwap?.addEventListener('submit', (e) => {
    e.preventDefault();
    playUiSound('success');
    const requester = document.getElementById('swap-form-requester').value;
    const dayIdx = parseInt(document.getElementById('swap-form-day-idx').value) || 5;
    const reason = document.getElementById('swap-form-reason').value;

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const newSwap = {
      id: Date.now(),
      requester,
      targetSlot: `${days[dayIdx]} - Shift Pagi`,
      dayIdx,
      reason,
      status: 'Menunggu Approval',
      stepperStep: 2,
      isConflict: false
    };

    state.swapRequests.unshift(newSwap);
    saveState();
    renderApprovalFlow();
    modalSwap?.classList.remove('show');
    formSwap.reset();
    addAuditLog('Create Swap Request', `${requester} mengajukan swap shift ${days[dayIdx]}`);
    showToast('✨ Request swap shift berhasil diajukan!');
  });
}

function populateSwapRequesterOptions() {
  const select = document.getElementById('swap-form-requester');
  if (!select) return;

  if (state.activeRole === 'karyawan') {
    const emp = state.employees.find(e => e.id === state.activeEmployeeId) || state.employees[0];
    select.innerHTML = `<option value="${emp.name}">${emp.name} (${emp.role})</option>`;
  } else {
    select.innerHTML = state.employees.map(e => `<option value="${e.name}">${e.name} (${e.role})</option>`).join('');
  }
}

window.deleteSwap = function(reqId) {
  playUiSound('success');
  state.swapRequests = state.swapRequests.filter(r => r.id !== reqId);
  saveState();
  renderApprovalFlow();
  addAuditLog('Cancel Swap Request', `Request swap ID ${reqId} dibatalkan`);
  showToast('🗑️ Request swap berhasil dibatalkan.');
};

window.resolveSwap = function(reqId, approved) {
  if (state.activeRole === 'karyawan') {
    showToast('⚠️ Hanya Manager yang dapat menyetujui atau menolak request swap.');
    return;
  }

  playUiSound('success');
  const target = state.swapRequests.find(r => r.id === reqId);
  if (target) {
    target.status = approved ? 'Disetujui' : 'Ditolak';
    target.stepperStep = approved ? 3 : 2;

    if (approved) {
      const emp = state.employees.find(e => e.name === target.requester);
      if (emp && state.shifts[emp.id]) {
        const currentShift = state.shifts[emp.id][target.dayIdx];
        state.shifts[emp.id][target.dayIdx] = (currentShift === 'Pagi') ? 'Sore' : 'Pagi';
      }
    }

    saveState();
    renderAllViews();
    addAuditLog('Resolve Swap Request', `Manager ${approved ? 'setujui' : 'tolak'} swap ${target.requester}`);
    showToast(approved ? `✅ Request swap ${target.requester} disetujui & jadwal ter-update!` : `❌ Request swap ditolak.`);
  }
};

function openSmartSuggestionModal(dayName, shiftName, empId) {
  const modal = document.getElementById('modal-smart-suggestion');
  const thinkingState = document.getElementById('suggest-thinking-state');
  const resultsState = document.getElementById('suggest-results-state');
  const targetInfo = document.getElementById('suggest-target-info');
  const candidatesList = document.getElementById('candidates-list');

  if (!modal || !thinkingState || !resultsState) return;

  targetInfo.innerHTML = `Slot Terpilih: <strong class="text-accent-primary">${dayName} — ${shiftName}</strong>`;

  thinkingState.classList.remove('hidden');
  resultsState.classList.add('hidden');
  modal.classList.add('show');

  setTimeout(() => {
    const candidates = [
      {
        id: 3,
        name: 'Budi Santoso',
        role: 'Senior Barista',
        reason: 'Budi cocok karena baru 1x shift malam bulan ini (rata-rata tim 4x), memiliki skill Senior Barista, dan belum lembur minggu ini.',
        matchScore: '98%'
      },
      {
        id: 1,
        name: 'Dimas Prasetyo',
        role: 'Head Barista',
        reason: 'Dimas available di jam ini, memiliki skill Opening/Closing Lead, dengan jam kerja 32 jam minggu ini.',
        matchScore: '92%'
      },
      {
        id: 10,
        name: 'Maya Putri',
        role: 'Barista Junior',
        reason: 'Maya memiliki ketersediaan penuh dan belum mencapai batas maksimum jam mingguan (28 jam).',
        matchScore: '87%'
      }
    ];

    candidatesList.innerHTML = candidates.map(c => `
      <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-accent-primary transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover-lift">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-on-surface font-heading text-sm">${c.name}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold">${c.role}</span>
            <span class="text-xs text-accent-primary font-mono font-bold">Match ${c.matchScore}</span>
          </div>
          <p class="text-xs text-on-surface-variant font-medium mt-1 leading-normal">${c.reason}</p>
        </div>
        <button onclick="window.assignCandidateToSlot(${empId}, '${c.name}')" class="px-3.5 py-2 rounded-xl bg-accent-primary text-white font-bold text-xs hover:bg-accent-primary-hover font-display whitespace-nowrap magnetic-btn">
          Pilih Candidate
        </button>
      </div>
    `).join('');

    thinkingState.classList.add('hidden');
    resultsState.classList.remove('hidden');
  }, 1000);
}

window.assignCandidateToSlot = function(empId, candidateName) {
  playUiSound('success');
  state.shifts[10][5] = 'Sore';
  saveState();
  renderAllViews();
  document.getElementById('modal-smart-suggestion')?.classList.remove('show');
  addAuditLog('AI Candidate Assigned', `${candidateName} di-assign ke slot Sabtu Sore`);
  showToast(`✨ ${candidateName} berhasil di-assign ke slot Sabtu Sore!`);
};

function renderCalendarGrid() {
  const tbody = document.getElementById('calendar-grid-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const roleFilter = document.getElementById('filter-calendar-role')?.value || 'ALL';
  const shiftTypeFilter = document.getElementById('filter-calendar-shifttype')?.value || 'ALL';
  const searchQuery = document.getElementById('filter-calendar-search')?.value.toLowerCase() || '';

  let visibleCount = 0;

  state.employees.forEach(emp => {
    if (state.activeRole === 'karyawan' && state.filterMyShiftsOnly && emp.id !== state.activeEmployeeId) return;
    if (roleFilter !== 'ALL' && !emp.role.toLowerCase().includes(roleFilter.toLowerCase())) return;
    if (searchQuery && !emp.name.toLowerCase().includes(searchQuery)) return;

    const empShifts = state.shifts[emp.id] || ['Pagi', 'Pagi', 'Pagi', 'Pagi', 'Pagi', 'OFF', 'OFF'];
    if (shiftTypeFilter !== 'ALL' && !empShifts.includes(shiftTypeFilter)) return;

    visibleCount++;
    const isSelf = (state.activeRole === 'karyawan' && emp.id === state.activeEmployeeId);

    const row = document.createElement('tr');
    row.className = `hover:bg-surface-container-high/60 transition-colors ${isSelf ? 'bg-accent-primary/10 border-l-4 border-l-accent-primary font-bold' : ''}`;

    let skillBadge = emp.skills.map(s => `<span class="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold">${s}</span>`).join(' ');

    let cellsHtml = `
      <td class="p-4">
        <div class="flex items-center gap-3 cursor-pointer group" onclick="window.openEmployeeScorecard(${emp.id})" title="Klik untuk lihat scorecard performa">
          <img src="${emp.avatar}" alt="${emp.name}" class="w-9 h-9 rounded-full object-cover border-2 ${isSelf ? 'border-accent-primary shadow-[0_0_14px_rgba(255,174,51,0.7)]' : 'border-accent-primary/50'} group-hover:scale-110 transition-transform"/>
          <div>
            <div class="flex items-center gap-1.5">
              <p class="font-bold text-on-surface font-heading text-xs group-hover:text-accent-primary transition-colors">${emp.name}</p>
              ${isSelf ? '<span class="px-2 py-0.5 rounded-full bg-accent-primary text-white font-bold text-[9px] font-display">SAYA</span>' : ''}
            </div>
            <div class="flex flex-wrap items-center gap-1 mt-1">${skillBadge}</div>
          </div>
        </div>
      </td>
    `;

    empShifts.forEach((shift, dayIdx) => {
      const prevShift = dayIdx > 0 ? empShifts[dayIdx - 1] : null;
      const isWarning = (prevShift === 'Closing' && shift === 'Pagi');

      let badgeContent = '';
      if (shift === 'Pagi') {
        badgeContent = `<span onclick="window.openEditShiftModal(${emp.id}, ${dayIdx}, ${isWarning})" class="px-2.5 py-1 rounded-lg bg-psy-info-bg text-psy-info-text border border-psy-info/50 font-bold text-xs shadow-sm flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-psy-info"></span> Pagi (07-15)</span>`;
      } else if (shift === 'Sore') {
        badgeContent = `<span onclick="window.openEditShiftModal(${emp.id}, ${dayIdx}, false)" class="px-2.5 py-1 rounded-lg bg-psy-warning-bg text-psy-warning-text border border-psy-warning/50 font-bold text-xs shadow-sm flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-psy-warning animate-pulse"></span> Sore (15-23)</span>`;
      } else if (shift === 'Closing') {
        badgeContent = `<span onclick="window.openEditShiftModal(${emp.id}, ${dayIdx}, false)" class="px-2.5 py-1 rounded-lg bg-psy-calm-bg text-psy-calm-text border border-psy-calm/50 font-bold text-xs shadow-sm flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-psy-calm"></span> Closing</span>`;
      } else if (shift === 'EMPTY') {
        badgeContent = `
          <button onclick="window.triggerSlotSuggest(${emp.id}, ${dayIdx})" class="px-2.5 py-1 rounded-lg border-2 border-dashed border-psy-danger text-psy-danger font-bold text-xs flex items-center justify-center gap-1 hover:bg-psy-danger-bg transition-colors w-full">
            <span class="material-symbols-outlined text-xs font-bold text-psy-danger">add</span> Kosong!
          </button>
        `;
      } else {
        badgeContent = `<span onclick="window.openEditShiftModal(${emp.id}, ${dayIdx}, false)" class="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface-variant border border-surface-container-highest font-bold text-xs flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span> OFF</span>`;
      }

      let cellClass = 'p-4 text-center ';
      if (dayIdx < 3) cellClass += 'opacity-60 ';
      if (dayIdx === 3) cellClass += 'bg-accent-primary/15 ';
      if (isWarning) cellClass += 'shift-warning ';

      cellsHtml += `
        <td class="${cellClass}" title="${isWarning ? '⚠️ Warning: Kurang jam istirahat (Closing ke Pagi). Klik untuk Poka-Yoke Auto-Fix!' : 'Klik untuk edit shift'}">
          <div class="shift-card">${badgeContent}</div>
        </td>
      `;
    });

    row.innerHTML = cellsHtml;
    tbody.appendChild(row);
  });

  if (visibleCount === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="p-8 text-center text-on-surface-variant font-semibold">
          Tidak ditemukan staf yang cocok dengan kriteria filter.
        </td>
      </tr>
    `;
  }
}

function renderAttendanceTable() {
  const tbody = document.getElementById('attendance-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const statusFilter = document.getElementById('filter-attendance-status')?.value || 'ALL';

  state.employees.forEach(emp => {
    const isLate = emp.id % 4 === 0;
    const isPermit = emp.id === 8;

    let statusType = 'Tepat Waktu';
    let statusBadge = `<span class="px-2.5 py-1 rounded-full bg-psy-safe-bg text-psy-safe-text font-bold text-xs flex items-center gap-1 w-fit border border-psy-safe/30"><span class="pulse-dot"></span> Hadir Tepat Waktu</span>`;
    let timeIn = '06:52 WIB';
    let timeOut = '15:02 WIB';

    if (isLate) {
      statusType = 'Terlambat';
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-psy-danger-bg text-psy-danger-text font-bold text-xs flex items-center gap-1 w-fit border border-psy-danger/30"><span class="material-symbols-outlined text-sm text-psy-danger">schedule</span> Terlambat (12m)</span>`;
      timeIn = '07:12 WIB';
    } else if (isPermit) {
      statusType = 'Izin';
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-psy-warning-bg text-psy-warning-text font-bold text-xs flex items-center gap-1 w-fit border border-psy-warning/30"><span class="material-symbols-outlined text-sm text-psy-warning">medical_services</span> Izin Sakit</span>`;
      timeIn = '-';
      timeOut = '-';
    }

    if (statusFilter !== 'ALL' && statusType !== statusFilter) return;

    const row = document.createElement('tr');
    row.className = 'hover:bg-surface-container-high/60 transition-colors cursor-pointer';
    row.innerHTML = `
      <td class="p-4">
        <div class="flex items-center gap-3 group" onclick="window.openEmployeeScorecard(${emp.id})">
          <img src="${emp.avatar}" alt="${emp.name}" class="w-8 h-8 rounded-full object-cover border border-semantic-neutral/30 group-hover:scale-110 transition-transform"/>
          <div>
            <span class="font-bold text-on-surface font-heading text-xs group-hover:text-accent-primary transition-colors">${emp.name}</span>
            <p class="text-[10px] text-on-surface-variant">${emp.role}</p>
          </div>
        </div>
      </td>
      <td class="p-4 font-semibold text-on-surface-variant">Shift Pagi (07:00-15:00)</td>
      <td class="p-4 font-mono font-semibold">${timeIn}</td>
      <td class="p-4 font-mono text-on-surface-variant">${timeOut}</td>
      <td class="p-4">${statusBadge}</td>
      <td class="p-4 text-center">
        <button onclick="window.openGeofenceInspector(${emp.id})" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:border-accent-primary border border-surface-container-highest font-mono text-[11px] text-on-surface-variant hover:text-accent-primary font-semibold transition-all">
          📍 GPS Tap Inspector
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.triggerSlotSuggest = function(empId, dayIdx) {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  openSmartSuggestionModal(days[dayIdx], 'Shift Sore (15:00-23:00)', empId);
};

function renderApprovalFlow() {
  const container = document.getElementById('swap-requests-container');
  if (!container) return;

  const statusFilter = document.getElementById('filter-swap-status')?.value || 'ALL';

  let requestsToDisplay = state.swapRequests;
  if (state.activeRole === 'karyawan') {
    const loggedInEmp = state.employees.find(e => e.id === state.activeEmployeeId) || state.employees[0];
    requestsToDisplay = state.swapRequests.filter(r => r.requester === loggedInEmp.name);
  }

  if (statusFilter !== 'ALL') {
    requestsToDisplay = requestsToDisplay.filter(r => r.status === statusFilter);
  }

  if (requestsToDisplay.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center glass-panel rounded-2xl text-on-surface-variant text-xs font-semibold">
        Belum ada pengajuan swap shift yang cocok dengan filter.
      </div>
    `;
    return;
  }

  container.innerHTML = requestsToDisplay.map(req => `
    <div class="glass-panel spotlight-card p-5 rounded-2xl space-y-3 hover-lift ${req.isConflict ? 'border-error/50 bg-error/10' : ''}">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-on-surface font-heading text-sm">${req.requester}</h4>
            ${req.isConflict ? '<span class="px-2.5 py-0.5 rounded-lg bg-psy-danger-bg text-psy-danger-text border border-psy-danger/50 text-xs font-bold animate-pulse flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-sm">warning</span> Bentrok Slot</span>' : ''}
          </div>
          <p class="text-xs text-on-surface-variant font-medium mt-1">Target: <strong class="text-accent-primary font-bold">${req.targetSlot}</strong> • Alasan: "${req.reason}"</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Disetujui' ? 'bg-psy-safe-bg text-psy-safe-text border border-psy-safe/40' : req.status === 'Ditolak' ? 'bg-psy-danger-bg text-psy-danger-text border border-psy-danger/40' : 'bg-psy-warning-bg text-psy-warning-text border border-psy-warning/40'}">
            ${req.status === 'Menunggu Approval' ? '<span class="pulse-dot mr-1"></span>' : ''}${req.status}
          </span>
          <button onclick="window.deleteSwap(${req.id})" class="text-on-surface-variant hover:text-error p-1" title="Hapus request">
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>

      <div class="pt-2">
        <div class="flex items-center justify-between text-xs text-on-surface-variant font-bold">
          <span class="${req.stepperStep >= 1 ? 'text-accent-primary' : ''}">1. Diajukan ✓</span>
          <span class="${req.stepperStep >= 2 ? 'text-accent-primary' : ''}">2. Menunggu Approval</span>
          <span class="${req.stepperStep >= 3 ? 'text-primary' : ''}">3. Disetujui</span>
        </div>
        <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1.5 flex">
          <div class="bg-accent-primary h-full transition-all liquid-fill" style="width: ${req.stepperStep * 33.3}%;"></div>
        </div>
      </div>

      ${state.activeRole === 'manager' && req.status === 'Menunggu Approval' ? `
        <div class="pt-2 flex justify-end gap-2">
          <button onclick="window.resolveSwap(${req.id}, false)" class="px-3.5 py-1.5 rounded-xl border border-surface-container-high text-xs text-on-surface-variant hover:bg-surface-container-high font-semibold">Tolak</button>
          <button onclick="window.resolveSwap(${req.id}, true)" class="px-4 py-1.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-primary-hover font-display magnetic-btn">Approve & Resolve</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function renderPayrollTable() {
  const tbody = document.getElementById('payroll-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  let totBase = 0, totOvertime = 0, totBpjs = 0, totTax = 0;
  const katFilter = document.getElementById('filter-payroll-terkat')?.value || 'ALL';

  state.employees.forEach(emp => {
    if (katFilter !== 'ALL' && emp.kat !== katFilter) return;

    const empShifts = state.shifts[emp.id] || [];
    const workShiftsCount = empShifts.filter(s => s !== 'OFF' && s !== 'EMPTY').length;
    const workHoursWeek = workShiftsCount * 8;
    const overtimeHoursWeek = Math.max(0, workHoursWeek - 40);
    const overtimeHoursMonth = (overtimeHoursWeek * 4) + (emp.nightShiftsMonth || 0);

    const overtimePay = Math.round(overtimeHoursMonth * (emp.rate * 1.5));
    const bruto = emp.baseSalary + overtimePay;
    const terRate = state.terRates[emp.kat] || 1.5;
    const bpjs = Math.round(bruto * 0.03);
    const pph21 = Math.round(bruto * (terRate / 100));
    const thp = bruto - bpjs - pph21;

    totBase += emp.baseSalary;
    totOvertime += overtimePay;
    totBpjs += bpjs;
    totTax += pph21;

    const isSelf = (state.activeRole === 'karyawan' && emp.id === state.activeEmployeeId);
    if (state.activeRole === 'karyawan' && !isSelf) return;

    const row = document.createElement('tr');
    row.className = `hover:bg-surface-container-high/60 transition-colors ${isSelf ? 'bg-accent-primary/10 font-bold' : ''}`;
    row.innerHTML = `
      <td class="p-4">
        <div class="flex items-center gap-3 cursor-pointer group" onclick="window.openEmployeeScorecard(${emp.id})">
          <img src="${emp.avatar}" alt="${emp.name}" class="w-8 h-8 rounded-full object-cover border border-semantic-neutral/30 group-hover:scale-110 transition-transform"/>
          <span class="font-bold text-on-surface font-heading text-xs group-hover:text-accent-primary transition-colors">${emp.name} ${isSelf ? '(SAYA)' : ''}</span>
        </div>
      </td>
      <td class="p-4 text-on-surface-variant font-mono font-semibold text-xs">${emp.ptkp} (Kat ${emp.kat} - ${terRate}%)</td>
      <td class="p-4 text-right text-semantic-positive font-mono font-semibold">Rp ${emp.baseSalary.toLocaleString('id-ID')}</td>
      <td class="p-4 text-right text-semantic-positive font-mono font-bold">+Rp ${overtimePay.toLocaleString('id-ID')} <span class="text-[10px] text-on-surface-variant font-normal">(${overtimeHoursMonth}j)</span></td>
      <td class="p-4 text-right text-semantic-warning font-mono font-semibold">-Rp ${bpjs.toLocaleString('id-ID')}</td>
      <td class="p-4 text-right text-semantic-warning font-mono font-semibold">-Rp ${pph21.toLocaleString('id-ID')}</td>
      <td class="p-4 text-right font-bold text-on-surface font-mono">Rp ${thp.toLocaleString('id-ID')}</td>
      <td class="p-4 text-center">
        <button onclick="window.openPaySlip(${emp.id}, ${bruto}, ${overtimePay}, ${bpjs}, ${pph21}, ${thp}, ${overtimeHoursMonth})" class="px-3 py-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-primary-hover text-xs font-bold font-display shadow-md magnetic-btn">
          Lihat Slip Gaji
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('summary-total-base').textContent = `Rp ${totBase.toLocaleString('id-ID')}`;
  document.getElementById('summary-total-overtime').textContent = `Rp ${totOvertime.toLocaleString('id-ID')}`;
  document.getElementById('summary-total-bpjs').textContent = `Rp ${totBpjs.toLocaleString('id-ID')}`;
  document.getElementById('summary-total-tax').textContent = `Rp ${totTax.toLocaleString('id-ID')}`;
  document.getElementById('summary-emp-count').textContent = `${state.employees.length} Karyawan`;
}

window.openPaySlip = function(empId, bruto, overtimePay, bpjs, pph21, thp, overtimeHours) {
  const emp = state.employees.find(e => e.id === empId);
  const modal = document.getElementById('modal-pay-slip');
  const body = document.getElementById('pay-slip-body');
  const btnCopy = document.getElementById('btn-copy-slip-summary');

  if (!emp || !modal || !body) return;

  body.innerHTML = `
    <div class="flex items-center gap-4 pb-3 border-b border-surface-container-high">
      <img src="${emp.avatar}" alt="${emp.name}" class="w-12 h-12 rounded-full object-cover border-2 border-accent-primary shadow-lg"/>
      <div>
        <h4 class="font-bold text-on-surface font-heading text-base">${emp.name}</h4>
        <p class="text-xs text-on-surface-variant font-semibold">${emp.role} • PTKP ${emp.ptkp} (TER Kat ${emp.kat})</p>
      </div>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex justify-between py-1.5 border-b border-surface-container-high/60">
        <span class="text-on-surface-variant font-semibold">Gaji Pokok:</span>
        <span class="font-mono font-bold text-semantic-positive">Rp ${emp.baseSalary.toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between py-1.5 border-b border-surface-container-high/60">
        <span class="text-on-surface-variant font-semibold">Tunjangan Lembur (${overtimeHours || 0} Jam):</span>
        <span class="font-mono font-bold text-semantic-positive">+Rp ${overtimePay.toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between py-1.5 border-b border-surface-container-high/60">
        <span class="text-on-surface-variant font-semibold">Potongan BPJS TK (3%):</span>
        <span class="font-mono font-bold text-semantic-warning">-Rp ${bpjs.toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between py-1.5 border-b border-surface-container-high/60">
        <span class="text-on-surface-variant font-semibold">Potongan PPh 21 TER (${state.terRates[emp.kat]}%):</span>
        <span class="font-mono font-bold text-semantic-warning">-Rp ${pph21.toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between py-2 font-bold text-base text-on-surface font-display pt-2">
        <span>Take Home Pay (THP):</span>
        <span class="font-mono">Rp ${thp.toLocaleString('id-ID')}</span>
      </div>
    </div>
  `;

  if (btnCopy) {
    btnCopy.onclick = () => {
      const summaryText = `[SLIP GAJI - SOKARA HR]\nNama: ${emp.name} (${emp.role})\nPeriode: Juli 2026\nGaji Pokok: Rp ${emp.baseSalary.toLocaleString('id-ID')}\nLembur: Rp ${overtimePay.toLocaleString('id-ID')}\nPotongan BPJS & TER: Rp ${(bpjs + pph21).toLocaleString('id-ID')}\n--------------------\nTAKE HOME PAY (THP): Rp ${thp.toLocaleString('id-ID')}`;
      navigator.clipboard.writeText(summaryText).then(() => {
        playUiSound('success');
        showToast('📋 Ringkasan Slip Gaji berhasil disalin ke Clipboard!');
      });
    };
  }

  modal.classList.add('show');
};

function renderEmployeeTable() {
  const tbody = document.getElementById('employee-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const searchQuery = document.getElementById('search-employee-input')?.value.toLowerCase() || '';
  const deptFilter = document.getElementById('filter-emp-dept')?.value || 'ALL';
  const ratingFilter = document.getElementById('filter-emp-rating')?.value || 'ALL';

  state.employees.forEach(emp => {
    if (deptFilter !== 'ALL' && emp.dept !== deptFilter) return;
    if (ratingFilter === 'TOP' && emp.rating < 4.8) return;
    if (ratingFilter === 'REG' && emp.rating >= 4.8) return;
    if (searchQuery && !emp.name.toLowerCase().includes(searchQuery) && !emp.role.toLowerCase().includes(searchQuery)) return;

    const isSelf = (state.activeRole === 'karyawan' && emp.id === state.activeEmployeeId);

    const row = document.createElement('tr');
    row.className = `hover:bg-surface-container-high/60 transition-colors ${isSelf ? 'bg-accent-primary/10 font-bold' : ''}`;
    row.innerHTML = `
      <td class="p-4">
        <div class="flex items-center gap-3 cursor-pointer group" onclick="window.openEmployeeScorecard(${emp.id})">
          <img src="${emp.avatar}" alt="${emp.name}" class="w-9 h-9 rounded-full object-cover border-2 ${isSelf ? 'border-accent-primary shadow-[0_0_14px_rgba(255,174,51,0.7)]' : 'border-semantic-neutral/30'} group-hover:scale-110 transition-transform"/>
          <div>
            <span class="font-bold text-on-surface font-heading text-xs group-hover:text-accent-primary transition-colors">${emp.name} ${isSelf ? '(SAYA)' : ''}</span>
            <div class="flex items-center gap-1 text-[10px] text-accent-primary font-bold">
              <span>★ ${emp.rating || 4.8}</span> • <span>${emp.punctuality || 98}% Hadir</span>
            </div>
          </div>
        </div>
      </td>
      <td class="p-4 text-on-surface-variant font-semibold">${emp.role} (${emp.dept})</td>
      <td class="p-4">${emp.skills.map(s => `<span class="px-2.5 py-0.5 rounded bg-surface-container-high text-semantic-neutral text-xs font-bold mr-1 border border-semantic-neutral/30">${s}</span>`).join('')}</td>
      <td class="p-4 font-mono font-semibold text-on-surface">${emp.ptkp}</td>
      <td class="p-4 text-right font-mono font-bold text-accent-primary">Rp ${emp.rate.toLocaleString('id-ID')}/jam</td>
      <td class="p-4 text-right font-mono font-semibold">Rp ${emp.baseSalary.toLocaleString('id-ID')}</td>
      <td class="p-4 text-center">
        ${state.activeRole === 'manager' ? `
          <div class="flex items-center justify-center gap-2">
            <button onclick="window.editEmployee(${emp.id})" class="px-2.5 py-1.5 rounded bg-surface-container-high text-on-surface hover:text-accent-primary text-xs font-bold">
              Edit
            </button>
            <button onclick="window.deleteEmployee(${emp.id})" class="px-2.5 py-1.5 rounded bg-error/15 text-error hover:bg-error/30 text-xs font-bold">
              Hapus
            </button>
          </div>
        ` : `
          <span class="text-xs text-on-surface-variant font-medium">Read-Only</span>
        `}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-20 right-6 bg-surface-container-highest border-2 border-accent-primary text-on-surface text-xs font-bold p-3.5 rounded-2xl shadow-2xl z-50 flex flex-col gap-1 transition-all transform translate-y-2 opacity-0 font-heading max-w-sm';
  toast.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-accent-primary text-lg">info</span>
        <span>${message}</span>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-on-surface-variant hover:text-on-surface text-sm ml-2 font-bold">✕</button>
    </div>
    <div class="toast-progress w-full mt-1.5"></div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 50);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 300);
    }
  }, 3800);
}

// PWA Offline-First Synchronization
function updateNetworkStatus() {
  const badge = document.getElementById('network-status-badge');
  if (!badge) return;
  
  if (navigator.onLine) {
    badge.className = 'text-xs font-bold text-psy-safe-text bg-psy-safe-bg px-2.5 py-1 rounded-full flex items-center gap-1 border border-psy-safe/30 transition-all';
    badge.innerHTML = '<span class="material-symbols-outlined text-[14px]">wifi</span> Online';
    
    if (localStorage.getItem('sokara_offline_queue')) {
      showToast('Menyinkronkan data presensi (Offline Queue)...');
      setTimeout(() => {
        localStorage.removeItem('sokara_offline_queue');
        showToast('Sinkronisasi Offline berhasil diselesaikan!');
      }, 1500);
    }
  } else {
    badge.className = 'text-xs font-bold text-psy-danger-text bg-psy-danger-bg px-2.5 py-1 rounded-full flex items-center gap-1 border border-psy-danger/30 transition-all animate-pulse';
    badge.innerHTML = '<span class="material-symbols-outlined text-[14px]">wifi_off</span> Offline';
    showToast('Koneksi terputus. Data akan disimpan di antrean Offline (Queue).');
  }
}
