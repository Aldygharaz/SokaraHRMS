import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, ClipboardCheck, Wallet, Target } from 'lucide-react'

export function BottomNav() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/calendar', icon: Calendar, label: 'Shift' },
    { to: '/attendance', icon: ClipboardCheck, label: 'Absen' },
    { to: '/goals', icon: Target, label: 'OKR' },
    { to: '/payroll', icon: Wallet, label: 'Payroll' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-outline pb-safe pt-2 px-2 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({isActive}) => cn(
              "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 relative",
              isActive ? "text-accent-primary" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {({isActive}) => (
              <>
                <div className={cn("absolute inset-0 bg-accent-primary/10 rounded-xl transition-transform duration-300 scale-0", isActive ? "scale-100" : "")} />
                <item.icon className={cn("w-5 h-5 mb-1 transition-all duration-300 relative z-10", isActive ? "scale-110" : "")} />
                <span className="text-[9px] font-bold tracking-wide relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
