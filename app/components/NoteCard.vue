<template>
  <article>
    <h2>
      <NuxtLink :to="`/notes/${note.id}`">{{ displayTitle(note.title) }}</NuxtLink>
    </h2>
    <TodoPreviewList :todos="note.todos" />
    <div>
      <NuxtLink :to="`/notes/${note.id}`">Изменить</NuxtLink>
      <button type="button" @click="emit('remove')">Удалить</button>
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
