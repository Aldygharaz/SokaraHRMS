import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show only if haven't been dismissed in this session
    const hasSeen = sessionStorage.getItem('sokara_demo_banner_dismissed')
    if (!hasSeen) {
      // Delay slightly for animation effect
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('sokara_demo_banner_dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl",
      "animate-in slide-in-from-top-10 fade-in duration-700 ease-out"
    )}>
      <div className="bg-gradient-to-r from-accent-primary to-primary text-white p-4 rounded-2xl shadow-2xl shadow-accent-primary/20 flex items-start gap-4 border border-white/20">
        <div className="bg-white/20 p-2 rounded-xl shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-bold text-sm md:text-base font-display">Selamat Datang di Demo SOKARA HRMS!</h3>
          <p className="text-white/80 text-xs md:text-sm mt-1 leading-relaxed">
            Data yang Anda lihat di sini adalah data simulasi (sandbox). 
            Gunakan tombol <strong className="text-white bg-black/20 px-1.5 py-0.5 rounded font-mono text-[10px]">DEMO (Kanan Bawah)</strong> untuk merubah role atau menyuntikkan data test.
          </p>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
