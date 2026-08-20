import { cloneNote } from './note'
import type { Note, TodoItem } from './types'

export const HISTORY_LIMIT = 50
export const TEXT_PAUSE_MS = 500

export type HistoryPatch =
  | { type: 'setTitle'; from: string; to: string }
  | { type: 'setTodoText'; id: string; from: string; to: string }
  | { type: 'toggleTodo'; id: string; from: boolean; to: boolean }
  | { type: 'addTodo'; item: TodoItem; index: number }
  | { type: 'removeTodo'; item: TodoItem; index: number }

type PendingText =
  | { type: 'setTitle'; from: string; to: string }
  | { type: 'setTodoText'; id: string; from: string; to: string }

export function applyPatch(note: Note, patch: HistoryPatch): Note {
  const next = cloneNote(note)

  switch (patch.type) {
    case 'setTitle':
      next.title = patch.to
      break
    case 'setTodoText': {
      const todo = next.todos.find((item) => item.id === patch.id)
      if (todo) {
        todo.text = patch.to
      }
      break
    }
    case 'toggleTodo': {
      const todo = next.todos.find((item) => item.id === patch.id)
      if (todo) {
        todo.done = patch.to
      }
      break
    }
    case 'addTodo':
      next.todos.splice(patch.index, 0, { ...patch.item })
      break
    case 'removeTodo':
      next.todos.splice(patch.index, 1)
      break
  }

  return next
}

export function invertPatch(patch: HistoryPatch): HistoryPatch {
  switch (patch.type) {
    case 'setTitle':
      return { type: 'setTitle', from: patch.to, to: patch.from }
    case 'setTodoText':
      return { type: 'setTodoText', id: patch.id, from: patch.to, to: patch.from }
    case 'toggleTodo':
      return { type: 'toggleTodo', id: patch.id, from: patch.to, to: patch.from }
    case 'addTodo':
      return { type: 'removeTodo', item: patch.item, index: patch.index }
    case 'removeTodo':
      return { type: 'addTodo', item: patch.item, index: patch.index }
  }
}

export class NoteHistory {
  private undoStack: HistoryPatch[] = []
  private redoStack: HistoryPatch[] = []
  private pending: PendingText | null = null
  private timer: ReturnType<typeof setTimeout> | null = null

  get canUndo(): boolean {
    return this.undoStack.length > 0 || this.hasUncommittedText()
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  get undoCount(): number {
    return this.undoStack.length
  }

  get redoCount(): number {
    return this.redoStack.length
  }

  hasUncommittedText(): boolean {
    if (!this.pending) {
      return false
    }
    return this.pending.from !== this.pending.to
  }

  changeTitle(from: string, to: string): void {
    if (this.pending?.type === 'setTitle') {
      this.pending.to = to
    } else {
      this.flush()
      this.pending = { type: 'setTitle', from, to }
      this.redoStack = []
    }
    this.bumpTimer()
  }

  changeTodoText(id: string, from: string, to: string): void {
    if (this.pending?.type === 'setTodoText' && this.pending.id === id) {
      this.pending.to = to
    } else {
      this.flush()
      this.pending = { type: 'setTodoText', id, from, to }
      this.redoStack = []
    }
    this.bumpTimer()
  }

  record(patch: HistoryPatch): void {
    this.flush()
    if (isNoop(patch)) {
      return
    }
    this.push(patch)
  }

  flush(): void {
    this.clearTimer()
    if (!this.pending) {
      return
    }
    const patch = this.pending
    this.pending = null
    if (isNoop(patch)) {
      return
    }
    this.push(patch)
  }

  undo(note: Note): Note {
    this.flush()
    const patch = this.undoStack.pop()
    if (!patch) {
      return note
    }
    this.redoStack.push(patch)
    return applyPatch(note, invertPatch(patch))
  }

  redo(note: Note): Note {
    this.flush()
    const patch = this.redoStack.pop()
    if (!patch) {
      return note
    }
    this.undoStack.push(patch)
    return applyPatch(note, patch)
  }

  reset(): void {
    this.clearTimer()
    this.pending = null
    this.undoStack = []
    this.redoStack = []
  }

  private push(patch: HistoryPatch): void {
    this.undoStack.push(patch)
    if (this.undoStack.length > HISTORY_LIMIT) {
      this.undoStack.shift()
    }
    this.redoStack = []
  }

  private bumpTimer(): void {
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.flush()
    }, TEXT_PAUSE_MS)
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

function isNoop(patch: HistoryPatch): boolean {
  if (patch.type === 'setTitle' || patch.type === 'setTodoText') {
    return patch.from === patch.to
  }
  if (patch.type === 'toggleTodo') {
    return patch.from === patch.to
  }
  return false
}
