<template>
  <div class="todo">
    <input
      class="todo__check"
      type="checkbox"
      :checked="todo.done"
      :aria-label="todo.text ? `Выполнено: ${todo.text}` : 'Выполнено'"
      @change="emit('toggle')"
    >
    <input
      class="field todo__text"
      type="text"
      :value="todo.text"
      placeholder="Текст пункта"
      aria-label="Текст пункта"
      @input="onInput"
      @blur="emit('blur')"
    >
    <button type="button" class="btn btn--ghost todo__remove" @click="emit('remove')">
      Удалить
    </button>
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

<style lang="scss" scoped>
.todo {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
}

.todo__check {
  width: 18px;
  height: 18px;
  accent-color: #3f5c4a;
}

.todo__remove {
  min-height: 36px;
}

@media (max-width: 560px) {
  .todo {
    grid-template-columns: auto 1fr;
  }

  .todo__remove {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
