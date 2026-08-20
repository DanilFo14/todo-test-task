import { NEW_NOTE_ID, type Note } from './types'

export function emptyNote(id = NEW_NOTE_ID): Note {
  return {
    id,
    title: '',
    todos: [],
    updatedAt: 0,
  }
}

export function cloneNote(note: Note): Note {
  return {
    id: note.id,
    title: note.title,
    updatedAt: note.updatedAt,
    todos: note.todos.map((item) => ({ ...item })),
  }
}

export function notesContentEqual(a: Note, b: Note): boolean {
  return a.title === b.title
}

export function sanitizeNote(note: Note): Note {
  return {
    ...note,
    title: note.title.trim(),
    updatedAt: Date.now(),
  }
}

export function displayTitle(title: string): string {
  const trimmed = title.trim()
  return trimmed.length > 0 ? trimmed : 'Без названия'
}
