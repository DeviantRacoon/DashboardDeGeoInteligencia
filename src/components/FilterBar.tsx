import { useState } from 'react'
import { CLIENTS, MANAGERS, TEAMS, type Filters } from '../data'
import { Badge, Field, Icon, inputCls, paths } from './ui'

const finLabel = { si: 'Finalizadas', no: 'No finalizadas', todas: '' }

export function FilterBar({ draft, applied, setDraft, onApply }: { draft: Filters; applied: Filters; setDraft: (f: Filters) => void; onApply: (f: Filters) => void }) {
  const [adv, setAdv] = useState(false)
  const set = (p: Partial<Filters>) => setDraft({ ...draft, ...p })
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied)
  const advCount = [draft.team, draft.manager, draft.finished !== 'todas'].filter(Boolean).length
  const chips: { k: string; label: string; value: string; clear?: Partial<Filters> }[] = [
    { k: 'p', label: 'Periodo', value: `${applied.start} → ${applied.end}` },
    applied.client && { k: 'c', label: 'Cliente', value: applied.client, clear: { client: '', template: '' } },
    applied.template && { k: 't', label: 'Plantilla', value: applied.template, clear: { template: '' } },
    applied.team && { k: 'e', label: 'Equipo', value: applied.team, clear: { team: '' } },
    applied.manager && { k: 'g', label: 'Gerente', value: applied.manager, clear: { manager: '' } },
    applied.finished !== 'todas' && { k: 'f', label: 'Bases', value: finLabel[applied.finished], clear: { finished: 'todas' as const } },
  ].filter(Boolean) as never
  const activeCount = chips.length - 1
  const clearAll = () => { const f = { ...applied, client: '', template: '', team: '', manager: '', finished: 'todas' as const }; setDraft(f); onApply(f) }
  const remove = (c: Partial<Filters>) => { const f = { ...applied, ...c }; setDraft({ ...draft, ...c }); onApply(f) }

  return (
    <section aria-label="Filtros" className="mt-5 rounded-md border border-stone-200/80 bg-white p-5 transition-colors duration-300">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Fecha inicial"><input type="date" className={inputCls} value={draft.start} max={draft.end} onChange={(e) => set({ start: e.target.value })} /></Field>
        <Field label="Fecha final"><input type="date" className={inputCls} value={draft.end} min={draft.start} onChange={(e) => set({ end: e.target.value })} /></Field>
        <Field label="Cliente"><select className={inputCls} value={draft.client} onChange={(e) => set({ client: e.target.value, template: '' })}><option value="">Todos</option>{Object.keys(CLIENTS).map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Plantilla"><select className={inputCls} value={draft.template} disabled={!draft.client} onChange={(e) => set({ template: e.target.value })}><option value="">{draft.client ? 'Seleccionar' : 'Elige un cliente'}</option>{(CLIENTS[draft.client] ?? []).map((t) => <option key={t}>{t}</option>)}</select></Field>
      </div>

      <button onClick={() => setAdv(!adv)} aria-expanded={adv} className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 -ml-2 text-sm font-semibold text-teal-700 transition duration-200 hover:bg-teal-50">
        <Icon d={adv ? paths.up : paths.down} />Filtros avanzados
        {advCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-600 px-1 text-[11px] text-white">{advCount}</span>}
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${adv ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden"><div className="grid gap-4 pt-3 sm:grid-cols-3">
          <Field label="Equipo"><select className={inputCls} value={draft.team} onChange={(e) => set({ team: e.target.value })}><option value="">Todos</option>{TEAMS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Gerente"><select className={inputCls} value={draft.manager} onChange={(e) => set({ manager: e.target.value })}><option value="">Todos</option>{MANAGERS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Bases finalizadas"><select className={inputCls} value={draft.finished} onChange={(e) => set({ finished: e.target.value as Filters['finished'] })}><option value="todas">Todas</option><option value="si">Finalizadas</option><option value="no">No finalizadas</option></select></Field>
        </div></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Aplicados · {activeCount}</span>
        {chips.map((c) => <Badge key={c.k + c.value} label={c.label} value={c.value} onRemove={c.clear ? () => remove(c.clear!) : undefined} />)}
        {dirty && <Badge tone="amber" pulse value="Cambios sin aplicar — pulsa Buscar" />}
        {activeCount > 0 && <button onClick={clearAll} className="ml-auto rounded-md px-2 py-1 text-xs font-semibold text-stone-500 transition duration-200 hover:bg-stone-100 hover:text-stone-800">Limpiar filtros</button>}
      </div>
    </section>
  )
}
