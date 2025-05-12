<template>
  <div class="side-panel">
    <h3>Сущности</h3>
    <h4>простая</h4>
    <button class="ordinary-button" @click="addElement()"><img src="../assets/buttons/table.svg" alt="Icon" width="auto" height="auto" /></button>
    <h4>составная</h4>
    <button class="ordinary-button" @click="addCompositeElement()"><img src="../assets/buttons/compositetable.svg" alt="Icon" width="auto" height="auto" /></button>
    <h3>Связи</h3>
    <button class="ordinary-button" @click="store.isAddingRelation = !store.isAddingRelation;">
      <img src="../assets/buttons/relation.svg" alt="Icon" width="auto" height="auto" />
      {{ store.isAddingRelation ? 'Выход' : '' }}
    </button>
    <!--<button class="ordinary-button" @click="store.isAddingRelation = !store.isAddingRelation; store.relationType = '1:1'">
      {{ store.isAddingRelation ? 'Выход' : '1 : 1' }}
    </button>
    <button class="ordinary-button" @click="store.isAddingRelation = !store.isAddingRelation; store.relationType = '1:M'">
      {{ store.isAddingRelation ? 'Выход' : '1 : M' }}
    </button>-->

    <div class="type-of-relation" v-if="store.isAddingRelation">
      <div class="left-type">
        <label>Кардинальность начала:</label>
        <select v-model="store.relationType.first">
          <option value="1">1</option>
          <option value="0..1">0..1</option>
          <option value="M">M</option>
          <option value="0..M">0..M</option>
        </select>
      </div>
    
      <div class="right-type">
        <label>Кардинальность конца:</label>
        <select v-model="store.relationType.second">
          <option value="1">1</option>
          <option value="0..1">0..1</option>
          <option value="M">M</option>
          <option value="0..M">0..M</option>
        </select>
      </div>
    </div>

    <button class="convert" @click="store.convertToSql(); isModalOpen = true">sql-код</button>

    <ModalWindow :isOpen="isModalOpen" @close="isModalOpen = false" />
  </div>
</template>

<script setup>
  import { ref } from "vue"
  import { useDiagramStore } from "@/store/DiagramStore"
  import ModalWindow from '@/components/ModalWindow.vue'

  const isModalOpen = ref(false)

  const store = useDiagramStore()
  const addElement = () => store.addElement()
  const addCompositeElement = () => store.addCompositeElement()
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
    display: flex;
    align-items: center;
    justify-content:center
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

  .type-of-relation {
  //right: 20px;
  top: 40px;
  background: #f9f9f9;
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 8px;
  width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.type-of-relation label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
}

.type-of-relation select {
  width: 100%;
  margin-bottom: 12px;
}

.diamond-shape {
  width: 40px;
  height: 40px;
  background: #aaa;
  transform: rotate(45deg);
  margin: auto;
  margin-top: 10px;
}


</style>
