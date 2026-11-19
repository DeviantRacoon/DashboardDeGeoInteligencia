export type Filters = {
  start: string; end: string; client: string; template: string
  team: string; manager: string; finished: 'todas' | 'si' | 'no'
}
export const CLIENTS: Record<string, string[]> = {
  'Aerotec Minera': ['Inspección de predios', 'Georreferencia de pozos'],
  'Gobierno de Jalisco': ['Censo de infraestructura', 'Verificación catastral'],
  'Logística Andina': ['Puntos de entrega'],
}
export const TEAMS = ['Norte', 'Sur', 'Centro', 'Oriente', 'Occidente']
export const MANAGERS = ['Lucía Ferrer', 'Mateo Quiroga', 'Daniela Ortiz']
export const FIELDS: Record<string, { label: string; options: string[] }[]> = {
  default: [
    { label: 'Estado del predio', options: ['Habitado', 'Deshabitado', 'En construcción', 'Baldío'] },
    { label: 'Calidad de señal GPS', options: ['Excelente', 'Buena', 'Regular', 'Deficiente'] },
  ],
}
export const USERS = ['Camila Ríos', 'Andrés Valdez', 'Sofía Montoya', 'Iván Paredes', 'Valeria Núñez', 'Tomás Herrera', 'Renata Solís', 'Bruno Cárdenas', 'Elena Salazar', 'Diego Lara', 'Marina Ibarra', 'Pablo Rojas']

function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
function rng(seed: string) { let a = hash(seed); return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const key = (f: Filters) => JSON.stringify(f)

export function dayList(start: string, end: string) {
  const out: string[] = []
  const d = new Date(start + 'T00:00:00Z'), e = new Date(end + 'T00:00:00Z')
  while (d <= e && out.length < 62) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1) }
  return out
}
export const hasPeriodData = (f: Filters) => !!f.start && !!f.end && f.start <= f.end && f.end >= '2024-01-01'

export function buildData(f: Filters) {
  const r = rng(key(f))
  const days = dayList(f.start, f.end)
  const scale = Math.max(1, days.length) * (f.team ? 0.4 : 1) * (f.manager ? 0.6 : 1)
  const loc = Math.round(r() * 300 * scale + 400)
  const pen = Math.round(r() * 120 * scale + 80)
  const err = Math.round(r() * 30 * scale + 15)
  const nue = Math.round(r() * 60 * scale + 30)
  const status = [
    { label: 'Localizados', value: loc, color: '#0f766e' },
    { label: 'Pendientes', value: pen, color: '#d97706' },
    { label: 'Con error', value: err, color: '#e11d48' },
    { label: 'Nuevos', value: nue, color: '#4f46e5' },
  ]
  const historic = Math.round(r() * 5000 + 2000)
  const teams = (f.team ? [f.team] : TEAMS).map((t) => ({ label: t, value: Math.round(r() * 120 * Math.sqrt(scale) + 40) }))
  const users = USERS.map((u) => ({ name: u, score: Math.round(r() * 400 * Math.sqrt(scale) + 60), km: Math.round(r() * 900 + 100) / 10, team: TEAMS[Math.floor(r() * 5)], done: Math.round(r() * 90 + 10) }))
    .sort((a, b) => b.score - a.score).slice(0, 10)
  const results: Record<string, Record<string, { label: string; value: number }[]>> = {}
  for (const fl of FIELDS.default) {
    results[fl.label] = {}
    for (const u of ['Todos', ...USERS]) results[fl.label][u] = fl.options.map((o) => ({ label: o, value: Math.round(r() * (u === 'Todos' ? 220 : 40) + 5) }))
  }
  const km = days.map((d) => ({ label: d, value: Math.round((r() * 160 + 40) * 10) / 10 }))
  return { status, historic, teams, users, results, km }
}
export type Data = ReturnType<typeof buildData>
