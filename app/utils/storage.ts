import { SCHEMA_VERSION, type Note, type PersistedState } from './types'

export const DATA_KEY = 'notes-app:data'

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

export function loadState(): PersistedState {
  if (!canUseStorage()) {
    return { schemaVersion: SCHEMA_VERSION, notes: [] }
  }

  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) {
      return { schemaVersion: SCHEMA_VERSION, notes: [] }
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return migrate(parsed)
  } catch {
    return { schemaVersion: SCHEMA_VERSION, notes: [] }
  }
}

export function saveState(notes: Note[]): void {
  if (!canUseStorage()) {
    return
  }
  const payload: PersistedState = {
    schemaVersion: SCHEMA_VERSION,
    notes,
  }
  localStorage.setItem(DATA_KEY, JSON.stringify(payload))
}

function migrate(raw: Partial<PersistedState>): PersistedState {
  const notes = Array.isArray(raw.notes) ? raw.notes.filter(isNoteLike) : []
  return {
    schemaVersion: SCHEMA_VERSION,
    notes,
  }
}

function isNoteLike(value: unknown): value is Note {
  if (!value || typeof value !== 'object') {
    return false
  }
  const note = value as Note
  return typeof note.id === 'string' && typeof note.title === 'string' && Array.isArray(note.todos)
}
