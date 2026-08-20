import { createId } from '~/utils/id'
import { cloneNote, emptyNote, notesContentEqual } from '~/utils/note'
import { NEW_NOTE_ID, type Note } from '~/utils/types'

export function useNoteEditor() {
  const route = useRoute()
  const router = useRouter()
  const store = useNotesStore()

  const note = ref<Note>(emptyNote())
  const baseline = ref<Note>(emptyNote())
  const notFound = ref(false)
  const cancelOpen = ref(false)
  const deleteOpen = ref(false)

  const noteId = computed(() => String(route.params.id))
  const isNew = computed(() => noteId.value === NEW_NOTE_ID)
  const dirty = computed(() => !notesContentEqual(note.value, baseline.value))

  function boot(): void {
    store.hydrate()
    notFound.value = false

    if (isNew.value) {
      const blank = emptyNote()
      note.value = blank
      baseline.value = cloneNote(blank)
      return
    }

    const saved = store.getById(noteId.value)
    if (!saved) {
      notFound.value = true
      note.value = emptyNote(noteId.value)
      baseline.value = cloneNote(note.value)
      return
    }

    note.value = saved
    baseline.value = cloneNote(saved)
  }

  function onTitleInput(event: Event): void {
    note.value = { ...note.value, title: (event.target as HTMLInputElement).value }
  }

  function goHome(): void {
    cancelOpen.value = false
    deleteOpen.value = false
    void router.push('/')
  }

  function save(): void {
    const id = isNew.value ? createId() : note.value.id
    store.saveNote({ ...note.value, id })
    goHome()
  }

  function requestCancel(): void {
    if (dirty.value) {
      cancelOpen.value = true
      return
    }
    goHome()
  }

  function confirmDelete(): void {
    if (!isNew.value) {
      store.deleteNote(note.value.id)
    }
    goHome()
  }

  watch(noteId, () => {
    boot()
  })

  onMounted(() => {
    boot()
  })

  return {
    note,
    notFound,
    isNew,
    cancelOpen,
    deleteOpen,
    onTitleInput,
    save,
    requestCancel,
    confirmCancel: goHome,
    confirmDelete,
  }
}
