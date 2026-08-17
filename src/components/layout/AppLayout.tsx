
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { CommandPalette } from './CommandPalette'
import { PlaygroundPanel } from '../demo/PlaygroundPanel'
import { WelcomeBanner } from './WelcomeBanner'
import { ShortcutModal } from './ShortcutModal'
import { useHRStore } from '@/store/useHRStore'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

export function AppLayout() {
  const isSidebarCollapsed = useHRStore(state => state.isSidebarCollapsed)
  const toggleSidebar = useHRStore(state => state.toggleSidebar)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isSidebarCollapsed) {
        useHRStore.setState({ isSidebarCollapsed: true })
      }
    }
    
    // Initial check
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarCollapsed])

  return (
    <div className={cn("min-h-screen bg-surface dark:bg-surface text-on-surface flex", isSidebarCollapsed ? "sidebar-collapsed" : "")}>
      {/* Mobile overlay backdrop */}
      {!isSidebarCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <Sidebar />
      <main className={cn("flex-1 flex flex-col min-h-screen relative pb-20 md:pb-8 transition-all duration-300", isSidebarCollapsed ? "md:ml-20" : "md:ml-64")}>
        <Header />
        <div className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8 mb-16 md:mb-0">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <CommandPalette />
      <PlaygroundPanel />
      <WelcomeBanner />
      <ShortcutModal />
    </div>
  )
}
