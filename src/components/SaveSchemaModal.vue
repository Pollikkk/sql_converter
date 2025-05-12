<template>
    <!-- Модальное окно -->
    <div class="modal-overlay">
      <div class="modal">
        <h3>Сохранить схему</h3>
        <input v-model="schemaName" placeholder="Название схемы" />
        <div class="modal-actions">
          <button @click="onSave">Сохранить</button>
          <button  @click="$emit('close')">Отмена</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import {useDiagramApiStore} from '@/store/DiagramApiStore';
import { useDiagramStore } from "@/store/DiagramStore";

const store = useDiagramStore();
const storeApi = useDiagramApiStore();

const schemaName = ref('');
const emit = defineEmits(['close']) 

const onSave = async () => {
  if (!schemaName.value.trim()) {
    alert('Название схемы не может быть пустым');
    return;
  }

  try {
    //const rawElements = JSON.parse(JSON.stringify(store.elements));
    //const rawRelations = JSON.parse(JSON.stringify(store.relations));
    const userId = '123'; // userId (мб потом сделаю регистрацию)

    /*await storeApi.saveSchema({
      userId,
      name: schemaName.value,
      elements: rawElements,
      relations: rawRelations,
    });*/

    await storeApi.saveSchema({
      userId,
      name: schemaName.value,
      elements: store.elements.map(el => ({
        ...el,
        id: String(el.id),
        columns: el.columns.map(col => ({
          ...col,
          id: String(col.id),
          isPK: !!col.isPK,
          isFK: !!col.isFK,
        }))
      })),
      relations: store.relations.map(rel => ({
        ...rel,
        from: String(rel.from),
        to: String(rel.to),
        fromAnchor: {
          name: rel.fromAnchor?.name,
          x: rel.fromAnchor?.x,
          y: rel.fromAnchor?.y,
        },
        toAnchor: {
          name: rel.toAnchor?.name,
          x: rel.toAnchor?.x,
          y: rel.toAnchor?.y,
        }
      }))
    });


    alert('Схема сохранена!');
    emit('close') 
    schemaName.value = '';
  } catch (err) {
    alert('Ошибка при сохранении схемы.');
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 300px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
.modal-actions button {
  margin-left: 0.5rem;
}
</style>
