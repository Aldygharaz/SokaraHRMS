import { useState, useEffect } from 'react'
import { X, Keyboard, Sparkles } from 'lucide-react'
import { sound } from '@/lib/sound'

export function ShortcutModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        sound.playClick()
        setIsOpen(prev => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  const shortcutGroups = [
    {
      title: 'Navigasi & Perintah Cepat',
      shortcuts: [
        { keys: ['Ctrl', 'K'], label: 'Buka Command Palette & Navigasi Rute' },
        { keys: ['Shift', '?'], label: 'Buka / Tutup Panduan Pintasan Keyboard' },
        { keys: ['Esc'], label: 'Tutup Dialog / Modal Aktif' }
      ]
    },
    {
      title: 'Matriks Kalender & Shift',
      shortcuts: [
        { keys: ['1'], label: 'Tetapkan Shift Pagi (08:00 - 17:00)' },
        { keys: ['2'], label: 'Tetapkan Shift Sore (14:00 - 23:00)' },
        { keys: ['3'], label: 'Tetapkan Shift Closing (16:00 - 01:00)' },
        { keys: ['4'], label: 'Tetapkan Libur (OFF)' }
      ]
    },
    {
      title: 'Filter & Operasional',
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'F'], label: 'Reset Filter Daftar Karyawan ke Semua' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative glass-panel bg-surface shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-outline p-6">
        <div className="flex items-center justify-between pb-4 border-b border-outline mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg font-display">Pintasan Keyboard (Hotkeys)</h3>
              <p className="text-xs text-on-surface-variant font-medium">Tingkatkan efisiensi kerja tanpa melepas keyboard</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>

        <div className="space-y-5">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-display">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, sIdx) => (
                  <div 
                    key={sIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline text-xs"
                  >
                    <span className="text-on-surface font-medium">{sc.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k, kIdx) => (
                        <kbd 
                          key={kIdx}
                          className="px-2 py-1 rounded-lg bg-surface-container-highest border border-outline font-mono text-[10px] font-bold text-on-surface shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 rounded-2xl bg-surface-container-lowest border border-outline flex items-center gap-2 text-[11px] text-on-surface-variant font-mono">
          <Sparkles className="w-4 h-4 text-accent-primary shrink-0" />
          <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline font-bold">?</kbd> kapan saja untuk memanggil panduan ini.</span>
        </div>
      </div>
    </div>
  )
}
