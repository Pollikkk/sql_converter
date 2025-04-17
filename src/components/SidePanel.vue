<template>
  <div class="side-panel">
    <div>Добавить таблицу</div>
    <button class="ordinary-button" @click="addElement('table')">Добавить таблицу</button>
    <div>Добавить связи</div>
    <!--
    <button class="ordinary-button" @click="store.addRelation('M:M')" :disabled="store.selectedElements.length !== 2">
      М : М
    </button>
    <button class="ordinary-button" @click="store.addRelation('1:1')" :disabled="store.selectedElements.length !== 2">
      1 : 1
    </button>
    <button class="ordinary-button" @click="store.addRelation('1:M')" :disabled="store.selectedElements.length !== 2">
      1 : М
    </button>
    -->
    <button class="ordinary-button" @click="store.isAddingRelation = !store.isAddingRelation; store.relationType = 'M:M'">
      {{ store.isAddingRelation ? 'Выход' : 'M : M' }}
    </button>
    <button class="ordinary-button" @click="store.isAddingRelation = !store.isAddingRelation; store.relationType = '1:1'">
      {{ store.isAddingRelation ? 'Выход' : '1 : 1' }}
    </button>
    <button class="ordinary-button" @click="store.isAddingRelation = !store.isAddingRelation; store.relationType = '1:M'">
      {{ store.isAddingRelation ? 'Выход' : '1 : M' }}
    </button>
    <button class="convert" @click="store.convertToSql(); isModalOpen = true">sql-код</button>

    <ModalWindow :isOpen="isModalOpen" @close="isModalOpen = false">
      <h2>Заголовок модального окна</h2>
      <!--<div v-html="store.sqlCode"></div>
      <p>{{ store.sqlCode }}</p>-->
    </ModalWindow>
  </div>
</template>

<script setup>
  import { ref } from "vue"
  import { useDiagramStore } from "@/store/DiagramStore"
  import ModalWindow from '@/components/ModalWindow.vue'

  const isModalOpen = ref(false)

  const store = useDiagramStore()
  const addElement = (type) => store.addElement(type)
</script>

<style lang="scss">
  .side-panel {
    position: relative;
    width: 16%;
    background: #f4f4f4;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    border-radius: 32px;
    margin-right: 15px;
  }
  button:disabled {
    background: rgb(74, 73, 73);
    cursor: not-allowed;
  }
  .ordinary-button{
    width: 90%;
    border-radius: 5px;
    background-color: #000000;
    color: #fff;
    padding: 5px 10px;
  }
  .ordinary-button:hover{
    background-color: #212020;
  }
  .convert{
    position: absolute;
    bottom: 10px;
    margin: 10px;
    width: 80%;
    background-color: #37133a;
    padding: 15px;
    border-radius: 16px;
    cursor: pointer;
    color: #fff;
  }
  .convert:hover{
    background-color: #4a124f;
  }
</style>
