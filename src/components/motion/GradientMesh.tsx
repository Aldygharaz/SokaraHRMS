import { useEffect, useRef } from 'react'

export function GradientMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let width = canvas.width = canvas.offsetWidth
    let height = canvas.height = canvas.offsetHeight
    let rafId: number

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    })

    const blobs = [
      { x: width * 0.2, y: height * 0.2, r: width * 0.4, vx: 0.5, vy: 0.3, color: 'rgba(9, 132, 227, 0.15)' },
      { x: width * 0.8, y: height * 0.8, r: width * 0.5, vx: -0.4, vy: -0.6, color: 'rgba(235, 69, 158, 0.15)' },
      { x: width * 0.5, y: height * 0.5, r: width * 0.6, vx: 0.6, vy: -0.4, color: 'rgba(14, 165, 233, 0.15)' },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      blobs.forEach(blob => {
        blob.x += blob.vx
        blob.y += blob.vy

        if (blob.x < -blob.r || blob.x > width + blob.r) blob.vx *= -1
        if (blob.y < -blob.r || blob.y > height + blob.r) blob.vy *= -1

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r)
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2)
        ctx.fill()
      })

      rafId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-screen"
      style={{ filter: 'blur(40px)' }}
    />
  )
}
