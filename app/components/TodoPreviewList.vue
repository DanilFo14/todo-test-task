<template>
  <ul v-if="items.length">
    <li
      v-for="item in items"
      :key="item.id"
      :style="item.done ? 'text-decoration: line-through' : undefined"
    >
      {{ item.text || 'Пустой пункт' }}
    </li>
  </ul>
  <p v-else>Нет пунктов</p>
  <p v-if="rest > 0">ещё {{ rest }}</p>
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
