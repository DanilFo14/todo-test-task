<template>
  <AppModal
    :open="open"
    :title="title"
    :close-on-backdrop="true"
    @close="emit('cancel')"
  >
    <p>{{ message }}</p>
    <template #actions>
      <button type="button" data-initial-focus @click="emit('cancel')">
        {{ cancelLabel }}
      </button>
      <button type="button" @click="emit('confirm')">
        {{ confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>(), {
  confirmLabel: 'Подтвердить',
  cancelLabel: 'Отмена',
  danger: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
