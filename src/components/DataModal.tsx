import { useEffect, useState } from 'react'
import { Icon, paths } from './ui'

export function DataModal({ title, cols, rows, onClose }: { title: string; cols: string[]; rows: (string | number)[][]; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(true); const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center bg-stone-900/30 p-4 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={`flex max-h-[80vh] w-full max-w-xl flex-col rounded-md border border-stone-200 bg-white transition duration-300 ${open ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[.98]'}`}>
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><h3 className="font-bold">Datos · {title}</h3><button onClick={onClose} aria-label="Cerrar" className="rounded-md p-1.5 text-stone-500 transition duration-200 hover:bg-stone-100"><Icon d={paths.x} /></button></div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-stone-50 text-left text-xs uppercase text-stone-500"><tr>{cols.map((c) => <th key={c} className="px-5 py-2.5 font-semibold">{c}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-stone-100 transition-colors duration-150 hover:bg-stone-50">{r.map((c, j) => <td key={j} className={`px-5 py-2 ${j > 0 ? 'font-mono text-xs' : ''}`}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
