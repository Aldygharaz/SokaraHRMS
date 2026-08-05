import { useHRStore } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { MapPin, Clock, Download, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function Attendance() {
  const { employees, activeRole, activeEmployeeId } = useHRStore()
  
  // Dummy attendance data based on employees
  const displayEmployees = activeRole === 'manager' 
    ? employees 
    : employees.filter(e => e.id === activeEmployeeId)

  const attendances = displayEmployees.map((emp, idx) => {
    const isLate = idx % 4 === 0
    const isOutsideGeofence = idx === 3
    const timeIn = isLate ? '08:15' : '07:45'
    const status = isLate ? 'Terlambat' : 'Tepat Waktu'
    
    return {
      ...emp,
      timeIn,
      timeOut: '--:--',
      status,
      geofence: isOutsideGeofence ? 'Outside Radius' : 'Inside Radius (HQ)'
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">Data Presensi</h2>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold uppercase tracking-wider border border-semantic-neutral/30">Hari Ini</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Pantau kehadiran, cuti, dan izin karyawan secara real-time dengan Geofencing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeRole === 'manager' && (
            <button 
              onClick={() => toast.success("Laporan kehadiran berhasil di-export ke Excel.")}
              className="bg-surface-container-high text-on-surface hover:text-accent-primary border border-surface-container-highest text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 transition-colors"
            >
              <Download className="w-4 h-4" /> Export Laporan
            </button>
          )}
        </div>
      </div>

      {activeRole === 'manager' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Hadir', value: attendances.length - 1, color: 'text-psy-safe' },
            { label: 'Terlambat', value: 1, color: 'text-psy-warning' },
            { label: 'Absen/Cuti', value: 0, color: 'text-semantic-neutral' },
            { label: 'Diluar Geofence', value: 1, color: 'text-psy-danger' },
          ].map((stat, i) => (
            <TiltCard key={i} className="glass-panel rounded-2xl p-4 border border-outline">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={cn("text-3xl font-bold font-display", stat.color)}>{stat.value}</p>
            </TiltCard>
          ))}
        </div>
      )}

      <div className="glass-panel spotlight-card rounded-2xl overflow-hidden overflow-x-auto border border-outline p-0">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-surface-container-high text-xs text-on-surface-variant uppercase tracking-wider font-bold">
              <th className="p-4">Karyawan</th>
              <th className="p-4">Jam Masuk</th>
              <th className="p-4">Jam Keluar</th>
              <th className="p-4">Status Geofence</th>
              <th className="p-4">Status Kehadiran</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-xs">
            {attendances.map(record => (
              <tr key={record.id} className="hover:bg-surface-container transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={record.avatar} alt={record.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-on-surface">{record.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{record.role}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 font-mono font-medium">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant" /> {record.timeIn}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 font-mono font-medium text-on-surface-variant">
                    <Clock className="w-3.5 h-3.5" /> {record.timeOut}
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-max",
                    record.geofence.includes('Outside') 
                      ? "bg-psy-danger-bg text-psy-danger-text border border-psy-danger/20" 
                      : "bg-surface-container-high text-on-surface-variant border border-surface-container-highest"
                  )}>
                    <MapPin className="w-3 h-3" /> {record.geofence}
                  </span>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-max",
                    record.status === 'Tepat Waktu' 
                      ? "bg-psy-safe-bg text-psy-safe-text border border-psy-safe/20" 
                      : "bg-psy-warning-bg text-psy-warning-text border border-psy-warning/20"
                  )}>
                    {record.status === 'Tepat Waktu' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {record.status}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => {
                      const lat = (Math.random() * ( -6.20 - -6.30) + -6.30).toFixed(6)
                      const lng = (Math.random() * (106.90 - 106.70) + 106.70).toFixed(6)
                      toast.info(`Lokasi GPS: ${lat}, ${lng}`, { description: 'Buka di Google Maps untuk melihat koordinat pasti.' })
                    }}
                    className="text-accent-primary font-bold hover:underline text-xs"
                  >
                    Detail GPS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
