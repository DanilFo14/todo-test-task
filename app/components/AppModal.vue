<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal"
      @keydown="onKeydown"
    >
      <div class="modal__backdrop" @click="onBackdrop" />
      <div
        ref="dialogRef"
        class="modal__dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <h2 :id="titleId" class="modal__title">{{ title }}</h2>
        <div class="modal__body">
          <slot />
        </div>
        <div class="modal__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  closeOnBackdrop?: boolean
}>(), {
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`
let previous: HTMLElement | null = null

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previous = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      focusFirst()
      return
    }
    document.body.style.overflow = ''
    previous?.focus()
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
})

function focusables(): HTMLElement[] {
  if (!dialogRef.value) {
    return []
  }
  const nodes = dialogRef.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return [...nodes].filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)
}

function focusFirst(): void {
  const items = focusables()
  const preferred = items.find((el) => el.hasAttribute('data-initial-focus')) ?? items[0]
  ;(preferred ?? dialogRef.value)?.focus()
}

function onBackdrop(): void {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) {
    return
  }
  const items = focusables()
  if (items.length === 0) {
    event.preventDefault()
    dialogRef.value.focus()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || !dialogRef.value.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.modal__dialog {
  position: relative;
  width: min(100%, 420px);
  padding: 20px;
  background: #fff;
}

.modal__title {
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.modal__body {
  margin-bottom: 16px;
}

.modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
</style>
