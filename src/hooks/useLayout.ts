import { useCallback, useEffect, useState } from 'react'

export type PanelId = 'total' | 'teams' | 'top' | 'results' | 'km'
export type Span = 2 | 3 | 4 | 6
export type Layout = { order: PanelId[]; size: Record<PanelId, Span>; hidden: PanelId[] }
export const DEFAULT_LAYOUT: Layout = {
  order: ['total', 'teams', 'top', 'results', 'km'],
  size: { total: 6, teams: 3, top: 3, results: 3, km: 3 },
  hidden: [],
}
const KEY = 'skylogic.layout.v1'

export function useLayout() {
  const [layout, setLayout] = useState<Layout>(() => {
    try { return { ...DEFAULT_LAYOUT, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return DEFAULT_LAYOUT }
  })
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(layout)) }, [layout])
  const move = useCallback((id: PanelId, to: number) => setLayout((l) => {
    const order = l.order.filter((x) => x !== id); order.splice(Math.max(0, Math.min(to, order.length)), 0, id); return { ...l, order }
  }), [])
  const moveBefore = useCallback((id: PanelId, target: PanelId) => setLayout((l) => {
    if (id === target) return l
    const order = l.order.filter((x) => x !== id); order.splice(order.indexOf(target), 0, id); return { ...l, order }
  }), [])
  const resize = useCallback((id: PanelId, s: Span) => setLayout((l) => ({ ...l, size: { ...l.size, [id]: s } })), [])
  const hide = useCallback((id: PanelId) => setLayout((l) => ({ ...l, hidden: [...l.hidden, id] })), [])
  const show = useCallback((id: PanelId) => setLayout((l) => ({ ...l, hidden: l.hidden.filter((x) => x !== id) })), [])
  const reset = useCallback(() => setLayout(DEFAULT_LAYOUT), [])
  return { layout, move, moveBefore, resize, hide, show, reset }
}
