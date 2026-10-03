
export function GenericPage({ title, description, icon: Icon }: { title: string, description: string, icon: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 h-full flex flex-col">
      {/* Standardized Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-primary/10 rounded-lg border border-accent-primary/20 text-accent-primary shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">{title}</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      <div className="surface-card rounded-xl flex-1 border border-outline flex flex-col items-center justify-center min-h-[380px] text-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline">
          <Icon className="w-7 h-7 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-on-surface">Modul {title}</h3>
          <p className="text-on-surface-variant text-xs max-w-md mx-auto mt-1 leading-relaxed">
            Modul ini sedang disiapkan dalam integrasi operasional Sokara HR. Data akan terhubung langsung dengan sistem shift dan payroll.
          </p>
        </div>
        <button 
          onClick={() => window.location.hash = '#/dashboard'}
          className="mt-2 bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  )
}
