import type { DragEvent, ReactNode } from 'react'
import { Icon, Segmented, paths } from './ui'
import type { Span } from '../hooks/useLayout'

export type PState = 'loading' | 'empty' | 'unavailable' | 'ok'
export type EditProps = {
  index: number; count: number; dragging: boolean; over: boolean
  onSize: (s: Span) => void; onMove: (delta: number) => void; onHide: () => void
  dragProps: { draggable: boolean; onDragStart: (e: DragEvent) => void; onDragOver: (e: DragEvent) => void; onDrop: (e: DragEvent) => void; onDragEnd: () => void }
}
export const SPANS = { 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4', 6: 'lg:col-span-6' } as const
const SIZES: { v: Span; l: string }[] = [{ v: 2, l: '1/3' }, { v: 3, l: '1/2' }, { v: 4, l: '2/3' }, { v: 6, l: 'Todo' }]

function Notice({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="fade flex flex-1 flex-col items-center justify-center rounded-md bg-stone-50 px-6 py-8 text-center">
      <span className="mb-3 grid size-10 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-stone-200"><Icon d={icon} className="size-5" /></span>
      <p className="text-sm font-bold">{title}</p><p className="mt-1 max-w-xs text-xs text-stone-500">{text}</p>
    </div>
  )
}

export function Panel({ title, sub, state, message, onData, actions, edit, span, delay = 0, children }: {
  span: Span; title: string; sub?: string; state: PState; message?: string; onData?: () => void; actions?: ReactNode; edit?: EditProps; delay?: number; children: ReactNode
}) {
  return (
    <div {...edit?.dragProps} style={{ '--d': `${delay}ms` } as React.CSSProperties}
      className={`rise ${SPANS[span]} col-span-6 min-w-0 transition-[opacity,transform] duration-300 ${edit?.dragging ? 'scale-[.98] opacity-40' : ''}`}>
      <section className={`@container flex h-full flex-col rounded-md border bg-white p-5 transition duration-300 ${edit ? (edit.over ? 'border-teal-500 bg-teal-50/40' : 'border-dashed border-stone-300 hover:border-teal-400') : 'border-stone-200/80 hover:border-stone-300'}`}>
        {edit && (
          <div className="fade -mt-1 mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-stone-200 pb-3">
            <span className="flex cursor-grab items-center gap-1 text-xs font-semibold text-stone-500 active:cursor-grabbing"><Icon d={paths.grip} className="size-4" />Arrastrar</span>
            <div className="flex items-center gap-2">
              <Segmented label="Ancho del panel" value={span} options={SIZES} onChange={edit.onSize} />
              <div className="flex">
                <button aria-label="Mover antes" disabled={edit.index === 0} onClick={() => edit.onMove(-1)} className="rounded p-1.5 text-stone-500 transition duration-200 hover:bg-stone-100 disabled:opacity-30"><Icon d={paths.left} className="size-3.5" /></button>
                <button aria-label="Mover después" disabled={edit.index === edit.count - 1} onClick={() => edit.onMove(1)} className="rounded p-1.5 text-stone-500 transition duration-200 hover:bg-stone-100 disabled:opacity-30"><Icon d={paths.right} className="size-3.5" /></button>
                <button aria-label="Ocultar panel" onClick={edit.onHide} className="rounded p-1.5 text-stone-500 transition duration-200 hover:bg-rose-50 hover:text-rose-600"><Icon d={paths.eyeOff} className="size-3.5" /></button>
              </div>
            </div>
          </div>
        )}
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0"><h2 className="text-[15px] font-bold tracking-tight">{title}</h2>{sub && <p className="mt-0.5 truncate text-xs text-stone-500">{sub}</p>}</div>
          <div className="flex shrink-0 items-center gap-3">
            {actions}
            {onData && state === 'ok' && <button onClick={onData} className="rounded-md px-2 py-1 text-xs font-semibold text-teal-700 transition duration-200 hover:bg-teal-50">Ver datos</button>}
          </div>
        </header>
        <div key={state} className="flex min-h-52 flex-1 flex-col">
          {state === 'loading' && (
            <div role="status" aria-label="Cargando" className="fade flex flex-1 flex-col gap-3"><div className="skeleton h-4 w-1/3 rounded" /><div className="skeleton min-h-32 flex-1 rounded-md" /><div className="skeleton h-4 w-2/3 rounded" /></div>
          )}
          {state === 'empty' && <Notice icon={paths.info} title="Sin datos en el periodo" text={message ?? 'No hay registros para los filtros aplicados. Prueba ampliando las fechas.'} />}
          {state === 'unavailable' && <Notice icon={paths.lock} title="Información no disponible" text={message ?? 'No pudimos cargar este panel.'} />}
          {state === 'ok' && <div className="fade flex flex-1 flex-col">{children}</div>}
        </div>
      </section>
    </div>
  )
}
