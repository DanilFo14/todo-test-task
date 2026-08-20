import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cloneNote, sanitizeNote } from '../utils/note'
import { loadState, saveState } from '../utils/storage'
import type { Note } from '../utils/types'

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
    if (!notes.value.some((note) => note.id === id)) {
      return
    }
    notes.value = notes.value.filter((note) => note.id !== id)
    saveState(notes.value)
  }

  return {
    notes,
    sortedNotes,
    hydrate,
    getById,
    saveNote,
    deleteNote,
  }
})
