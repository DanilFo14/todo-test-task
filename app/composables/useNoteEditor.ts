import { createId } from '~/utils/id'
import { cloneNote, emptyNote, notesContentEqual } from '~/utils/note'
import { DATA_KEY } from '~/utils/storage'
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
  const goneOpen = ref(false)
  const goneHasEdits = ref(false)

  const noteId = computed(() => String(route.params.id))
  const isNew = computed(() => noteId.value === NEW_NOTE_ID)
  const dirty = computed(() => !notesContentEqual(note.value, baseline.value))

  const history = useEditorHistory(note)
  const draft = useEditorDraft({
    note,
    baseline,
    isNew,
    notFound,
    dirty,
  })

  function boot(): void {
    draft.startSession()
    store.hydrate()
    notFound.value = false
    goneOpen.value = false
    history.reset()

    if (isNew.value) {
      const blank = emptyNote()
      note.value = blank
      baseline.value = cloneNote(blank)
      const savedDraft = store.readDraft()
      if (savedDraft?.isNew) {
        draft.offerRestore(savedDraft, blank)
      }
      draft.endSession()
      return
    }

    const saved = store.getById(noteId.value)
    if (!saved) {
      notFound.value = true
      note.value = emptyNote(noteId.value)
      baseline.value = cloneNote(note.value)
      draft.endSession()
      return
    }

    note.value = saved
    baseline.value = cloneNote(saved)
    const savedDraft = store.readDraft()
    if (savedDraft && savedDraft.noteId === saved.id) {
      draft.offerRestore(savedDraft, saved)
    }
    draft.endSession()
  }

  function leaveClean(): void {
    draft.stopWriting()
    history.reset()
  }

  function goHome(): void {
    leaveClean()
    cancelOpen.value = false
    deleteOpen.value = false
    goneOpen.value = false
    void router.push('/')
  }

  function save(): void {
    history.flush()
    const id = isNew.value ? createId() : note.value.id
    store.saveNote({ ...note.value, id })
    goHome()
  }

  function confirmCancel(): void {
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

  function saveAsNew(): void {
    history.flush()
    store.saveNote({ ...note.value, id: createId() })
    goHome()
  }

  function checkDeletedElsewhere(): void {
    if (isNew.value || notFound.value || goneOpen.value) {
      return
    }
    store.hydrate()
    if (!store.getById(noteId.value)) {
      goneHasEdits.value = dirty.value
      goneOpen.value = true
    }
  }

  function onStorage(event: StorageEvent): void {
    if (event.key && event.key !== DATA_KEY) {
      return
    }
    checkDeletedElsewhere()
  }

  watch(noteId, () => {
    boot()
  })

  onMounted(() => {
    boot()
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', checkDeletedElsewhere)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', checkDeletedElsewhere)
  })

  return {
    note,
    notFound,
    isNew,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    restoreOpen: draft.restoreOpen,
    cancelOpen,
    deleteOpen,
    goneOpen,
    goneHasEdits,
    onTitleInput: history.onTitleInput,
    onTitleBlur: history.onTitleBlur,
    onTodoText: history.onTodoText,
    onTodoBlur: history.onTodoBlur,
    toggleTodo: history.toggleTodo,
    addTodo: history.addTodo,
    removeTodo: history.removeTodo,
    undo: history.undo,
    redo: history.redo,
    save,
    requestCancel,
    confirmCancel,
    confirmDelete,
    restoreDraft: draft.restoreDraft,
    discardDraft: draft.discardDraft,
    saveAsNew,
    goHome,
  }
}
