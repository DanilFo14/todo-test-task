<template>
  <div>
    <div class="list-head">
      <p class="list-head__hint">Список заметок хранится в браузере.</p>
      <NuxtLink class="btn btn--primary" to="/notes/new">Новая заметка</NuxtLink>
    </div>

    <p v-if="store.sortedNotes.length === 0" class="empty">Пока нет ни одной заметки.</p>

    <div v-else class="list">
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
      message="Заметка и все её пункты будут удалены. Это нельзя отменить."
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

<style lang="scss" scoped>
.list-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.list-head__hint {
  margin: 0;
  color: #6d675f;
}

.list {
  display: grid;
  gap: 12px;
}
</style>
