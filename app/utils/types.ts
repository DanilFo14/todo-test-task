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

export const SCHEMA_VERSION = 1
export const NEW_NOTE_ID = 'new'
