// Web Audio API lightweight sound synthesizer (0 network latency, 0 external assets)
import { useHRStore } from '@/store/useHRStore'

class SoundFX {
  private ctx: AudioContext | null = null

  private getContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  playClick() {
    if (!useHRStore.getState().soundEnabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch {
      // AudioContext fallback ignore
    }
  }

  playSuccess() {
    if (!useHRStore.getState().soundEnabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(523.25, now) // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08) // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.16) // G5

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1046.50, now + 0.16) // C6

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc1.stop(now + 0.35)
      osc2.start(now + 0.16)
      osc2.stop(now + 0.35)
    } catch {
      // Ignore
    }
  }

  playWarning() {
    if (!useHRStore.getState().soundEnabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.setValueAtTime(260, now + 0.1)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundFX()
