import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNotesStore } from '../app/stores/notes'
import { emptyNote, emptyTodo } from '../app/utils/note'
import { DATA_KEY, DRAFT_KEY, loadState } from '../app/utils/storage'
import { SCHEMA_VERSION } from '../app/utils/types'

describe('notes store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('hydrates an empty list when storage is empty', () => {
    const store = useNotesStore()
    store.hydrate()
    expect(store.notes).toEqual([])
  })

  it('writes schema version only on save, not on hydrate', () => {
    const store = useNotesStore()
    store.hydrate()
    expect(localStorage.getItem(DATA_KEY)).toBeNull()

    store.saveNote({
      ...emptyNote('n1'),
      title: '  Список  ',
      todos: [{ ...emptyTodo(), text: '  молоко  ' }, { ...emptyTodo(), text: '   ' }],
    })

    const persisted = loadState()
    expect(persisted.schemaVersion).toBe(SCHEMA_VERSION)
    expect(persisted.notes).toHaveLength(1)
    expect(persisted.notes[0].title).toBe('Список')
    expect(persisted.notes[0].todos).toHaveLength(1)
    expect(persisted.notes[0].todos[0].text).toBe('молоко')
  })

  it('does not put a draft into the notes list', () => {
    const store = useNotesStore()
    store.hydrate()
    store.writeDraft({
      noteId: 'new',
      isNew: true,
      note: { ...emptyNote(), title: 'черновик' },
      savedAt: Date.now(),
    })

    expect(store.notes).toHaveLength(0)
    expect(localStorage.getItem(DATA_KEY)).toBeNull()
    expect(store.readDraft()?.note.title).toBe('черновик')
  })

  it('updates and deletes a note, then persists', () => {
    const store = useNotesStore()
    store.saveNote({ ...emptyNote('a'), title: 'одна' })
    store.saveNote({ ...emptyNote('a'), title: 'две' })
    expect(store.getById('a')?.title).toBe('две')

    store.deleteNote('a')
    expect(store.getById('a')).toBeUndefined()
    expect(loadState().notes).toEqual([])
  })

  it('does not throw when deleting a missing note', () => {
    const store = useNotesStore()
    store.hydrate()
    expect(() => store.deleteNote('nope')).not.toThrow()
    expect(store.notes).toEqual([])
  })

  it('clears a matching draft when the saved note is deleted', () => {
    const store = useNotesStore()
    store.saveNote({ ...emptyNote('a'), title: 'есть' })
    store.writeDraft({
      noteId: 'a',
      isNew: false,
      note: { ...emptyNote('a'), title: 'правка' },
      savedAt: Date.now(),
    })
    store.deleteNote('a')
    expect(store.readDraft()).toBeNull()
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull()
  })

  it('rejects a draft after clearDraft', () => {
    const store = useNotesStore()
    store.writeDraft({
      noteId: 'new',
      isNew: true,
      note: { ...emptyNote(), title: 'x' },
      savedAt: Date.now(),
    })
    store.clearDraft()
    expect(store.readDraft()).toBeNull()
  })

  it('loads unknown schema payloads as v1 notes when possible', () => {
    localStorage.setItem(
      DATA_KEY,
      JSON.stringify({
        schemaVersion: 99,
        notes: [{ id: 'legacy', title: 'старая', todos: [], updatedAt: 1 }],
      }),
    )
    const store = useNotesStore()
    store.hydrate()
    expect(store.getById('legacy')?.title).toBe('старая')
  })
})
