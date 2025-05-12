<template>
  <div class="app-container">
    <!-- Боковая панель -->
    <SidePanel />

    <!-- Основное поле для рисования -->
    <MainCanvas />
  </div>
</template>

<script setup>
  import SidePanel from './components/SidePanel.vue'
  import MainCanvas from './components/MainCanvas.vue'
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
