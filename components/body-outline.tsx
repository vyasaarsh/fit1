"use client"

export function BodyOutline() {
  return (
    <div className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
      <svg width="280" height="500" viewBox="0 0 280 500" fill="none" className="opacity-40">
        {/* Head */}
        <circle cx="140" cy="70" r="30" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />

        {/* Body */}
        <line x1="140" y1="100" x2="140" y2="250" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />

        {/* Arms */}
        <line x1="140" y1="130" x2="80" y2="180" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
        <line x1="140" y1="130" x2="200" y2="180" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />

        {/* Legs */}
        <line x1="140" y1="250" x2="100" y2="400" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
        <line x1="140" y1="250" x2="180" y2="400" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
      </svg>
    </div>
  )
}
