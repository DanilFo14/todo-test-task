<template>
  <div>
    <section v-if="notFound" class="missing">
      <h2>Заметка не найдена</h2>
      <p>Такой заметки нет — возможно, её удалили или ссылка устарела.</p>
      <NuxtLink class="btn btn--primary" to="/">На главную</NuxtLink>
    </section>

    <template v-else>
      <h2 class="editor-head">{{ isNew ? 'Новая заметка' : 'Редактирование' }}</h2>

      <label class="sr-only" for="note-title">Название</label>
      <input
        id="note-title"
        class="field field--title"
        type="text"
        :value="note.title"
        placeholder="Название заметки"
        @input="onTitleInput"
        @blur="onTitleBlur"
      >

      <ul class="todos">
        <li v-for="todo in note.todos" :key="todo.id">
          <TodoItemRow
            :todo="todo"
            @update:text="onTodoText(todo.id, $event)"
            @toggle="toggleTodo(todo.id)"
            @remove="removeTodo(todo.id)"
            @blur="onTodoBlur(todo.id)"
          />
        </li>
      </ul>

      <button type="button" class="btn" @click="addTodo">Добавить пункт</button>

      <div class="btn-row editor-actions">
        <button type="button" class="btn btn--primary" @click="save">Сохранить</button>
        <button type="button" class="btn" :disabled="!canUndo" @click="undo">Отменить</button>
        <button type="button" class="btn" :disabled="!canRedo" @click="redo">Повторить</button>
        <button type="button" class="btn" @click="requestCancel">Отменить редактирование</button>
        <button type="button" class="btn btn--danger" @click="deleteOpen = true">Удалить</button>
      </div>
    </template>

    <AppConfirmDialog
      :open="cancelOpen"
      title="Отменить редактирование?"
      message="Несохранённые изменения будут потеряны."
      confirm-label="Сбросить"
      @confirm="confirmCancel"
      @cancel="cancelOpen = false"
    />

    <AppConfirmDialog
      :open="deleteOpen"
      title="Удалить заметку?"
      message="Заметка будет удалена без возможности восстановления."
      confirm-label="Удалить"
      danger
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
const {
  note,
  notFound,
  isNew,
  canUndo,
  canRedo,
  cancelOpen,
  deleteOpen,
  onTitleInput,
  onTitleBlur,
  onTodoText,
  onTodoBlur,
  toggleTodo,
  addTodo,
  removeTodo,
  undo,
  redo,
  save,
  requestCancel,
  confirmCancel,
  confirmDelete,
} = useNoteEditor()
</script>

<style lang="scss" scoped>
.missing {
  max-width: 420px;
}

.editor-head {
  margin: 0 0 12px;
  font-size: 1.05rem;
  font-weight: 600;
}

.todos {
  list-style: none;
  margin: 16px 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.editor-actions {
  margin-top: 20px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
