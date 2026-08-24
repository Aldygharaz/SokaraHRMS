// Lightweight Confetti particle system for Micro-Delight (Gusto UX benchmark)
// No dependencies, direct canvas DOM injection to avoid React re-renders

export function fireConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles: any[] = []
  const colors = ['#0984E3', '#00b894', '#fdcb6e', '#e84393', '#6c5ce7']

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 100, // Origin slightly below center
      r: Math.random() * 6 + 2,
      dx: Math.random() * 20 - 10,
      dy: Math.random() * -20 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleInc: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0
    })
  }

  let animationFrame: number
  let opacity = 1

  function render() {
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    opacity -= 0.005
    if (opacity <= 0) {
      cancelAnimationFrame(animationFrame)
      document.body.removeChild(canvas)
      return
    }

    ctx.globalAlpha = opacity

    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleInc
      p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2
      p.x += Math.sin(p.tiltAngle) * 2
      p.dy += 0.2 // Gravity
      p.x += p.dx
      p.y += p.dy

      ctx.beginPath()
      ctx.lineWidth = p.r
      ctx.strokeStyle = p.color
      ctx.moveTo(p.x + p.tilt + p.r, p.y)
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r)
      ctx.stroke()
    })

    animationFrame = requestAnimationFrame(render)
  }

  render()
}
