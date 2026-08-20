import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HISTORY_LIMIT, NoteHistory, TEXT_PAUSE_MS, applyPatch, invertPatch, type HistoryPatch } from '../app/utils/history'
import { emptyNote, emptyTodo } from '../app/utils/note'

describe('applyPatch / invertPatch', () => {
  it('applies and inverts title change', () => {
    const note = { ...emptyNote(), title: 'A' }
    const patch: HistoryPatch = { type: 'setTitle', from: 'A', to: 'B' }
    const after = applyPatch(note, patch)
    expect(after.title).toBe('B')
    expect(applyPatch(after, invertPatch(patch)).title).toBe('A')
  })

  it('adds and removes a todo at the same index', () => {
    const todo = emptyTodo()
    todo.text = 'купить хлеб'
    const note = emptyNote()
    const add: HistoryPatch = { type: 'addTodo', item: todo, index: 0 }
    const withTodo = applyPatch(note, add)
    expect(withTodo.todos).toHaveLength(1)
    expect(applyPatch(withTodo, invertPatch(add)).todos).toHaveLength(0)
  })
})

describe('NoteHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('coalesces continuous title typing into one entry after pause', () => {
    const history = new NoteHistory()
    let note = emptyNote()

    history.changeTitle('', 'П')
    note = { ...note, title: 'П' }
    history.changeTitle(note.title, 'По')
    note = { ...note, title: 'По' }
    history.changeTitle(note.title, 'Покупки')
    note = { ...note, title: 'Покупки' }

    expect(history.undoCount).toBe(0)
    vi.advanceTimersByTime(TEXT_PAUSE_MS)
    expect(history.undoCount).toBe(1)

    note = history.undo(note)
    expect(note.title).toBe('')
  })

  it('flushes text on blur-like flush() call', () => {
    const history = new NoteHistory()
    history.changeTitle('', 'Список')
    history.flush()
    expect(history.undoCount).toBe(1)
  })

  it('does not write a history entry for each character', () => {
    const history = new NoteHistory()
    let from = ''
    for (const char of 'abcdefghij') {
      const to = from + char
      history.changeTitle(from, to)
      from = to
    }
    expect(history.undoCount).toBe(0)
    vi.advanceTimersByTime(TEXT_PAUSE_MS)
    expect(history.undoCount).toBe(1)
  })

  it('records checkbox toggle as an atomic entry', () => {
    const history = new NoteHistory()
    const todo = emptyTodo()
    let note = { ...emptyNote(), todos: [{ ...todo, done: false }] }

    history.record({ type: 'toggleTodo', id: todo.id, from: false, to: true })
    note = applyPatch(note, { type: 'toggleTodo', id: todo.id, from: false, to: true })
    expect(history.undoCount).toBe(1)
    note = history.undo(note)
    expect(note.todos[0].done).toBe(false)
  })

  it('records add and remove as separate entries', () => {
    const history = new NoteHistory()
    const todo = emptyTodo()
    let note = emptyNote()

    history.record({ type: 'addTodo', item: todo, index: 0 })
    note = applyPatch(note, { type: 'addTodo', item: todo, index: 0 })
    history.record({ type: 'removeTodo', item: todo, index: 0 })
    note = applyPatch(note, { type: 'removeTodo', item: todo, index: 0 })

    expect(history.undoCount).toBe(2)
    note = history.undo(note)
    expect(note.todos).toHaveLength(1)
    note = history.undo(note)
    expect(note.todos).toHaveLength(0)
  })

  it('clears redo branch on a new change after undo', () => {
    const history = new NoteHistory()
    let note = emptyNote()

    history.record({ type: 'setTitle', from: '', to: 'один' })
    note = { ...note, title: 'один' }
    history.record({ type: 'setTitle', from: 'один', to: 'два' })
    note = { ...note, title: 'два' }

    note = history.undo(note)
    expect(note.title).toBe('один')
    expect(history.canRedo).toBe(true)

    history.record({ type: 'setTitle', from: 'один', to: 'три' })
    note = { ...note, title: 'три' }
    expect(history.canRedo).toBe(false)
    expect(history.redo(note).title).toBe('три')
  })

  it('keeps at most 50 steps and does not store full note snapshots', () => {
    const history = new NoteHistory()
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) {
      history.record({
        type: 'toggleTodo',
        id: 'x',
        from: i % 2 === 0,
        to: i % 2 === 1,
      })
    }
    expect(history.undoCount).toBe(HISTORY_LIMIT)
    const patch = (history as unknown as { undoStack: HistoryPatch[] }).undoStack[0]
    expect(patch.type).toBe('toggleTodo')
    expect(patch).not.toHaveProperty('note')
    expect(patch).not.toHaveProperty('snapshot')
  })

  it('reset clears stacks and pending text', () => {
    const history = new NoteHistory()
    history.changeTitle('', 'черновик')
    history.record({ type: 'setTitle', from: 'a', to: 'b' })
    history.reset()
    expect(history.undoCount).toBe(0)
    expect(history.redoCount).toBe(0)
    expect(history.hasUncommittedText()).toBe(false)
    expect(history.canUndo).toBe(false)
  })

  it('switching fields flushes the previous text patch', () => {
    const history = new NoteHistory()
    const todo = emptyTodo()
    history.changeTitle('', 'Заголовок')
    history.changeTodoText(todo.id, '', 'пункт')
    expect(history.undoCount).toBe(1)
    history.flush()
    expect(history.undoCount).toBe(2)
  })
})
