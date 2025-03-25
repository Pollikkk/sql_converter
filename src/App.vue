<template>
  <div class="app-container">
    <!-- Боковая панель -->
    <SidePanel @drag-start="handleDragStart" />

    <!-- Основное поле для рисования -->
    <MainCanvas @drop="handleDrop" :items="canvasItems" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import SidePanel from './components/SidePanel.vue'
  import MainCanvas from './components/MainCanvas.vue'

  const canvasItems = ref([])

  // Обработчик начала перетаскивания
  const handleDragStart = (event, type) => {
    event.dataTransfer.setData('itemType', type)
  }

  // Обработчик дропа
  const handleDrop = (event) => {
    const type = event.dataTransfer.getData('itemType')
    const x = event.clientX
    const y = event.clientY

    canvasItems.value.push({ id: Date.now(), type, x, y })
  }
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
  }
  .app-container {
    display: flex;
    height: 95vh;
  }
</style>
