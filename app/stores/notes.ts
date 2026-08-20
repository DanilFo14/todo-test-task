import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cloneNote, sanitizeNote } from '../utils/note'
import { clearDraft as removeDraft, loadDraft, loadState, saveDraft as persistDraft, saveState } from '../utils/storage'
import type { Draft, Note } from '../utils/types'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])

  const sortedNotes = computed(() =>
    [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  function hydrate(): void {
    notes.value = loadState().notes.map(cloneNote)
  }

  function getById(id: string): Note | undefined {
    const found = notes.value.find((note) => note.id === id)
    return found ? cloneNote(found) : undefined
  }

  function saveNote(note: Note): Note {
    const prepared = sanitizeNote(cloneNote(note))
    const index = notes.value.findIndex((item) => item.id === prepared.id)
    if (index === -1) {
      notes.value = [...notes.value, prepared]
    } else {
      const next = notes.value.slice()
      next[index] = prepared
      notes.value = next
    }
    saveState(notes.value)
    return cloneNote(prepared)
  }

  function deleteNote(id: string): void {
    const existed = notes.value.some((note) => note.id === id)
    if (!existed) {
      return
    }
    notes.value = notes.value.filter((note) => note.id !== id)
    saveState(notes.value)

    const draft = loadDraft()
    if (draft && draft.noteId === id && !draft.isNew) {
      removeDraft()
    }
  }

  function writeDraft(draft: Draft): void {
    persistDraft({
      ...draft,
      note: cloneNote(draft.note),
      savedAt: Date.now(),
    })
  }

  function readDraft(): Draft | null {
    const draft = loadDraft()
    return draft ? { ...draft, note: cloneNote(draft.note) } : null
  }

  function clearDraft(): void {
    removeDraft()
  }

  return {
    notes,
    sortedNotes,
    hydrate,
    getById,
    saveNote,
    deleteNote,
    writeDraft,
    readDraft,
    clearDraft,
  }
})
