export type TodoItem = {
  id: string
  text: string
  done: boolean
}

export type Note = {
  id: string
  title: string
  todos: TodoItem[]
  updatedAt: number
}

export type PersistedState = {
  schemaVersion: number
  notes: Note[]
}

export type Draft = {
  noteId: string
  isNew: boolean
  note: Note
  savedAt: number
}

export const SCHEMA_VERSION = 1
export const NEW_NOTE_ID = 'new'
