<template>
  <div class="side-panel">
    <h3>Сущности</h3>
    <h4>простая</h4>
    <button class="ordinary-button" @click="addElement()"><img src="../assets/buttons/table.svg" alt="Icon" width="auto" height="auto" /></button>
    <h4>составная</h4>
    <button class="ordinary-button" @click="addCompositeElement()"><img src="../assets/buttons/compositetable.svg" alt="Icon" width="auto" height="auto" /></button>
    <h3>Связи</h3>
    <!--<button class="ordinary-button" @click="store.isAddingRelation = !store.isAddingRelation;">
      <img src="../assets/buttons/relation.svg" alt="Icon" width="auto" height="auto" />
    </button>-->

    <div class="container-relation-buttons">
      <button class="ordinary-button" 
              :class="{ activeButton: oneToOneClicked }" 
              :disabled="store.activeSubTab !== null && activeMainTab !== '1-1'"
              @click="oneToOneClicked=!oneToOneClicked; toggleMainTab('1-1')">
        <img src="../assets/buttons/relations/relation-one-to-one-filled.svg" alt="Icon" width="auto" height="40px" />
      </button>
      <button class="ordinary-button" 
              :class="{ activeButton: oneToManyClicked }" 
              :disabled="store.activeSubTab !== null && activeMainTab !== '1-M'"
              @click="oneToManyClicked=!oneToManyClicked; toggleMainTab('1-M');">
        <img src="../assets/buttons/relations/relation-one-to-many-filled.svg" alt="Icon" width="auto" height="40px" />
      </button>
      <button class="ordinary-button" 
              :class="{ activeButton: manyToManyClicked }" 
              :disabled="store.activeSubTab !== null && activeMainTab !== 'M-M'"
              @click="manyToManyClicked=!manyToManyClicked; toggleMainTab('M-M');">
        <img src="../assets/buttons/relations/relation-many-to-many-filled.svg" alt="Icon" width="auto" height="40px" />
      </button>
    </div>

    <!-- Вложенные кнопки -->
    <div class="container-relation-buttons tab" v-if="activeMainTab === '1-1'">
      <button 
        class="ordinary-button" 
        :disabled="!!store.activeSubTab && store.activeSubTab !== '1to1'"
        @click="store.isAddingRelation = !store.isAddingRelation; selectSubTab('1to1'); store.relationType.first = '1'; store.relationType.second = '1';">
        <img src="../assets/buttons/relations/relation-one-to-one.svg" alt="Icon" width="auto" height="40px" />
      </button>
      <button 
        class="ordinary-button" 
        :disabled="!!store.activeSubTab && store.activeSubTab !== '1to01'"
        @click="selectSubTab('1to01'); store.isAddingRelation = !store.isAddingRelation; store.relationType.first = '1'; store.relationType.second = '0..1';">
        <img src="../assets/buttons/relations/relation-one-to-zero-or-one.svg" alt="Icon" width="auto" height="40px" />
      </button>
      <button 
        class="ordinary-button" 
        :disabled="!!store.activeSubTab && store.activeSubTab !== '01to01'"
        @click="selectSubTab('01to01'); store.isAddingRelation = !store.isAddingRelation; store.relationType.first = '0..1'; store.relationType.second = '0..1';">
        <img src="../assets/buttons/relations/relation-zero-or-one-to-zero-or-one.svg" alt="Icon" width="auto" height="40px" />
      </button>
    </div>

    <div class="container-relation-buttons tab" v-if="oneToManyClicked">
      <button 
        class="ordinary-button" 
        :disabled="!!store.activeSubTab && store.activeSubTab !== '1toM'"
        @click="selectSubTab('1toM'); store.isAddingRelation = !store.isAddingRelation; store.relationType.first = '1'; store.relationType.second = 'M';">
        <img src="../assets/buttons/relations/relation-one-to-many.svg" alt="Icon" width="auto" height="40px" />
      </button>
      <button 
        class="ordinary-button" 
        :disabled="!!store.activeSubTab && store.activeSubTab !== '01toM'"
        @click="selectSubTab('01toM'); store.isAddingRelation = !store.isAddingRelation; store.relationType.first = '0..1'; store.relationType.second = 'M';">
        <img src="../assets/buttons/relations/relation-zero-or-one-to-many.svg" alt="Icon" width="auto" height="40px" />
      </button>
    </div>

    <div class="container-relation-buttons tab" v-if="manyToManyClicked">
      <button 
        class="ordinary-button" 
        :disabled="!!store.activeSubTab && store.activeSubTab !== 'MtoM'"
        @click="selectSubTab('MtoM'); store.isAddingRelation = !store.isAddingRelation; store.relationType.first = 'M'; store.relationType.second = 'M';">
        <img src="../assets/buttons/relations/relation-many-to-many.svg" alt="Icon" width="auto" height="40px" />
      </button>
    </div>
    
    <!--<div class="type-of-relation" v-if="store.isAddingRelation">
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
    </div>-->

    <button class="convert" @click="store.convertToSql(); isModalOpen = true">sql-код</button>

    <ModalWindow :isOpen="isModalOpen" @close="isModalOpen = false" />
  </div>
</template>

<script setup>
  import { ref } from "vue"
  import { useDiagramStore } from "@/store/DiagramStore"
  import ModalWindow from '@/components/ModalWindow.vue'

  const activeMainTab = ref(null)        // '1-1' | '1-M' | 'M-M' | null
  //const activeSubTab = ref(null)         // '1to1' | '1to01' | '01to01' | '1toM' | '01toM' | 'MtoM' | null


  const isModalOpen = ref(false)
  const oneToOneClicked = ref(false)
  const oneToManyClicked = ref(false)
  const manyToManyClicked = ref(false)

  const store = useDiagramStore()
  const addElement = () => store.addElement()
  const addCompositeElement = () => store.addCompositeElement()

  function toggleMainTab(tab) {
    store.activeSubTab = null // сброс вложенного при переключении
    activeMainTab.value = activeMainTab.value === tab ? null : tab
  }

  function selectSubTab(subType) {
    store.activeSubTab = subType
    //activeMainTab.value = null
  }
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

  .activeButton{
    background-color: #4a124f;
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

.container-relation-buttons{
  display: flex;
  gap: 2px;
}


</style>
