import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2800)
    const doneTimer = setTimeout(onDone, 3500)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-700 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── Base: warm ivory-cream ── */}
      <div className="absolute inset-0" style={{ background: '#F5EFE0' }} />

      {/* ── Festive radial light — warm amber centre glow ── */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(232,185,80,0.38) 0%, rgba(201,140,60,0.18) 45%, transparent 75%)'
      }} />

      {/* ── Top-left jewel bloom — deep rose/magenta ── */}
      <div className="absolute" style={{
        top: '-10%', left: '-8%', width: '55%', height: '55%',
        background: 'radial-gradient(circle, rgba(180,60,90,0.22) 0%, transparent 70%)',
        filter: 'blur(40px)'
      }} />

      {/* ── Bottom-right jewel bloom — deep teal/emerald ── */}
      <div className="absolute" style={{
        bottom: '-10%', right: '-8%', width: '55%', height: '55%',
        background: 'radial-gradient(circle, rgba(30,100,90,0.20) 0%, transparent 70%)',
        filter: 'blur(40px)'
      }} />

      {/* ── Top-right warm saffron accent ── */}
      <div className="absolute" style={{
        top: '-5%', right: '-5%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(220,130,40,0.20) 0%, transparent 70%)',
        filter: 'blur(32px)'
      }} />

      {/* ── Bottom-left soft violet accent ── */}
      <div className="absolute" style={{
        bottom: '-5%', left: '-5%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(110,60,160,0.15) 0%, transparent 70%)',
        filter: 'blur(32px)'
      }} />

      {/* ── Vignette to keep edges rich and frame the centre ── */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(60,30,10,0.28) 100%)'
      }} />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">

        {/* Top rule */}
        <div className="w-px h-10 animate-grow-down mb-7" style={{ background: 'rgba(160,100,30,0.5)' }} />

        {/* Logo — multiply blend so white disappears into the warm bg */}
        <div
          className="animate-fade-in mb-5"
          style={{ animationDuration: '1.1s', mixBlendMode: 'multiply' }}
        >
          <img
            src="/astrimi-logo.png"
            alt="ASTRIMI"
            className="w-32 sm:w-44 object-contain"
          />
        </div>

        {/* Brand name */}
        <p
          className="font-display tracking-[0.5em] text-[11px] uppercase animate-fade-in"
          style={{
            animationDelay: '0.5s', animationDuration: '1s',
            color: '#7A4E1A'
          }}
        >
          Shine Your Own Light
        </p>

        {/* Gold gradient rule */}
        <div
          className="mt-5 h-px animate-expand"
          style={{
            width: '110px',
            animationDelay: '0.85s',
            background: 'linear-gradient(to right, transparent, #C9A84C, transparent)'
          }}
        />

        {/* Tagline */}
        <p
          className="mt-4 text-[9px] tracking-widest2 uppercase animate-fade-in font-body"
          style={{
            animationDelay: '1.15s', animationDuration: '1s',
            color: 'rgba(140,90,30,0.75)'
          }}
        >
          Rare by Design &nbsp;·&nbsp; Beyond Ordinary
        </p>

        {/* Bottom rule */}
        <div
          className="w-px h-10 animate-grow-down mt-7"
          style={{ background: 'rgba(160,100,30,0.5)', animationDelay: '0.3s' }}
        />
      </div>
    </div>
  )
}
