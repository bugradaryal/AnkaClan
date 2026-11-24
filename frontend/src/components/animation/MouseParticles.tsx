
import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  phase: number
  size: number
  speed: number
}

export default function MouseParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let frame = 0

    const mouse = { x: -1000, y: -1000 }
    const particles: Particle[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      particles.length = 0

      for (let i = 0; i < 70; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          phase: Math.random() * Math.PI * 2,
          size: Math.random() * 0.9 + 0.8,
          speed: Math.random() * 0.35 + 0.15,
        })
      }
    }

    const handleMouseMove = (event: PointerEvent) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const positions = particles.map((particle) => {
        particle.phase += particle.speed * 0.058

        return {
          x: particle.x + Math.sin(particle.phase) * 1.2,
          y: particle.y + Math.cos(particle.phase * 0.8) * 1.5,
          size: particle.size,
        }
      })

      // Mouse-to-particle connections
      positions.forEach((point) => {
        const dx = point.x - mouse.x
        const dy = point.y - mouse.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 125

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.32

          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(point.x, point.y)
          ctx.strokeStyle = `rgba(205, 155, 165, ${opacity})`
          ctx.lineWidth = 0.9
          ctx.stroke()
        }
      })

      // Subtle connections between nearby particles
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i]
          const b = positions[j]

          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 110) {
            const opacity = (1 - distance / 110) * 0.09

            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(205, 195, 205, ${opacity})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      // Small particles
      positions.forEach((point) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(220, 225, 235, 0.42)'
        ctx.fill()
      })

      frame = requestAnimationFrame(draw)
    }

    resize()

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handleMouseMove)
    window.addEventListener('pointerleave', handleMouseLeave)

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handleMouseMove)
      window.removeEventListener('pointerleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="mouse-particles"
      aria-hidden="true"
    />
  )
}
