import type { ReactNode } from 'react'

export function Icon({ d, className = 'size-4' }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><path d={d} /></svg>
}
export const paths = {
  search: 'M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 21h16',
  x: 'M6 6l12 12M18 6L6 18',
  up: 'M5 15l7-7 7 7', down: 'M19 9l-7 7-7-7',
  left: 'M15 19l-7-7 7-7', right: 'M9 5l7 7-7 7',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  grip: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  eyeOff: 'M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.7 9.7 0 0112 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.4 3.5M6.6 6.6C4.4 8 2.9 10.2 2 12c1 2.5 5 7 10 7 1.5 0 2.9-.4 4.1-1',
  plus: 'M12 5v14M5 12h14',
  reset: 'M4 4v6h6M20 20v-6h-6M20 10A8 8 0 006.3 6.3L4 10m16 4l-2.3 3.7A8 8 0 014 14',
  info: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4',
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">{label}{children}</label>
}
export const inputCls = 'h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm normal-case tracking-normal text-stone-900 outline-none transition duration-200 hover:border-stone-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-stone-50 disabled:text-stone-400'

type Tone = 'teal' | 'amber' | 'stone' | 'indigo'
const tones: Record<Tone, string> = {
  teal: 'bg-teal-50 text-teal-900 ring-teal-200/70', amber: 'bg-amber-50 text-amber-900 ring-amber-200/80',
  stone: 'bg-stone-100 text-stone-700 ring-stone-200', indigo: 'bg-indigo-50 text-indigo-900 ring-indigo-200/70',
}
export function Badge({ tone = 'teal', label, value, onRemove, pulse }: { tone?: Tone; label?: string; value: string; onRemove?: () => void; pulse?: boolean }) {
  return (
    <span className={`pop inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium ring-1 ring-inset transition-colors duration-200 ${tones[tone]}`}>
      {pulse && <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />}
      {label && <span className="opacity-60">{label}</span>}{value}
      {onRemove && <button onClick={onRemove} aria-label={`Quitar ${label ?? value}`} className="-mr-1 grid size-4 place-items-center rounded transition-colors duration-200 hover:bg-black/10"><Icon d={paths.x} className="size-3" /></button>}
    </span>
  )
}

export function Button({ variant = 'ghost', className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'glass' | 'outline' }) {
  const v = {
    primary: 'bg-teal-600 text-white hover:bg-teal-500 active:scale-[.98]',
    glass: 'border border-white/40 text-white backdrop-blur-sm hover:bg-white/15',
    outline: 'border border-stone-200 bg-white text-stone-800 hover:border-stone-300 hover:bg-stone-50',
    ghost: 'text-stone-600 hover:bg-stone-100',
  }[variant]
  return <button {...p} className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${v} ${className}`} />
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md bg-stone-100 p-0.5">
      {options.map((o) => <button key={o.v} onClick={() => onChange(o.v)} aria-pressed={o.v === value} className={`rounded px-2 py-1 text-xs font-semibold transition duration-200 ${o.v === value ? 'bg-white text-teal-800 ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-800'}`}>{o.l}</button>)}
    </div>
  )
}
