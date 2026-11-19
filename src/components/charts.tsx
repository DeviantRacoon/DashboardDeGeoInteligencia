import { useEffect, useState } from 'react'
const nf = new Intl.NumberFormat('es')
function useMounted() { const [m, setM] = useState(false); useEffect(() => { const t = requestAnimationFrame(() => setM(true)); return () => cancelAnimationFrame(t) }, []); return m }

export function Bars({ items, color = '#0d9488' }: { items: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...items.map((i) => i.value), 1), m = useMounted()
  return (
    <ul className="flex flex-col justify-center gap-3.5">
      {items.map((i, k) => (
        <li key={i.label} className="grid grid-cols-[96px_1fr_44px] items-center gap-3 text-sm">
          <span className="truncate text-stone-600" title={i.label}>{i.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-stone-100"><span className="block h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: m ? `${(i.value / max) * 100}%` : 0, background: color, transitionDelay: `${k * 70}ms` }} /></span>
          <span className="text-right font-mono text-xs">{nf.format(i.value)}</span>
        </li>
      ))}
    </ul>
  )
}

export function StackBar({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0), m = useMounted()
  return (
    <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Distribución de registros por estado">
      {items.map((x) => <span key={x.label} className="rounded-full transition-[width] duration-700 ease-out" style={{ width: m ? `${(x.value / total) * 100}%` : 0, background: x.color }} />)}
    </div>
  )
}

export function KmChart({ items }: { items: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null), m = useMounted()
  const W = 560, H = 200, p = { l: 36, b: 22, t: 10, r: 6 }
  const max = Math.ceil(Math.max(...items.map((i) => i.value)) / 50) * 50
  const bw = (W - p.l - p.r) / items.length, h = hover !== null ? items[hover] : null
  return (
    <div className="relative">
      <div className={`absolute right-0 top-0 rounded-md bg-stone-800 px-2 py-1 text-xs text-white transition-opacity duration-200 ${h ? 'opacity-100' : 'opacity-0'}`}>{h ? `${h.label} · ${h.value} km` : ''}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0, 0.5, 1].map((t) => { const y = p.t + (H - p.t - p.b) * (1 - t); return <g key={t}><line x1={p.l} x2={W} y1={y} y2={y} stroke="#ececE8" /><text x={p.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#78716c">{Math.round(max * t)}</text></g> })}
        {items.map((i, k) => { const bh = (i.value / max) * (H - p.t - p.b); return <rect key={i.label} x={p.l + k * bw + 1} y={H - p.b - bh} width={Math.max(bw - 2, 1)} height={bh} rx="3" fill={hover === k ? '#0f766e' : '#5eead4'} className="origin-bottom transition duration-500 ease-out [transform-box:fill-box]" style={{ transform: m ? 'scaleY(1)' : 'scaleY(0)', transitionDelay: `${Math.min(k * 15, 500)}ms` }} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)} /> })}
        {[0, Math.floor(items.length / 2), items.length - 1].map((k) => <text key={k} x={p.l + k * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#78716c">{items[k].label.slice(5)}</text>)}
      </svg>
    </div>
  )
}
