import { SCHEMA_VERSION, type Draft, type Note, type PersistedState } from './types'

export const DATA_KEY = 'notes-app:data'
export const DRAFT_KEY = 'notes-app:draft'

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

export function loadDraft(): Draft | null {
  if (!canUseStorage()) {
    return null
  }
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) {
      return null
    }
    const draft = JSON.parse(raw) as Draft
    if (!draft || !draft.note || typeof draft.noteId !== 'string') {
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function saveDraft(draft: Draft): void {
  if (!canUseStorage()) {
    return
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function clearDraft(): void {
  if (!canUseStorage()) {
    return
  }
  localStorage.removeItem(DRAFT_KEY)
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
