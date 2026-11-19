import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from 'react'
import { FIELDS, USERS, buildData, hasPeriodData, type Filters } from './data'
import { Bars, KmChart, StackBar } from './components/charts'
import { DataModal } from './components/DataModal'
import { FilterBar } from './components/FilterBar'
import { Panel, type PState } from './components/Panel'
import { Badge, Button, Field, Icon, inputCls, paths } from './components/ui'
import { useLayout, type PanelId } from './hooks/useLayout'

const iso = (d: Date) => d.toISOString().slice(0, 10)
const today = new Date()
const initial: Filters = { start: iso(new Date(today.getTime() - 29 * 864e5)), end: iso(today), client: 'Aerotec Minera', template: 'Inspección de predios', team: '', manager: '', finished: 'todas' }
const nf = new Intl.NumberFormat('es')
const NAMES: Record<PanelId, string> = { total: 'Total de registros', teams: 'Asignaciones por equipo', top: 'Top 10 de registros localizados', results: 'Resultados obtenidos', km: 'Kilometraje total' }
type Modal = { title: string; cols: string[]; rows: (string | number)[][] }

export default function App() {
  const [draft, setDraft] = useState<Filters>(initial)
  const [applied, setApplied] = useState<Filters>(initial)
  const [loading, setLoading] = useState(true)
  const [canExport, setCanExport] = useState(true)
  const [canKm, setCanKm] = useState(true)
  const [modal, setModal] = useState<Modal | null>(null)
  const [selUser, setSelUser] = useState<string | null>(null)
  const [field, setField] = useState(FIELDS.default[0].label)
  const [resUser, setResUser] = useState('Todos')
  const [editing, setEditing] = useState(false)
  const [dragId, setDragId] = useState<PanelId | null>(null)
  const [overId, setOverId] = useState<PanelId | null>(null)
  const { layout, moveBefore, move, resize, hide, show, reset } = useLayout()

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
  const apply = (f: Filters) => { setApplied(f); setLoading(true); setSelUser(null); setTimeout(() => setLoading(false), 700) }

  const data = useMemo(() => buildData(applied), [applied])
  const base: PState = loading ? 'loading' : hasPeriodData(applied) ? 'ok' : 'empty'
  const total = data.status.reduce((s, i) => s + i.value, 0)
  const teamTotal = data.teams.reduce((s, t) => s + t.value, 0)
  const exportable = !!applied.client && !!applied.template && canExport
  const exportWhy = !canExport ? 'No tienes permiso de exportación' : !applied.client || !applied.template ? 'Selecciona cliente y plantilla y pulsa Buscar' : ''
  const user = data.users.find((u) => u.name === selUser)
  const resItems = data.results[field][resUser]
  const stats = [...data.status.map((x) => ({ ...x, pct: (x.value / total) * 100 })), { label: 'Históricos', value: data.historic, color: '#a8a29e', pct: null as number | null }]

  const download = () => {
    const rows = [['Seccion', 'Concepto', 'Valor'], ...data.status.map((s) => ['Registros', s.label, s.value]), ['Registros', 'Históricos', data.historic], ...data.teams.map((t) => ['Asignaciones', t.label, t.value]), ...data.users.map((u) => ['Top 10', u.name, u.score]), ...(canKm ? data.km.map((k) => ['Kilometraje', k.label, k.value]) : [])]
    const csv = [['Cliente', applied.client], ['Plantilla', applied.template], ['Periodo', `${applied.start} a ${applied.end}`], [], ...rows].map((r) => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = `skylogic-${applied.client}-${applied.end}.csv`.replace(/\s/g, '_'); a.click()
  }

  const visible = layout.order.filter((id) => !layout.hidden.includes(id))
  const body: Record<PanelId, ReactNode> = {
    total: (
      <Panel span={layout.size.total} delay={0} title={NAMES.total} sub={`${nf.format(total)} en el periodo, sin contar históricos`} state={base} {...ed('total')}
        onData={() => setModal({ title: NAMES.total, cols: ['Estado', 'Cantidad', '%'], rows: [...data.status.map((x) => [x.label, x.value, ((x.value / total) * 100).toFixed(1) + '%']), ['Históricos', data.historic, '—']] })}>
        <div className="flex flex-1 flex-col justify-center gap-6">
          <StackBar items={data.status} />
          <dl className="grid grid-cols-2 gap-y-5 @lg:grid-cols-5 @lg:divide-x @lg:divide-stone-100">
            {stats.map((x, i) => (
              <div key={x.label} className={i ? '@lg:pl-6' : ''}>
                <dt className="flex items-center gap-2 text-xs font-semibold text-stone-500"><span className="size-2 rounded-full" style={{ background: x.color }} />{x.label}</dt>
                <dd className="mt-1 text-3xl font-extrabold tracking-tight">{nf.format(x.value)}</dd>
                <dd className="text-xs text-stone-500">{x.pct === null ? 'Fuera del periodo' : `${x.pct.toFixed(1)}%`}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Panel>
    ),
    teams: (
      <Panel span={layout.size.teams} delay={80} title={NAMES.teams} sub={`${nf.format(teamTotal)} asignaciones en total`} state={base} {...ed('teams')}
        onData={() => setModal({ title: NAMES.teams, cols: ['Equipo', 'Asignaciones'], rows: [...data.teams.map((t) => [t.label, t.value]), ['Total', teamTotal]] })}>
        <div className="flex flex-1 flex-col justify-between gap-4">
          <Bars items={data.teams} />
          <div className="flex items-baseline justify-between border-t border-stone-100 pt-3 text-sm"><span className="text-stone-500">Total de asignaciones</span><b className="text-2xl font-extrabold">{nf.format(teamTotal)}</b></div>
        </div>
      </Panel>
    ),
    top: (
      <Panel span={layout.size.top} delay={160} title={NAMES.top} sub="Selecciona una persona para ver su detalle" state={base} {...ed('top')}
        onData={() => setModal({ title: 'Top 10', cols: ['Pos.', 'Usuario', 'Puntuación'], rows: data.users.map((u, i) => [i + 1, u.name, u.score]) })}>
        <div className="grid flex-1 gap-5 @md:grid-cols-[1fr_180px]">
          <ol className="space-y-0.5">
            {data.users.map((u, i) => (
              <li key={u.name}><button onClick={() => setSelUser(u.name === selUser ? null : u.name)} aria-pressed={selUser === u.name} className={`flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-left text-sm transition duration-200 ${selUser === u.name ? 'bg-teal-600 text-white' : 'hover:bg-stone-100'}`}>
                <span className={`w-5 font-mono text-xs ${selUser === u.name ? 'text-teal-100' : 'text-stone-400'}`}>{String(i + 1).padStart(2, '0')}</span><span className="flex-1 truncate">{u.name}</span><b className="font-mono text-xs">{u.score}</b></button></li>
            ))}
          </ol>
          <aside className="rounded-md bg-stone-50 p-4 text-sm">
            {user ? (
              <dl key={user.name} className="fade space-y-3">
                {[['Usuario', user.name], ['Equipo', user.team], ['Puntuación', user.score], ['Bases completadas', user.done], ['Kilometraje', canKm ? `${user.km} km` : 'Sin permiso']].map(([k, v]) => <div key={k}><dt className="text-xs uppercase text-stone-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
              </dl>
            ) : <p className="text-xs text-stone-500">Elige a una persona del ranking para ver su detalle.</p>}
          </aside>
        </div>
      </Panel>
    ),
    results: (
      <Panel span={layout.size.results} delay={240} title={NAMES.results} sub={applied.template ? `Plantilla: ${applied.template}` : undefined} state={!applied.template ? 'unavailable' : base}
        message="Selecciona una plantilla y pulsa Buscar para ver los resultados por campo." {...ed('results')}
        onData={() => setModal({ title: NAMES.results, cols: ['Opción', 'Cantidad'], rows: resItems.map((r) => [r.label, r.value]) })}>
        <div className="flex flex-1 flex-col gap-5">
          <div className="grid gap-3 @sm:grid-cols-2">
            <Field label="Campo"><select className={inputCls} value={field} onChange={(e) => setField(e.target.value)}>{FIELDS.default.map((f) => <option key={f.label}>{f.label}</option>)}</select></Field>
            <Field label="Usuario"><select className={inputCls} value={resUser} onChange={(e) => setResUser(e.target.value)}><option>Todos</option>{USERS.map((u) => <option key={u}>{u}</option>)}</select></Field>
          </div>
          <div key={field + resUser} className="fade flex flex-1 flex-col justify-center"><Bars items={resItems} color="#6366f1" /></div>
        </div>
      </Panel>
    ),
    km: (
      <Panel span={layout.size.km} delay={320} title={NAMES.km} sub="Kilómetros recorridos por fecha" state={!canKm ? 'unavailable' : base}
        message="No tienes permiso para consultar el kilometraje. Solicítalo a tu administrador." {...ed('km')}
        onData={() => setModal({ title: NAMES.km, cols: ['Fecha', 'Kilómetros'], rows: data.km.map((k) => [k.label, k.value]) })}
        actions={base === 'ok' && canKm ? <Badge tone="stone" value={`${nf.format(Math.round(data.km.reduce((x, k) => x + k.value, 0)))} km`} /> : null}>
        <KmChart items={data.km} />
      </Panel>
    ),
  }

  function ed(id: PanelId) {
    if (!editing) return {}
    const index = visible.indexOf(id)
    return { edit: {
      index, count: visible.length, dragging: dragId === id, over: overId === id && dragId !== id,
      onSize: (s: 2 | 3 | 4 | 6) => resize(id, s),
      onMove: (d: number) => move(id, layout.order.indexOf(visible[index + d])),
      onHide: () => hide(id),
      dragProps: {
        draggable: true,
        onDragStart: (e: DragEvent) => { setDragId(id); e.dataTransfer.effectAllowed = 'move' },
        onDragOver: (e: DragEvent) => { e.preventDefault(); setOverId(id) },
        onDrop: (e: DragEvent) => { e.preventDefault(); if (dragId) moveBefore(dragId, id); setDragId(null); setOverId(null) },
        onDragEnd: () => { setDragId(null); setOverId(null) },
      },
    } }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-12 pt-5 lg:px-8">
      <header className="rise relative overflow-hidden rounded-md">
        <img src="https://images.unsplash.com/photo-1508233620467-f79f1e317a05?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1800&h=500" alt="Vista aérea de un camino y terreno" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-stone-950/5" />
        <div className="relative flex flex-wrap items-end justify-between gap-4 p-6 text-white sm:p-8">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Skylogic</p>
            <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="mt-1.5 max-w-lg text-sm text-stone-200">Avance de la georreferenciación: registros, asignaciones, desempeño del equipo, resultados de campo y kilometraje.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => apply(draft)}><Icon d={paths.search} />Buscar</Button>
            <Button variant="glass" onClick={download} disabled={!exportable} title={exportWhy}><Icon d={paths.download} />Descargar reporte</Button>
          </div>
        </div>
      </header>

      <FilterBar draft={draft} applied={applied} setDraft={setDraft} onApply={apply} />

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          {editing ? <span className="fade">Arrastra los paneles, cambia su ancho o ocúltalos. Los cambios se guardan solos.</span> : <span className="fade">{visible.length} paneles</span>}
        </div>
        <div className="flex items-center gap-2">
          {editing && <Button variant="ghost" className="h-9 fade" onClick={reset}><Icon d={paths.reset} className="size-3.5" />Restablecer</Button>}
          <Button variant={editing ? 'primary' : 'outline'} className="h-9" onClick={() => setEditing(!editing)} aria-pressed={editing}><Icon d={editing ? paths.x : paths.grid} className="size-3.5" />{editing ? 'Listo' : 'Editar grilla'}</Button>
        </div>
      </div>

      {editing && layout.hidden.length > 0 && (
        <div className="fade mb-4 flex flex-wrap items-center gap-2 rounded-md border border-dashed border-stone-300 p-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ocultos</span>
          {layout.hidden.map((id) => <button key={id} onClick={() => show(id)} className="pop inline-flex h-7 items-center gap-1.5 rounded-md bg-stone-100 px-2.5 text-xs font-medium text-stone-700 ring-1 ring-inset ring-stone-200 transition duration-200 hover:bg-teal-50 hover:text-teal-900"><Icon d={paths.plus} className="size-3" />{NAMES[id]}</button>)}
        </div>
      )}

      <div className="grid grid-cols-6 gap-5">{visible.map((id) => <Fragment2 key={id}>{body[id]}</Fragment2>)}</div>
      {visible.length === 0 && <p className="py-16 text-center text-sm text-stone-500">Todos los paneles están ocultos. Activa «Editar grilla» para restaurarlos.</p>}

      <footer className="mt-12 flex flex-wrap items-center gap-4 border-t border-stone-200 pt-4 text-xs text-stone-500">
        <span className="font-semibold uppercase tracking-wide">Permisos de demostración</span>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={canExport} onChange={(e) => setCanExport(e.target.checked)} />Exportar</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={canKm} onChange={(e) => setCanKm(e.target.checked)} />Kilometraje</label>
      </footer>
      {modal && <DataModal {...modal} onClose={() => setModal(null)} />}
    </div>
  )
}
function Fragment2({ children }: { children: ReactNode }) { return <>{children}</> }
