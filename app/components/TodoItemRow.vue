<template>
  <div>
    <input
      type="checkbox"
      :checked="todo.done"
      :aria-label="todo.text ? `Выполнено: ${todo.text}` : 'Выполнено'"
      @change="emit('toggle')"
    >
    <input
      type="text"
      :value="todo.text"
      placeholder="Текст пункта"
      aria-label="Текст пункта"
      @input="onInput"
      @blur="emit('blur')"
    >
    <button type="button" @click="emit('remove')">Удалить</button>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '~/utils/types'

defineProps<{
  todo: TodoItem
}>()

const emit = defineEmits<{
  'update:text': [value: string]
  toggle: []
  remove: []
  blur: []
}>()

function onInput(event: Event): void {
  emit('update:text', (event.target as HTMLInputElement).value)
}
</script>
