<template>
  <ul v-if="items.length" class="preview">
    <li
      v-for="item in items"
      :key="item.id"
      class="preview__item"
      :class="{ 'preview__item--done': item.done }"
    >
      <span class="preview__mark" aria-hidden="true">{{ item.done ? '✓' : '' }}</span>
      <span>{{ item.text || 'Пустой пункт' }}</span>
    </li>
  </ul>
  <p v-else class="preview__empty">Нет пунктов</p>
  <p v-if="rest > 0" class="preview__more">ещё {{ rest }}</p>
</template>

<script setup lang="ts">
import type { TodoItem } from '~/utils/types'

const PREVIEW_LIMIT = 3

const props = defineProps<{
  todos: TodoItem[]
}>()

const items = computed(() => props.todos.slice(0, PREVIEW_LIMIT))
const rest = computed(() => Math.max(0, props.todos.length - PREVIEW_LIMIT))
</script>

<style lang="scss" scoped>
.preview {
  margin: 0;
  padding: 0;
  list-style: none;
}

.preview__item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 2px 0;
  color: #2a2622;
}

.preview__item--done {
  color: #7a746c;
  text-decoration: line-through;
}

.preview__mark {
  width: 1rem;
  flex: none;
  color: #3f5c4a;
}

.preview__empty,
.preview__more {
  margin: 8px 0 0;
  color: #6d675f;
  font-size: 0.9rem;
}
</style>
