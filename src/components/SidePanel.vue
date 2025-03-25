<template>
  <div class="side-panel">
    <button class="ordinary-button" @click="addElement('table')">Добавить таблицу</button>
    <button class="ordinary-button" @click="store.addRelation()" :disabled="store.selectedElements.length !== 2">
      Добавить связь
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
    background: gray;
    cursor: not-allowed;
  }
  .ordinary-button{
    width: 90%;
    border-radius: 5px;
    background-color: #b9b9b9;
    padding: 5px 10px;
  }
  .ordinary-button:hover{
    background-color: #e3e3e3;
  }
  .convert{
    position: absolute;
    bottom: 10px;
    margin: 10px;
    width: 80%;
    background-color: #9cf7ff;
    padding: 15px;
    border-radius: 16px;
    cursor: pointer;
  }
  .convert:hover{
    background-color: #c6f9ff;
  }
</style>
