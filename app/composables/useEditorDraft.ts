import type { ComputedRef, Ref } from 'vue'
import { cloneNote, notesContentEqual } from '~/utils/note'
import { NEW_NOTE_ID, type Draft, type Note } from '~/utils/types'

const DRAFT_DELAY = 400

export function useEditorDraft(options: {
  note: Ref<Note>
  baseline: Ref<Note>
  isNew: ComputedRef<boolean>
  notFound: Ref<boolean>
  dirty: ComputedRef<boolean>
}) {
  const store = useNotesStore()
  const restoreOpen = ref(false)
  const pendingDraft = ref<Draft | null>(null)
  const paused = ref(true)
  const skipDraft = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null

  function startSession(): void {
    paused.value = true
    skipDraft.value = false
    pendingDraft.value = null
    restoreOpen.value = false
  }

  function endSession(): void {
    paused.value = false
  }

  function offerRestore(draft: Draft | null, current: Note): void {
    if (!draft) {
      return
    }
    if (!notesContentEqual(draft.note, current)) {
      pendingDraft.value = draft
      restoreOpen.value = true
    }
  }

  function restoreDraft(): void {
    if (pendingDraft.value) {
      options.note.value = cloneNote(pendingDraft.value.note)
    }
    pendingDraft.value = null
    restoreOpen.value = false
  }

  function discardDraft(): void {
    store.clearDraft()
    pendingDraft.value = null
    restoreOpen.value = false
  }

  function stopWriting(): void {
    skipDraft.value = true
    store.clearDraft()
  }

  function flushDraft(): void {
    if (options.notFound.value || paused.value || skipDraft.value || restoreOpen.value) {
      return
    }
    const draftId = options.isNew.value ? NEW_NOTE_ID : options.note.value.id
    if (!options.dirty.value) {
      const current = store.readDraft()
      if (current && current.noteId === draftId) {
        store.clearDraft()
      }
      return
    }
    store.writeDraft({
      noteId: draftId,
      isNew: options.isNew.value,
      note: options.note.value,
      savedAt: Date.now(),
    })
  }

  function scheduleDraft(): void {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      flushDraft()
    }, DRAFT_DELAY)
  }

  watch(options.note, () => {
    if (paused.value || restoreOpen.value || skipDraft.value) {
      return
    }
    scheduleDraft()
  }, { deep: true })

  onMounted(() => {
    window.addEventListener('beforeunload', flushDraft)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearTimeout(timer)
    }
    flushDraft()
    window.removeEventListener('beforeunload', flushDraft)
    document.removeEventListener('visibilitychange', onVisibility)
  })

  function onVisibility(): void {
    if (document.visibilityState === 'hidden') {
      flushDraft()
    }
  }

  return {
    restoreOpen,
    startSession,
    endSession,
    offerRestore,
    restoreDraft,
    discardDraft,
    stopWriting,
    flushDraft,
  }
}
