<template>
  <article class="card">
    <h2 class="card__title">
      <NuxtLink :to="`/notes/${note.id}`">{{ displayTitle(note.title) }}</NuxtLink>
    </h2>
    <TodoPreviewList :todos="note.todos" />
    <div class="card__actions">
      <NuxtLink class="btn" :to="`/notes/${note.id}`">Изменить</NuxtLink>
      <button type="button" class="btn btn--ghost" @click="emit('remove')">Удалить</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { displayTitle } from '~/utils/note'
import type { Note } from '~/utils/types'

defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  remove: []
}>()
</script>

<style lang="scss" scoped>
.card {
  padding: 16px;
  border: 1px solid #d8d0c4;
  border-radius: 10px;
  background: #fbf8f1;
  box-shadow: 0 1px 2px rgba(42, 38, 34, 0.06);
}

.card__title {
  margin: 0 0 10px;
  font-size: 1.15rem;
}

.card__title a {
  color: inherit;
  text-decoration: none;
}

.card__title a:hover {
  text-decoration: underline;
}

.card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
</style>
