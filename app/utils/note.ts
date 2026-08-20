import { createId } from './id'
import { NEW_NOTE_ID, type Note, type TodoItem } from './types'

export function emptyNote(id = NEW_NOTE_ID): Note {
  return {
    id,
    title: '',
    todos: [],
    updatedAt: 0,
  }
}

export function emptyTodo(): TodoItem {
  return {
    id: createId(),
    text: '',
    done: false,
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
  if (a.title !== b.title || a.todos.length !== b.todos.length) {
    return false
  }
  return a.todos.every((item, index) => {
    const other = b.todos[index]
    return other.id === item.id && other.text === item.text && other.done === item.done
  })
}

export function sanitizeNote(note: Note): Note {
  return {
    ...note,
    title: note.title.trim(),
    todos: note.todos
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0),
    updatedAt: Date.now(),
  }
}

export function displayTitle(title: string): string {
  const trimmed = title.trim()
  return trimmed.length > 0 ? trimmed : 'Без названия'
}
