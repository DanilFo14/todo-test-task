import { createId } from '~/utils/id'
import { cloneNote, emptyNote, emptyTodo, notesContentEqual } from '~/utils/note'
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

  function onTodoText(id: string, to: string): void {
    note.value = {
      ...note.value,
      todos: note.value.todos.map((todo) => (todo.id === id ? { ...todo, text: to } : todo)),
    }
  }

  function onTodoBlur(id: string): void {
    const item = note.value.todos.find((todo) => todo.id === id)
    if (item && item.text.trim() === '') {
      removeTodo(id)
    }
  }

  function toggleTodo(id: string): void {
    note.value = {
      ...note.value,
      todos: note.value.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    }
  }

  function addTodo(): void {
    note.value = { ...note.value, todos: [...note.value.todos, emptyTodo()] }
  }

  function removeTodo(id: string): void {
    note.value = {
      ...note.value,
      todos: note.value.todos.filter((todo) => todo.id !== id),
    }
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
    onTodoText,
    onTodoBlur,
    toggleTodo,
    addTodo,
    removeTodo,
    save,
    requestCancel,
    confirmCancel: goHome,
    confirmDelete,
  }
}
