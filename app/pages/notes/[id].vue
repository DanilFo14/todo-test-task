<template>
  <div>
    <section v-if="notFound">
      <h2>Заметка не найдена</h2>
      <p>Такой заметки нет — возможно, её удалили или ссылка устарела.</p>
      <NuxtLink to="/">На главную</NuxtLink>
    </section>

    <template v-else>
      <h2>{{ isNew ? 'Новая заметка' : 'Редактирование' }}</h2>

      <label for="note-title">Название</label>
      <input
        id="note-title"
        type="text"
        :value="note.title"
        placeholder="Название заметки"
        @input="onTitleInput"
        @blur="onTitleBlur"
      >

      <ul>
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
      <button type="button" @click="addTodo">Добавить пункт</button>

      <div>
        <button type="button" @click="save">Сохранить</button>
        <button type="button" :disabled="!canUndo" @click="undo">Отменить</button>
        <button type="button" :disabled="!canRedo" @click="redo">Повторить</button>
        <button type="button" @click="requestCancel">Отменить редактирование</button>
        <button type="button" @click="deleteOpen = true">Удалить</button>
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
