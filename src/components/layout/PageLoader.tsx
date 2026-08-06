export function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="h-40 bg-surface-container-high rounded-3xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="h-32 bg-surface-container-high rounded-2xl w-full"></div>
        <div className="h-32 bg-surface-container-high rounded-2xl w-full"></div>
        <div className="h-32 bg-surface-container-high rounded-2xl w-full"></div>
        <div className="h-32 bg-surface-container-high rounded-2xl w-full"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-surface-container-high rounded-2xl w-full"></div>
        <div className="h-64 bg-surface-container-high rounded-2xl w-full"></div>
      </div>
    </div>
  )
}
