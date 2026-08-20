import { DATA_KEY } from '~/utils/storage'

export default defineNuxtPlugin(() => {
  const store = useNotesStore()
  store.hydrate()

  if (import.meta.client) {
    window.addEventListener('storage', (event) => {
      if (!event.key || event.key === DATA_KEY) {
        store.hydrate()
      }
    })
  }
})
