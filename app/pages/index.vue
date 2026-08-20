<template>
  <div>
    <p>
      <NuxtLink to="/notes/new">Новая заметка</NuxtLink>
    </p>

    <p v-if="store.sortedNotes.length === 0">Пока нет ни одной заметки.</p>

    <div v-else>
      <NoteCard
        v-for="note in store.sortedNotes"
        :key="note.id"
        :note="note"
        @remove="askDelete(note.id)"
      />
    </div>

    <AppConfirmDialog
      :open="deleteId !== null"
      title="Удалить заметку?"
      message="Заметка будет удалена. Это нельзя отменить."
      confirm-label="Удалить"
      danger
      @confirm="confirmDelete"
      @cancel="deleteId = null"
    />
  </div>
</template>

<script setup lang="ts">
const store = useNotesStore()
const deleteId = ref<string | null>(null)

onMounted(() => {
  store.hydrate()
})

function askDelete(id: string): void {
  deleteId.value = id
}

function confirmDelete(): void {
  if (deleteId.value) {
    store.deleteNote(deleteId.value)
  }
  deleteId.value = null
}
</script>
