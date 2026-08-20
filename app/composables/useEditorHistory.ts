import type { Ref } from 'vue'
import { emptyTodo } from '~/utils/note'
import { NoteHistory } from '~/utils/history'
import type { Note } from '~/utils/types'

export function useEditorHistory(note: Ref<Note>) {
  const history = new NoteHistory()
  const tick = ref(0)

  const canUndo = computed(() => {
    tick.value
    return history.canUndo
  })

  const canRedo = computed(() => {
    tick.value
    return history.canRedo
  })

  function bump(): void {
    tick.value += 1
  }

  function onTitleInput(event: Event): void {
    const to = (event.target as HTMLInputElement).value
    history.changeTitle(note.value.title, to)
    note.value = { ...note.value, title: to }
    bump()
  }

  function onTitleBlur(): void {
    history.flush()
    bump()
  }

  function onTodoText(id: string, to: string): void {
    const item = note.value.todos.find((todo) => todo.id === id)
    if (!item) {
      return
    }
    history.changeTodoText(id, item.text, to)
    note.value = {
      ...note.value,
      todos: note.value.todos.map((todo) => (todo.id === id ? { ...todo, text: to } : todo)),
    }
    bump()
  }

  function onTodoBlur(id: string): void {
    history.flush()
    const item = note.value.todos.find((todo) => todo.id === id)
    if (item && item.text.trim() === '') {
      removeTodo(id)
      return
    }
    bump()
  }

  function toggleTodo(id: string): void {
    const item = note.value.todos.find((todo) => todo.id === id)
    if (!item) {
      return
    }
    history.record({ type: 'toggleTodo', id, from: item.done, to: !item.done })
    note.value = {
      ...note.value,
      todos: note.value.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    }
    bump()
  }

  function addTodo(): void {
    const item = emptyTodo()
    const index = note.value.todos.length
    history.record({ type: 'addTodo', item, index })
    note.value = { ...note.value, todos: [...note.value.todos, item] }
    bump()
  }

  function removeTodo(id: string): void {
    const index = note.value.todos.findIndex((todo) => todo.id === id)
    const item = index === -1 ? undefined : note.value.todos[index]
    if (!item) {
      return
    }
    history.record({ type: 'removeTodo', item: { ...item }, index })
    note.value = {
      ...note.value,
      todos: note.value.todos.filter((todo) => todo.id !== id),
    }
    bump()
  }

  function undo(): void {
    note.value = history.undo(note.value)
    bump()
  }

  function redo(): void {
    note.value = history.redo(note.value)
    bump()
  }

  function flush(): void {
    history.flush()
    bump()
  }

  function reset(): void {
    history.reset()
    bump()
  }

  function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false
    }
    const tag = target.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA'
  }

  function onKeydown(event: KeyboardEvent): void {
    const modifier = event.ctrlKey || event.metaKey
    if (!modifier || event.altKey) {
      return
    }
    const key = event.key.toLowerCase()
    const undoKey = key === 'z' && !event.shiftKey
    const redoKey = (key === 'z' && event.shiftKey) || (key === 'y' && !event.shiftKey)
    if (!undoKey && !redoKey) {
      return
    }

    // Native undo inside the field while the current typing burst is not committed yet.
    if (isTypingTarget(event.target) && history.hasUncommittedText()) {
      return
    }

    event.preventDefault()
    if (redoKey) {
      redo()
    } else {
      undo()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    history.reset()
  })

  return {
    canUndo,
    canRedo,
    onTitleInput,
    onTitleBlur,
    onTodoText,
    onTodoBlur,
    toggleTodo,
    addTodo,
    removeTodo,
    undo,
    redo,
    flush,
    reset,
  }
}
